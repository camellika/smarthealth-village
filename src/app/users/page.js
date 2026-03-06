import { getUsers } from "@/services/userServices";

export default async function UserPage() {

  const users = await getUsers();

  return (
    <div>
      <h1>Data User</h1>

      <table border="1">
        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Role</th>
          </tr>
        </thead>

        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.username}</td>
              <td>{user.role}</td>
            </tr>
          ))}
        </tbody>

      </table>
    </div>
  );
}