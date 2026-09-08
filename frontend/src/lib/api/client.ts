import { getAccessToken } from '@/lib/auth/tokens';

export function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return 'Something went wrong';
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  isFormData?: boolean;
}

export async function apiRequest<T = any>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const token = getAccessToken();
  const headers: Record<string, string> = {};
  if (!options.isFormData) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(path, {
      method: options.method || 'GET',
      headers,
      body: options.isFormData
        ? (options.body as FormData)
        : options.body !== undefined
          ? JSON.stringify(options.body)
          : undefined,
    });
  } catch {
    throw new Error('Network error');
  }

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const message = data?.message || 'Request failed';
    throw new Error(message);
  }

  return data;
}
