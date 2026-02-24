import {
  browserSupportsWebAuthn,
  startAuthentication,
  startRegistration,
} from '@simplewebauthn/browser';

export function isWebAuthnSupported(): boolean {
  return browserSupportsWebAuthn();
}

function normalizeWebAuthnError(error: unknown): Error {
  if (error instanceof Error) {
    if (error.name === 'NotAllowedError') {
      return new Error('Passkey operation was canceled or timed out.');
    }

    if (error.name === 'InvalidStateError') {
      return new Error('This passkey is already registered on this device.');
    }

    return error;
  }

  return new Error('WebAuthn operation failed.');
}

export function assertWebAuthnSupport(): void {
  if (!isWebAuthnSupported()) {
    throw new Error('This browser does not support passkeys/WebAuthn for this demo.');
  }
}

export async function runRegistration(options: unknown): Promise<Record<string, unknown>> {
  try {
    const response = await startRegistration({
      optionsJSON: options as Parameters<typeof startRegistration>[0]['optionsJSON'],
    });

    return response as unknown as Record<string, unknown>;
  } catch (error) {
    throw normalizeWebAuthnError(error);
  }
}

export async function runAuthentication(options: unknown): Promise<Record<string, unknown>> {
  try {
    const response = await startAuthentication({
      optionsJSON: options as Parameters<typeof startAuthentication>[0]['optionsJSON'],
    });

    return response as unknown as Record<string, unknown>;
  } catch (error) {
    throw normalizeWebAuthnError(error);
  }
}
