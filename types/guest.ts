// types/guest.ts
export interface Guest {
  id: string;
  full_name: string;
  document?: string;
  email?: string; // ← NOVO
  created_at: string;
}