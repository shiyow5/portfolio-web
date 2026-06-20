export interface ContactPayload {
  name: string;
  email: string;
  message: string;
}

export interface ContactResult {
  ok: boolean;
  error?: string;
}

const CONTACT_ENDPOINT = '/api/contact';

/**
 * POSTs the contact form to /api/contact and normalises the response into a
 * simple { ok, error } result. Never throws — network/parse failures become
 * a friendly error string for the UI.
 */
export async function submitContact(
  payload: ContactPayload,
  turnstileToken?: string,
): Promise<ContactResult> {
  let res: Response;
  try {
    res = await fetch(CONTACT_ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...payload, turnstileToken }),
    });
  } catch {
    return { ok: false, error: 'ネットワークエラーが発生しました。接続を確認してください' };
  }

  let data: { ok?: boolean; error?: string } = {};
  try {
    data = (await res.json()) as { ok?: boolean; error?: string };
  } catch {
    // non-JSON body — fall through to status-based error
  }

  if (res.ok && data.ok) return { ok: true };
  return { ok: false, error: data.error ?? `送信に失敗しました (HTTP ${res.status})` };
}
