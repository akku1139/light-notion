const TOKEN_KEY = 'notion_api_token';
const DATABASE_KEY = 'notion_database_id';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function getDatabaseId(): string | null {
  return localStorage.getItem(DATABASE_KEY);
}

export function setDatabaseId(id: string): void {
  localStorage.setItem(DATABASE_KEY, id);
}

export function removeDatabaseId(): void {
  localStorage.removeItem(DATABASE_KEY);
}

export function isAuthenticated(): boolean {
  return !!getToken();
}
