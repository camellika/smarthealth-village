"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

/*
REGISTER USER
*/

export async function register(data) {

  const existingUser = await prisma.user.findUnique({
    where: {
      username: data.username
    }
  });

  if (existingUser) {
    throw new Error("Username sudah digunakan");
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const user = await prisma.user.create({
    data: {
      username: data.username,
      password: hashedPassword,
      role: data.role || "user",
      balitaId: data.balitaId ? Number(data.balitaId) : null,
      lansiaId: data.lansiaId ? Number(data.lansiaId) : null
    }
  });

  return {
    id: user.id,
    username: user.username,
    role: user.role
  };
}


/*
LOGIN USER
*/

export async function login(data) {

  const user = await prisma.user.findUnique({
    where: {
      username: data.username
    }
  });

  if (!user) {
    throw new Error("Username tidak ditemukan");
  }

  const validPassword = await bcrypt.compare(
    data.password,
    user.password
  );

  if (!validPassword) {
    throw new Error("Password salah");
  }

  return {
    id: user.id,
    username: user.username,
    role: user.role,
    balitaId: user.balitaId,
    lansiaId: user.lansiaId
  };
}
//g3ehwj5e