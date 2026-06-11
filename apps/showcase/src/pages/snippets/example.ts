export interface User {
  id: number;
  name: string;
  email: string;
}

// #region fetch-user
export async function fetchUser(id: number): Promise<User> {
  const res = await fetch(`/api/users/${id}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<User>;
}
// #endregion fetch-user

// #region greet
export function greet(user: User): string {
  return `Hello, ${user.name}!`;
}
// #endregion greet
