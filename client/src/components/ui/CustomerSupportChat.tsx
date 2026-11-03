import { FormEvent, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bot, CalendarCheck, ChevronDown, Headphones, MessageCircle, Send, Trash2, X } from 'lucide-react';

type ChatMessage = {
  id: number;
  role: 'assistant' | 'customer';
  text: string;
  action?: {
    label: string;
    href: string;
  };
};

const welcomeMessage: ChatMessage = {
  id: 0,
  role: 'assistant',
  text: 'Xin chào! Mình là trợ lý sieuechxanh. Mình có thể giúp bạn tìm phòng, đặt phòng hoặc tra cứu đơn hàng.',
};

const quickQuestions = [
  { label: 'Tìm phòng', message: 'Tôi muốn tìm phòng', icon: MessageCircle },
  { label: 'Cách đặt phòng', message: 'Hướng dẫn cách đặt phòng', icon: CalendarCheck },
  { label: 'Tra cứu đơn', message: 'Tôi muốn xem đơn đặt phòng', icon: Headphones },
];

const normalize = (value: string) =>
  value.toLocaleLowerCase('vi').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd');

const getReply = (message: string): Omit<ChatMessage, 'id' | 'role'> => {
  const text = normalize(message);

  if (/\b(chao|xin chao|hello|hi)\b/.test(text)) {
    return { text: 'Xin chào bạn! Bạn đang cần hỗ trợ tìm phòng, đặt phòng hay quản lý đơn đặt phòng?' };
  }

  if (/(hoan tien|huy.*(phong|don|dat)|doi lich|doi ngay|chinh sach huy)/.test(text)) {
    return {
      text: 'Bạn có thể xem và gửi yêu cầu hủy đơn trong mục Đặt phòng của tôi. Điều kiện hoàn tiền có thể tùy thuộc vào từng chỗ nghỉ; nếu cần tư vấn thêm, hãy liên hệ đội ngũ hỗ trợ.',
      action: { label: 'Đến đơn đặt phòng', href: '/dashboard' },
    };
  }

  if (/(don dat|ma don|tra cuu|kiem tra don|xem don|trang thai don)/.test(text)) {
    return {
      text: 'Đăng nhập để xem danh sách đơn, trạng thái và thông tin chi tiết chuyến đi của bạn.',
      action: { label: 'Xem đơn đặt phòng', href: '/dashboard' },
    };
  }

  if (/(gia|bao nhieu|thanh toan|chi phi|phi dich vu)/.test(text)) {
    return {
      text: 'Giá mỗi đêm được hiển thị trên trang chi tiết chỗ nghỉ. Bạn hãy chọn ngày nhận/trả phòng để xem tổng tiền trước khi gửi yêu cầu đặt phòng.',
      action: { label: 'Khám phá chỗ nghỉ', href: '/properties' },
    };
  }

  if (/(dat phong|huong dan dat|cach dat|book)/.test(text)) {
    return {
      text: 'Bạn chọn chỗ nghỉ phù hợp, nhập ngày nhận/trả phòng cùng số khách rồi nhấn “Đặt phòng”. Nếu chưa đăng nhập, hệ thống sẽ hướng dẫn bạn đăng nhập trước.',
      action: { label: 'Bắt đầu tìm phòng', href: '/properties' },
    };
  }

  if (/(tim phong|khach san|homestay|resort|biet thu|cho nghi|phong o)/.test(text)) {
    return {
      text: 'Mở trang tìm phòng để xem các chỗ nghỉ, lọc theo địa điểm, ngày lưu trú và nhu cầu của bạn.',
      action: { label: 'Tìm chỗ nghỉ', href: '/properties' },
    };
  }

  if (/(dang nhap|tai khoan|mat khau|quen mat khau)/.test(text)) {
    return {
      text: 'Bạn có thể đăng nhập hoặc tạo tài khoản để quản lý thông tin cá nhân và các đơn đặt phòng.',
      action: { label: 'Đăng nhập', href: '/login' },
    };
  }

  if (/(lien he|nhan vien|tu van|ho tro|gap nguoi|hotline|dien thoai|email)/.test(text)) {
    return {
      text: 'Đội ngũ hỗ trợ sẵn sàng giúp bạn. Gọi 1900 123 456 hoặc gửi email đến support@localvibe.vn.',
      action: { label: 'Gọi hỗ trợ', href: 'tel:1900123456' },
    };
  }

  return {
    text: 'Mình có thể hỗ trợ tìm chỗ nghỉ, hướng dẫn đặt phòng, tra cứu đơn hoặc kết nối bạn với đội ngũ hỗ trợ. Bạn muốn hỏi về nội dung nào?',
  };
};

export const CustomerSupportChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([welcomeMessage]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const nextId = useRef(1);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      inputRef.current?.focus();
    }
  }, [isOpen, messages]);

  useEffect(() => {
    if (!isOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [isOpen]);

  const sendMessage = (value: string) => {
    const text = value.trim();
    if (!text) return;

    const customerMessage: ChatMessage = { id: nextId.current++, role: 'customer', text };
    const reply = getReply(text);
    const assistantMessage: ChatMessage = { id: nextId.current++, role: 'assistant', ...reply };
    setMessages(current => [...current, customerMessage, assistantMessage]);
    setDraft('');
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    sendMessage(draft);
  };

  const resetChat = () => {
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
                <p className="mt-0.5 text-xs text-primary-100">Hỗ trợ tự động · Luôn sẵn sàng</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={resetChat}
                className="rounded-lg p-2 text-white/80 transition hover:bg-white/10 hover:text-white"
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
                  <p>{message.text}</p>
                  {message.action && (
                    message.action.href.startsWith('/') ? (
                      <Link
                        to={message.action.href}
                        onClick={() => setIsOpen(false)}
                        className="mt-3 inline-flex items-center rounded-lg bg-primary-50 px-3 py-2 text-xs font-semibold text-primary-700 transition hover:bg-primary-100"
                      >
                        {message.action.label}
                      </Link>
                    ) : (
                      <a
                        href={message.action.href}
                        className="mt-3 inline-flex items-center rounded-lg bg-primary-50 px-3 py-2 text-xs font-semibold text-primary-700 transition hover:bg-primary-100"
                      >
                        {message.action.label}
                      </a>
                    )
                  )}
                </div>
              </div>
            ))}

            {messages.length === 1 && (
              <div className="space-y-2 pl-1">
                <p className="text-xs font-medium text-slate-500">Chủ đề phổ biến</p>
                {quickQuestions.map(({ label, message, icon: Icon }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => sendMessage(message)}
                    className="flex w-full items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700"
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
            />
            <button
              type="submit"
              disabled={!draft.trim()}
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
