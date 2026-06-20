import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Contact } from './Contact';

afterEach(() => {
  vi.unstubAllGlobals();
});

function mockFetch(response: { ok: boolean; status: number; body: unknown }) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({
      ok: response.ok,
      status: response.status,
      json: async () => response.body,
    })),
  );
}

async function fillForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/name/i), 'Taro');
  await user.type(screen.getByLabelText(/email/i), 'taro@example.com');
  await user.type(screen.getByLabelText(/message/i), 'AI エージェントの相談です');
}

describe('Contact route', () => {
  it('renders the form fields', () => {
    render(<Contact />);
    expect(screen.getByRole('heading', { level: 1, name: /相談する/ })).toBeInTheDocument();
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /送信する/ })).toBeInTheDocument();
  });

  it('shows a success state after a successful submit', async () => {
    mockFetch({ ok: true, status: 200, body: { ok: true } });
    const user = userEvent.setup();
    render(<Contact />);
    await fillForm(user);
    await user.click(screen.getByRole('button', { name: /送信する/ }));
    await waitFor(() => expect(screen.getByText(/送信しました/)).toBeInTheDocument());
  });

  it('shows the server error message when submit fails', async () => {
    mockFetch({ ok: false, status: 503, body: { error: 'お問い合わせ窓口が未設定です' } });
    const user = userEvent.setup();
    render(<Contact />);
    await fillForm(user);
    await user.click(screen.getByRole('button', { name: /送信する/ }));
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(/未設定/));
  });
});
