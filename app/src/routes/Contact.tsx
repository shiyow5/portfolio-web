import { useState, type FormEvent, type ReactNode } from 'react';
import { submitContact } from '../lib/contact';
import { useTurnstile } from '../lib/turnstile';

const X_URL = 'https://x.com/twinS_KNSN1415';

type Status = 'idle' | 'sending' | 'success' | 'error';

const INPUT_CLASS =
  'w-full bg-surface border-2 border-outline px-3 py-2 text-base focus:border-primary focus:border-4 outline-none transition-all';

export function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');
  const { containerRef, token, enabled } = useTurnstile();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (status === 'sending') return;
    setStatus('sending');
    setError('');
    const result = await submitContact(
      { name: name.trim(), email: email.trim(), message: message.trim() },
      token,
    );
    if (result.ok) {
      setStatus('success');
    } else {
      setStatus('error');
      setError(result.error ?? '送信に失敗しました');
    }
  };

  return (
    <section className="max-w-[720px] mx-auto px-6 py-12 md:py-16">
      <header className="mb-8">
        <div className="inline-block bg-tertiary-container px-5 py-1.5 border-4 border-tertiary mb-4">
          <span className="font-black text-on-tertiary-container uppercase tracking-tighter text-sm">
            Send a Quest · Contact
          </span>
        </div>
        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-on-surface leading-none">
          相談する
        </h1>
        <p className="mt-4 text-on-surface-variant">
          AI / LLM・エージェント・ML の実装のご相談、コラボ、採用のお問い合わせはこちらから。{' '}
          <a
            href={X_URL}
            target="_blank"
            rel="noreferrer"
            className="link-wipe text-primary font-black"
          >
            X (@twinS_KNSN1415)
          </a>{' '}
          でも受け付けています。
        </p>
      </header>

      {status === 'success' ? (
        <div className="pixel-border bg-secondary-container p-8 text-center" role="status">
          <h2 className="text-2xl font-black uppercase text-on-secondary-container mb-2">
            送信しました
          </h2>
          <p className="text-on-secondary-container">
            メッセージを受け取りました。返信までしばらくお待ちください。
          </p>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="pixel-border bg-surface-container-lowest p-6 md:p-8 space-y-5"
        >
          <Field label="お名前 / Name">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={100}
              autoComplete="name"
              className={INPUT_CLASS}
            />
          </Field>
          <Field label="メール / Email">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              maxLength={200}
              autoComplete="email"
              className={INPUT_CLASS}
            />
          </Field>
          <Field label="メッセージ / Message">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              maxLength={2000}
              rows={6}
              className={`${INPUT_CLASS} resize-y`}
            />
          </Field>

          {enabled && <div ref={containerRef} className="min-h-[65px]" />}

          {status === 'error' && (
            <p
              role="alert"
              className="text-sm font-black text-on-error bg-error-container border-2 border-error px-3 py-2"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={status === 'sending'}
            className="pixel-button w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === 'sending' ? '送信中…' : '送信する'}
          </button>
        </form>
      )}
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[11px] font-black uppercase tracking-widest text-tertiary mb-2">
        {label}
      </span>
      {children}
    </label>
  );
}
