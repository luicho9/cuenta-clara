"use client";

import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

interface ChatItem {
  label: string;
  amount: number;
}

interface ChatMessage {
  id: string;
  from: "owner" | "cuenta_clara";
  variant: "voice" | "text" | "card" | "pnl";
  text: string;
  duration?: string;
  items?: ChatItem[];
  totals?: { ventas: number; gastos: number; margen: number; count: number };
}

const MESSAGES: ChatMessage[] = [
  {
    id: "m1",
    from: "owner",
    variant: "voice",
    text: "Compré tortillas por 80 y salsa por 120",
    duration: "0:04",
  },
  {
    id: "m2",
    from: "cuenta_clara",
    variant: "card",
    text: "Insumo registrado",
    items: [
      { label: "tortillas", amount: 80 },
      { label: "salsa", amount: 120 },
    ],
  },
  {
    id: "m3",
    from: "owner",
    variant: "text",
    text: "vendí 12 tacos al pastor a 25",
  },
  {
    id: "m4",
    from: "cuenta_clara",
    variant: "card",
    text: "Venta registrada",
    items: [{ label: "12× taco al pastor", amount: 300 }],
  },
  {
    id: "m5",
    from: "owner",
    variant: "text",
    text: "/resumen",
  },
  {
    id: "m6",
    from: "cuenta_clara",
    variant: "pnl",
    text: "Cierre del día",
    totals: {
      ventas: 300,
      gastos: 200,
      margen: 100,
      count: 3,
    },
  },
];

interface TimelineEntry {
  delay: number;
  visibleCount: number;
}

const TIMELINE: TimelineEntry[] = [
  { delay: 0, visibleCount: 0 },
  { delay: 900, visibleCount: 1 },
  { delay: 1500, visibleCount: 2 },
  { delay: 1900, visibleCount: 3 },
  { delay: 1500, visibleCount: 4 },
  { delay: 1900, visibleCount: 5 },
  { delay: 1700, visibleCount: 6 },
  { delay: 4500, visibleCount: 0 },
];

