import { Note } from "@common/types/Note";
import { ReportData } from "@common/types/ReportData";
import type { TenantUser } from "@common/types/TenantUser";
import { fetchAuthSession } from "aws-amplify/auth";

const apiUrl = `https://api.${import.meta.env.VITE_DOMAIN_NAME}`;

async function getAuthHeaders(): Promise<Record<string, string>> {
  const authSession = await fetchAuthSession();
  const jwt = authSession.tokens?.accessToken?.toString();
  if (!jwt) return {};
  return {
    Authorization: `Bearer ${jwt}`,
  };
}


async function get<T>(path: string) {
  const headers: Record<string, string> = await getAuthHeaders();

  const response = await fetch(`${apiUrl}${path}`, {
    method: 'GET',
    headers
  });

  if (!response.ok) {
    throw new Error(`Failed to GET from ${path}`);
  }
  return await response.json() as T;
}

async function send<T>(path: string, body: T, method: 'PUT' | 'POST' = 'POST') {
  const headers: Record<string, string> = await getAuthHeaders();

  const response = await fetch(`${apiUrl}${path}`, {
    method,
    body: JSON.stringify(body),
    headers
  });

  if (!response.ok) {
    throw new Error(`Failed to ${method} to ${path}`);
  }
}

export function fetchUsersInTenant() {
  return get<TenantUser[]>('/users');
};

export function fetchAllNotes() {
  return get<Note[]>('/notes');
};

export function fetchReportData() {
  return get<ReportData>('/reports');
};

export function upsertNote(note: Note) {
  return send(`/notes/${note.id}`, note, 'PUT');
};

export function createTenantUser(user: TenantUser) {
  return send(`/users`, user, 'POST');
};
