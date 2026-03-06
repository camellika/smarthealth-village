"use client";

import { useState } from "react";
import { register } from "@/services/authService";

export default function RegisterPage() {

  const [form, setForm] = useState({
    username: "",
    password: "",
    role: "user"
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {

      await register(form);

      setMessage("Register berhasil!");

      setForm({
        username: "",
        password: "",
        role: "user"
      });

    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <div style={{ padding: "40px" }}>

      <h2>Register User</h2>

      <form onSubmit={handleSubmit}>

        <div>
          <label>Username</label>
          <br />
          <input
            type="text"
            name="username"
            value={form.username}
            onChange={handleChange}
            required
          />
        </div>

        <br />

        <div>
          <label>Password</label>
          <br />
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>

        <br />

        <div>
          <label>Role</label>
          <br />
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <br />

        <button type="submit">
          Register
        </button>

      </form>

      <p>{message}</p>

    </div>
  );
}