import type { ApiError, Passkey, User } from '../types/domain';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '/api';

class HttpError extends Error {
  public readonly status: number;
  public readonly payload: ApiError;

  public constructor(status: number, payload: ApiError) {
    super(payload.message);
    this.status = status;
    this.payload = payload;
  }
}

async function request<TResponse>(path: string, init?: RequestInit): Promise<TResponse> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  const contentType = response.headers.get('content-type') ?? '';
  const hasJson = contentType.includes('application/json');

  if (!response.ok) {
    const fallback: ApiError = {
      code: 'HTTP_ERROR',
      message: `Request failed with status ${response.status}`,
    };

    const payload = hasJson
      ? ((await response.json()) as Partial<ApiError>)
      : fallback;

    throw new HttpError(response.status, {
      code: payload.code ?? fallback.code,
      message: payload.message ?? fallback.message,
      details: payload.details,
    });
  }

  if (!hasJson) {
    return undefined as TResponse;
  }

  return (await response.json()) as TResponse;
}

export function toReadableError(error: unknown): string {
  if (error instanceof HttpError) {
    return error.payload.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Unexpected error';
}

export interface RegistrationOptionsResult {
  challengeId: string;
  options: Record<string, unknown>;
}

export interface AuthenticationOptionsResult {
  challengeId: string;
  options: Record<string, unknown>;
}

export interface MeResponse {
  authenticated: boolean;
  user: User | null;
}

export interface DeletePasskeyResponse {
  accountDeleted: boolean;
}

export const api = {
  startRegistration(payload: {
    username: string;
    label: string;
    flow: 'passkey-only' | 'username-passkey';
  }): Promise<RegistrationOptionsResult> {
    return request('/auth/register/options', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  finishRegistration(payload: { challengeId: string; response: Record<string, unknown> }): Promise<{ user: User }> {
    return request('/auth/register/verify', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  startLogin(payload: {
    flow: 'passkey-only' | 'username-passkey';
    username?: string;
  }): Promise<AuthenticationOptionsResult> {
    return request('/auth/login/options', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  finishLogin(payload: { challengeId: string; response: Record<string, unknown> }): Promise<{ user: User }> {
    return request('/auth/login/verify', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  me(): Promise<MeResponse> {
    return request('/session/me', {
      method: 'GET',
    });
  },

  logout(): Promise<{ ok: boolean }> {
    return request('/session/logout', {
      method: 'POST',
      body: JSON.stringify({}),
    });
  },

  listPasskeys(): Promise<{ passkeys: Passkey[] }> {
    return request('/passkeys', {
      method: 'GET',
    });
  },

  startAddPasskey(payload: { label: string }): Promise<RegistrationOptionsResult> {
    return request('/passkeys/add/options', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  finishAddPasskey(payload: { challengeId: string; response: Record<string, unknown> }): Promise<{ passkey: Passkey }> {
    return request('/passkeys/add/verify', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  deletePasskey(passkeyId: string): Promise<DeletePasskeyResponse> {
    return request(`/passkeys/${passkeyId}`, {
      method: 'DELETE',
    });
  },

  resetDemoData(): Promise<{ ok: boolean; message: string }> {
    return request('/dev/reset', {
      method: 'POST',
      body: JSON.stringify({}),
    });
  },
};
