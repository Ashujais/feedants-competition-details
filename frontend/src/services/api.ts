import type { Competition } from '../types';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://10.0.2.2:4000/api';
export const COMPETITION_ID = process.env.EXPO_PUBLIC_COMPETITION_ID ?? '66f000000000000000000001';
export const DEMO_USER_ID = process.env.EXPO_PUBLIC_DEMO_USER_ID ?? '66f000000000000000000101';

type ApiResponse<T> = { data: T };

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) throw new Error(payload?.error?.message ?? 'Unable to connect to Feedants');
  return (payload as ApiResponse<T>).data;
}

export const competitionApi = {
  get: () => request<Competition>(`/competitions/${COMPETITION_ID}?userId=${DEMO_USER_ID}`),
  register: () =>
    request(`/competitions/${COMPETITION_ID}/register`, {
      method: 'POST',
      body: JSON.stringify({ userId: DEMO_USER_ID }),
    }),
  submit: (title: string, mediaUrl: string) =>
    request(`/competitions/${COMPETITION_ID}/submission`, {
      method: 'POST',
      body: JSON.stringify({ userId: DEMO_USER_ID, title, mediaUrl }),
    }),
};
