"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, X } from "lucide-react";

type NoticeToastProps = {
  message: string;
  title: string;
};

export function NoticeToast({ message, title }: NoticeToastProps) {
  const [visible, setVisible] = useState(Boolean(message));

  useEffect(() => {
    setVisible(Boolean(message));
    if (!message) return;

    const url = new URL(window.location.href);
    if (url.searchParams.has("notice")) {
      url.searchParams.delete("notice");
      window.history.replaceState(
        window.history.state,
        "",
        `${url.pathname}${url.search}${url.hash}`,
      );
    }

    const timeoutId = window.setTimeout(() => {
      setVisible(false);
    }, 5200);

    return () => window.clearTimeout(timeoutId);
  }, [message]);

  if (!message || !visible) return null;

  return (
    <div className="notice-toast" role="status" aria-live="polite">
      <span className="notice-toast-icon" aria-hidden="true">
        <CheckCircle2 size={19} />
      </span>
      <span className="notice-toast-copy">
        <strong>{title}</strong>
        <span>{message}</span>
      </span>
      <button
        className="notice-toast-close"
        type="button"
        aria-label="Fechar notificação"
        onClick={() => setVisible(false)}
      >
        <X size={15} aria-hidden="true" />
      </button>
    </div>
  );
}
