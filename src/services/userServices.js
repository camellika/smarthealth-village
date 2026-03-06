"use server";

import prisma from "@/lib/prisma";


export async function getUsers() {
  return await prisma.user.findMany({
    include: {
      balita: true,
      lansia: true
    }
  });
}

export async function getUserById(id) {
  return await prisma.user.findUnique({
    where: { id: Number(id) }
  });
}

export async function createUser(data) {
  return await prisma.user.create({
    data: {
      username: data.username,
      password: data.password,
      role: data.role,
      balitaId: data.balitaId ? Number(data.balitaId) : null,
      lansiaId: data.lansiaId ? Number(data.lansiaId) : null
    }
  });
}

export async function updateUser(id, data) {
  return await prisma.user.update({
    where: { id: Number(id) },
    data
  });
}

export async function deleteUser(id) {
  return await prisma.user.delete({
    where: { id: Number(id) }
  });
}