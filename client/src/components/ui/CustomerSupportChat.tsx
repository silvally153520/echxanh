import { FormEvent, useEffect, useRef, useState } from 'react';
import { Bot, CalendarCheck, ChevronDown, Headphones, MessageCircle, Send, Trash2, X } from 'lucide-react';
import { supportApi } from '../../services/api';

type ChatMessage = {
  id: number;
  role: 'assistant' | 'customer';
  text: string;
};

const welcomeMessage: ChatMessage = {
  id: 0,
  role: 'assistant',
  text: 'Xin chào! Mình là trợ lý sieuechxanh. Mình có thể giúp bạn tìm phòng, hướng dẫn đặt phòng hoặc tra cứu đơn hàng.',
};

const quickQuestions = [
  { label: 'Tìm phòng', message: 'Tôi muốn tìm phòng', icon: MessageCircle },
  { label: 'Cách đặt phòng', message: 'Hướng dẫn cách đặt phòng', icon: CalendarCheck },
  { label: 'Tra cứu đơn', message: 'Tôi muốn xem đơn đặt phòng', icon: Headphones },
];

export const CustomerSupportChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([welcomeMessage]);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const nextId = useRef(1);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      inputRef.current?.focus();
    }
  }, [isOpen, messages, isSending]);

  useEffect(() => {
    if (!isOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [isOpen]);

  const sendMessage = async (value: string) => {
    const text = value.trim();
    if (!text || isSending) return;

    const customerMessage: ChatMessage = { id: nextId.current++, role: 'customer', text };
    const conversation = [
      ...messages.filter(message => message.id !== 0).map(message => ({
        role: message.role === 'customer' ? 'user' as const : 'assistant' as const,
        content: message.text,
      })),
      { role: 'user' as const, content: text },
    ].slice(-10);

    setMessages(current => [...current, customerMessage]);
    setDraft('');
    setIsSending(true);

    try {
      const { data } = await supportApi.chat(conversation);
      setMessages(current => [...current, {
        id: nextId.current++,
        role: 'assistant',
        text: data.reply,
      }]);
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : 'Trợ lý AI hiện không kết nối được. Vui lòng thử lại sau.';
      setMessages(current => [...current, {
        id: nextId.current++,
        role: 'assistant',
        text: `${errorMessage} Bạn có thể thử lại sau hoặc tiếp tục tìm chỗ nghỉ trên trang web.`,
      }]);
    } finally {
      setIsSending(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void sendMessage(draft);
  };

  const resetChat = () => {
    if (isSending) return;
    setMessages([welcomeMessage]);
    setDraft('');
    nextId.current = 1;
  };

  return (
    <div className="fixed bottom-5 right-4 z-[60] flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {isOpen && (
        <section
          id="support-chat"
          role="dialog"
          aria-labelledby="support-chat-title"
          className="flex h-[min(34rem,calc(100dvh-7rem))] w-[min(24rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl animate-slide-up"
        >
          <header className="flex items-center justify-between bg-primary-700 px-4 py-4 text-white">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15">
                <Bot className="h-6 w-6" aria-hidden="true" />
              </span>
              <div>
                <h2 id="support-chat-title" className="font-semibold">Trợ lý sieuechxanh</h2>
                <p className="mt-0.5 text-xs text-primary-100">AI tự động · Không gửi thông tin nhạy cảm</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={resetChat}
                disabled={isSending}
                className="rounded-lg p-2 text-white/80 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
                aria-label="Làm mới cuộc trò chuyện"
                title="Làm mới cuộc trò chuyện"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-2 text-white/80 transition hover:bg-white/10 hover:text-white"
                aria-label="Đóng chat"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </header>

          <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50 p-4" aria-live="polite">
            {messages.map(message => (
              <div key={message.id} className={`flex ${message.role === 'customer' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[88%] rounded-2xl px-3.5 py-3 text-sm leading-relaxed ${
                  message.role === 'customer'
                    ? 'rounded-br-md bg-primary-600 text-white'
                    : 'rounded-bl-md border border-slate-100 bg-white text-slate-700 shadow-sm'
                }`}>
                  <p className="whitespace-pre-wrap">{message.text}</p>
                </div>
              </div>
            ))}

            {isSending && (
              <div className="flex justify-start" role="status" aria-label="Trợ lý đang trả lời">
                <div className="rounded-2xl rounded-bl-md border border-slate-100 bg-white px-3.5 py-3 text-sm text-slate-500 shadow-sm">
                  Đang soạn câu trả lời...
                </div>
              </div>
            )}

            {messages.length === 1 && (
              <div className="space-y-2 pl-1">
                <p className="text-xs font-medium text-slate-500">Chủ đề phổ biến</p>
                {quickQuestions.map(({ label, message, icon: Icon }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => void sendMessage(message)}
                    disabled={isSending}
                    className="flex w-full items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700 disabled:opacity-50"
                  >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    {label}
                  </button>
                ))}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-slate-200 bg-white p-3">
            <label htmlFor="support-chat-input" className="sr-only">Nhập nội dung cần hỗ trợ</label>
            <input
              ref={inputRef}
              id="support-chat-input"
              value={draft}
              onChange={event => setDraft(event.target.value)}
              placeholder="Nhập câu hỏi của bạn..."
              className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-100"
              autoComplete="off"
              maxLength={1000}
              disabled={isSending}
            />
            <button
              type="submit"
              disabled={!draft.trim() || isSending}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-600 text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Gửi tin nhắn"
            >
              <Send className="h-4 w-4" aria-hidden="true" />
            </button>
          </form>
        </section>
      )}

      <button
        type="button"
        onClick={() => setIsOpen(open => !open)}
        className="group flex items-center gap-2 rounded-full bg-primary-600 px-4 py-3.5 text-white shadow-lg transition hover:bg-primary-700 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-primary-200"
        aria-label={isOpen ? 'Thu nhỏ khung chat' : 'Mở chat hỗ trợ'}
        aria-expanded={isOpen}
        aria-controls="support-chat"
      >
        {isOpen ? <ChevronDown className="h-5 w-5" aria-hidden="true" /> : <MessageCircle className="h-5 w-5" aria-hidden="true" />}
        <span className="text-sm font-semibold">Hỗ trợ</span>
      </button>
    </div>
  );
};
