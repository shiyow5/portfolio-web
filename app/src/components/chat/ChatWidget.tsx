import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Send, X } from 'lucide-react';
import { PixelCharacter } from '../pixel/PixelCharacter';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Floating chat widget — placeholder for the future clone-agent.
 * Phase 1: local echo only. Phase 2: wires to /api/chat (Gemini via Pages Functions).
 */
export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'greeting',
      role: 'assistant',
      content: 'Hey Traveler! この旅人ボットはまだ準備中。もうすぐ本物のクローンエージェントと話せるようになります。',
    },
  ]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: trimmed,
    };
    const stubReply: Message = {
      id: `a-${Date.now()}`,
      role: 'assistant',
      content: '（ここにクローンエージェントの返答が入ります。現在は Phase 1 スタブです）',
    };
    setMessages((prev) => [...prev, userMsg, stubReply]);
    setInput('');
  };

  return (
    <>
      {/* FAB + bubble hint */}
      <div className="fixed bottom-8 right-8 flex flex-col items-end gap-3 z-[90]">
        <AnimatePresence>
          {!open && (
            <motion.div
              key="bubble"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="pixel-border bg-surface-container-lowest p-3 max-w-[220px]"
            >
              <p className="text-[11px] font-black uppercase text-on-surface leading-snug">
                Hey Traveler! 何か聞いてみる?
              </p>
              <div className="absolute -bottom-2 right-6 w-4 h-4 bg-surface-container-lowest border-r-4 border-b-4 border-tertiary rotate-45" />
            </motion.div>
          )}
        </AnimatePresence>

        <button
          type="button"
          aria-label={open ? 'Close chat' : 'Open chat'}
          onClick={() => setOpen((v) => !v)}
          className="relative w-16 h-16 bg-tertiary-container border-4 border-tertiary shadow-[4px_4px_0_0_rgba(126,87,46,0.25)] flex items-center justify-center hover:-translate-y-1 transition-transform"
        >
          {open ? (
            <X size={28} className="text-tertiary" />
          ) : (
            <div className="pointer-events-none">
              <PixelCharacter scale={2} animation="idle" ariaLabel="Chat" />
            </div>
          )}
        </button>
      </div>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-28 right-8 z-[91] w-[360px] max-w-[calc(100vw-2rem)] h-[460px] bg-surface-container-lowest border-4 border-tertiary shadow-[4px_4px_0_0_rgba(126,87,46,0.25)] flex flex-col"
          >
            <div className="flex items-center justify-between border-b-4 border-tertiary bg-tertiary-container px-4 py-2">
              <span className="font-black uppercase text-xs tracking-widest text-on-tertiary-container">
                Companion · Clone v0
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="text-tertiary hover:text-error"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4 space-y-3">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}
                >
                  <div
                    className={[
                      'max-w-[85%] p-3 text-sm leading-relaxed border-4',
                      m.role === 'user'
                        ? 'bg-primary-container border-primary text-on-primary-container'
                        : 'bg-surface-container-low border-outline-variant text-on-surface',
                    ].join(' ')}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-2 border-t-4 border-tertiary p-3 bg-surface-container-low"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="メッセージを入力..."
                className="flex-1 bg-surface-container-lowest border-2 border-outline px-3 py-2 text-sm focus:border-primary focus:border-4 outline-none transition-all"
                maxLength={500}
              />
              <button
                type="submit"
                aria-label="Send"
                className="pixel-button"
                disabled={!input.trim()}
              >
                <Send size={14} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
