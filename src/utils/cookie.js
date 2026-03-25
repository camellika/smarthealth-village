import { cookies } from "next/headers"

export async function getToken() {
  const cookieStore = await cookies() // harus await
  return cookieStore.get("token")?.value
}