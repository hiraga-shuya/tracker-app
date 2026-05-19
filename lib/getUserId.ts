import { cookies } from "next/headers";

export async function getUserId() {
  const cookieStore = await cookies();
  return cookieStore.get("userId")?.value;
}