const formatLps = (n: number) =>
  `L. ${n.toLocaleString("es-HN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

function VoiceBubble({ msg }: { msg: ChatMessage }) {
  return (
    <div className="flex max-w-[88%] min-w-[168px] items-center gap-2.5 self-end rounded-2xl rounded-br-sm bg-[var(--color-chat-bubble-out)] px-3 py-2 shadow-[0_1px_2px_oklch(0.3_0.02_200/0.08)] sm:min-w-[200px]">
      <span
        aria-hidden
        className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand)] text-[0.65rem] text-white"
      >
        ▶
      </span>
      <span
        aria-hidden
        className="h-3 flex-1 rounded-full bg-[repeating-linear-gradient(90deg,oklch(0.45_0.08_165)_0,oklch(0.45_0.08_165)_2px,transparent_2px,transparent_5px)] opacity-70"
      />
      <span className="shrink-0 text-[0.68rem] font-medium tabular-nums text-muted">
        {msg.duration}
      </span>
    </div>
  );
}

function TextBubble({ msg }: { msg: ChatMessage }) {
  return (
    <div className="max-w-[85%] self-end rounded-2xl rounded-br-sm bg-[var(--color-chat-bubble-out)] px-3 py-1.5 text-[0.86rem] text-foreground shadow-[0_1px_2px_oklch(0.3_0.02_200/0.08)]">
      {msg.text}
    </div>
  );
}

function CardBubble({ msg }: { msg: ChatMessage }) {
  const total = msg.items?.reduce((sum, item) => sum + item.amount, 0) ?? 0;

  return (
    <div className="w-[88%] max-w-[88%] self-start overflow-hidden rounded-xl bg-[var(--color-chat-bubble-in)] shadow-[0_1px_2px_oklch(0.3_0.02_200/0.08)] ring-1 ring-border">
      <p className="m-0 border-b border-border bg-[var(--color-brand-soft)] px-3 py-1.5 text-[0.66rem] font-semibold uppercase tracking-wider text-[var(--color-brand-ink)]">
        {msg.text}
      </p>
      {msg.items?.map((item) => (
        <div
          className="flex justify-between px-3 py-1 text-[0.78rem]"
          key={item.label}
        >
          <span className="text-muted">{item.label}</span>
          <span className="tabular-nums text-foreground">
            {formatLps(item.amount)}
          </span>
        </div>
      ))}
      <div className="flex justify-between border-t border-border px-3 py-1.5 text-[0.86rem] font-semibold text-foreground">
        <span>Total</span>
        <span className="tabular-nums">{formatLps(total)}</span>
      </div>
      <div className="grid grid-cols-2 border-t border-border text-[0.72rem] font-semibold text-[var(--color-brand-ink)]">
        <span className="cursor-default py-2 text-center">Borrar</span>
        <span className="cursor-default border-l border-border py-2 text-center">
          Ver resumen
        </span>
      </div>
    </div>
  );
}

function PnlBubble({ msg }: { msg: ChatMessage }) {
  const t = msg.totals;
  if (!t) return null;

  return (
    <div className="w-[92%] max-w-[92%] self-start overflow-hidden rounded-xl bg-[var(--color-chat-bubble-in)] shadow-[0_1px_2px_oklch(0.3_0.02_200/0.08)] ring-1 ring-border">
      <p className="m-0 border-b border-border bg-[var(--color-brand-soft)] px-3 py-1.5 text-[0.66rem] font-semibold uppercase tracking-wider text-[var(--color-brand-ink)]">
        {msg.text}
      </p>
      <div className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-0.5 px-3 py-2.5">
        <span className="text-[0.74rem] text-muted">Ventas</span>
        <span className="text-right text-[0.86rem] font-semibold tabular-nums text-[var(--color-positive)]">
          {formatLps(t.ventas)}
        </span>
        <span className="text-[0.74rem] text-muted">Gastos</span>
        <span className="text-right text-[0.86rem] font-semibold tabular-nums text-[var(--color-negative)]">
          {formatLps(t.gastos)}
        </span>
        <span className="text-[0.74rem] text-muted">Margen</span>
        <span className="text-right text-[0.86rem] font-semibold tabular-nums text-foreground">
          {formatLps(t.margen)}
        </span>
        <span className="text-[0.74rem] text-muted">Movimientos</span>
        <span className="text-right text-[0.86rem] font-semibold tabular-nums text-foreground">
          {t.count}
        </span>
      </div>
    </div>
  );
}

function MessageRow({ msg }: { msg: ChatMessage }) {
  switch (msg.variant) {
    case "voice":
      return <VoiceBubble msg={msg} />;
    case "text":
      return <TextBubble msg={msg} />;
    case "card":
      return <CardBubble msg={msg} />;
    case "pnl":
      return <PnlBubble msg={msg} />;
  }
}

export function ChatDemo() {
  const [step, setStep] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const isVisibleRef = useRef(true);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const clearTimeouts = useCallback(() => {
    for (const t of timeoutsRef.current) clearTimeout(t);
    timeoutsRef.current = [];
  }, []);

  const run = useCallback(() => {
    clearTimeouts();
    let elapsed = 0;
    for (let i = 0; i < TIMELINE.length; i++) {
      elapsed += TIMELINE[i].delay;
      const idx = i;
      timeoutsRef.current.push(
        setTimeout(() => {
          if (!isVisibleRef.current) return;
          if (idx === TIMELINE.length - 1) {
            setStep(0);
            timeoutsRef.current.push(
              setTimeout(() => {
                if (isVisibleRef.current) run();
              }, TIMELINE[idx].delay),
            );
          } else {
            setStep(idx);
          }
        }, elapsed),
      );
    }
  }, [clearTimeouts]);

  useEffect(() => {
    if (reducedMotion) {
      setStep(TIMELINE.length - 2);
      return;
    }

    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const wasVisible = isVisibleRef.current;
        isVisibleRef.current = entry.isIntersecting;
        if (entry.isIntersecting && !wasVisible) {
          setStep(0);
          run();
        } else if (!entry.isIntersecting && wasVisible) {
          clearTimeouts();
        }
      },
      { threshold: 0.25 },
    );

    observer.observe(el);
    run();

    return () => {
      observer.disconnect();
      clearTimeouts();
    };
  }, [run, clearTimeouts, reducedMotion]);

  const current = TIMELINE[step];
  const visibleMessages = MESSAGES.slice(0, current.visibleCount);

  return (
    <div ref={containerRef} className="flex h-full min-h-0 flex-1 flex-col">
      <div className="flex items-center gap-2.5 bg-[var(--color-brand)] px-4 py-2.5 text-white">
        <button
          type="button"
          aria-label="Atrás"
          className="cursor-default text-white/80"
        >
          <svg
            viewBox="0 0 24 24"
            className="size-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
        <span className="flex size-9 items-center justify-center rounded-full bg-[oklch(0.86_0.1_85)] text-[0.92rem] font-bold text-foreground">
          S
        </span>
        <div className="leading-tight">
          <strong className="block text-[0.88rem] font-semibold">
            Cuenta Clara
          </strong>
          <span className="block text-[0.68rem] opacity-80">en línea</span>
        </div>
        <div className="ml-auto flex items-center gap-3 opacity-90">
          <svg
            className="size-[18px]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M23 7l-7 5 7 5V7z" />
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
          </svg>
          <svg
            className="size-[18px]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.72 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.35 1.85.59 2.81.72A2 2 0 0 1 22 16.92z" />
          </svg>
        </div>
      </div>

      <div
        className="
          flex min-h-0 flex-1 flex-col justify-end gap-2 overflow-hidden p-3
          bg-[var(--color-chat-paper)]
          bg-[url('/whatsapp-doodle.png')]
          bg-cover bg-center bg-no-repeat
        "
      >
        <AnimatePresence initial={false} mode="popLayout">
          {visibleMessages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 14, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{
                opacity: 0,
                scale: 0.96,
                transition: { duration: 0.18, ease: [0.32, 0, 0.67, 0] },
              }}
              layout
              transition={{ type: "spring", stiffness: 360, damping: 30 }}
              className={`flex ${msg.from === "owner" ? "justify-end" : "justify-start"}`}
            >
              <MessageRow msg={msg} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-2 bg-[var(--color-chat-paper)] px-3 py-2.5">
        <span
          aria-hidden
          className="flex h-9 flex-1 items-center rounded-full bg-[var(--color-chat-bubble-in)] px-4 text-[0.82rem] text-muted-soft ring-1 ring-border"
        >
          Mensaje
        </span>
        <span
          aria-hidden
          className="flex size-9 items-center justify-center rounded-full bg-[var(--color-brand)] text-white"
        >
          <svg
            viewBox="0 0 24 24"
            className="size-[18px]"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <path d="M12 19v4" />
          </svg>
        </span>
      </div>
    </div>
  );
}
