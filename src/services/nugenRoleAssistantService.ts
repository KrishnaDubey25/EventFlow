import type { UserRole } from '../types/auth';
import { safeJsonFetch } from './safeJsonFetch';

export type RoleAssistantMessage = { role: 'user' | 'assistant'; content: string };

export async function askNugenRoleAssistant(input: {
  role: UserRole;
  question: string;
  context: unknown;
  history?: RoleAssistantMessage[];
}) {
  return safeJsonFetch<{ answer: string; provider: string; aligned: boolean; modelId?: string }>('/api/nugen/chat', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input),
  });
}
