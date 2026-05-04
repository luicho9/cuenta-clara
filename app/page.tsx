import { ChatDemo } from "./components/chat-demo";
import { PhoneFrame } from "./components/phone-frame";

const whatsappNumber = process.env.NEXT_PUBLIC_CUENTA_CLARA_WHATSAPP;
const githubUrl = "https://github.com/luicho9/cuenta-clara";
const testPrompts = [
  "Vendí 2 sandwiches a 180",
  "Pagué 350 de luz",
  "Compré shampoo por 800",
  "Vendí dos cortes, no, tres a 200",
  "/resumen",
];

export default function Home() {
  return (
    <main className="relative flex min-h-screen w-full max-w-full flex-col overflow-x-hidden bg-background text-foreground">
      <header className="site-container flex items-center justify-between py-5">
        <a
          href="/"
          className="flex items-center gap-2 text-[0.95rem] font-semibold tracking-tight text-foreground"
        >
          <CuentaClaraMark />
          Cuenta Clara
        </a>
        <a
          href={githubUrl}
          target="_blank"
          rel="noreferrer"
          className="text-[0.85rem] font-medium text-muted transition-colors hover:text-foreground"
        >
          GitHub
        </a>
      </header>

      <section
        className="hero-container pt-10 text-center sm:pt-16"
        aria-label="Cuenta Clara"
      >
        <h1
          className="
            font-display font-medium tracking-[-0.025em] text-foreground
            text-[2.4rem] leading-[1.04]
            sm:text-[3.25rem]
            md:text-[3.85rem]
          "
        >
          <span className="block">Your books</span>
          <span className="block sm:inline">live on</span>{" "}
          <span className="block sm:inline">WhatsApp.</span>
        </h1>
        <p
          className="
            mx-auto mt-5 max-w-[34rem]
            text-[0.98rem] leading-[1.55] text-muted
            sm:text-[1.05rem]
          "
        >
          Send a voice note, a text, or just type /resumen. Cuenta Clara
          extracts the transaction, confirms it in WhatsApp, and sends the daily
          P&amp;L at 8pm for micro-businesses in LATAM.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3">
          <a
            href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Hola Cuenta Clara, vendi una pizza a 150")}`}
            target="_blank"
            rel="noreferrer"
            className="
              group inline-flex max-w-full items-center justify-center gap-2.5
              rounded-full bg-[var(--color-brand)] px-5 py-3
              text-center text-[0.92rem] font-medium text-white
              shadow-[0_1px_0_oklch(1_0_0/0.18)_inset,0_8px_22px_-8px_oklch(0.4_0.085_175/0.55)]
              transition-[transform,background-color,box-shadow] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]
              hover:-translate-y-px hover:bg-[var(--color-brand-ink)]
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-background)]
              active:translate-y-0
            "
          >
            Message Cuenta Clara on WhatsApp
            <svg
              className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M5 12h14" />
              <path d="m13 6 6 6-6 6" />
            </svg>
          </a>
          <span className="max-w-[18rem] text-[0.78rem] leading-[1.45] text-muted-soft sm:max-w-none">
            Voice notes, text messages, and summary commands.
          </span>
        </div>

        <section
          className="mx-auto mt-12 w-[min(100%_-_3rem,64rem)] border-t border-border pt-7 text-center sm:mt-14 sm:pt-8"
          aria-labelledby="test-prompts-heading"
        >
          <h2
            id="test-prompts-heading"
            className="text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-[var(--color-brand-ink)]"
          >
            Try these in WhatsApp
          </h2>
          <div className="mt-4 flex flex-wrap justify-center gap-x-2.5 gap-y-3 lg:flex-nowrap">
            {testPrompts.map((prompt) => (
              <span
                key={prompt}
                className="shrink-0 rounded-full border border-border bg-[var(--color-surface)] px-3.5 py-2 text-[0.78rem] font-medium leading-snug text-foreground shadow-[0_10px_26px_-22px_oklch(0.18_0.012_200/0.35)]"
              >
                {prompt}
              </span>
            ))}
          </div>
        </section>
      </section>

      <section
        className="phone-container mt-12 sm:mt-16"
        aria-label="Demo conversation in WhatsApp"
      >
        <PhoneFrame>
          <ChatDemo />
        </PhoneFrame>
        <p className="mx-auto mt-7 max-w-[28rem] text-center text-[0.78rem] italic text-muted-soft">
          A normal day at a taqueria: messy Spanish in, clean accounting out.
        </p>
      </section>

      <section
        className="proof-container mt-12 sm:mt-16"
        aria-label="What Cuenta Clara does"
      >
        <div className="grid gap-5 md:grid-cols-[1.05fr_0.95fr]">
          <ProofPanel
            eyebrow="The problem"
            heading="Small shops sell all day, then reconstruct the books from memory."
            body="Barbers, taquerias, and corner stores already run the business from WhatsApp. Cuenta Clara turns the habit they have into a ledger they can trust: sales, expenses, supplies, and margin."
            className="md:min-h-[310px]"
          />
          <ProofPanel
            eyebrow="The agent loop"
            heading="Voice or text becomes a confirmed transaction."
            body="Kapso transcribes WhatsApp voice notes, Claude Sonnet 4.6 extracts a typed object, Zod validates it, and Cuenta Clara replies with an interactive card: delete or view summary."
            className="md:min-h-[310px]"
          />
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
          <ProofPanel
            eyebrow="What the demo proves"
            heading="Three inputs, two cards, one daily close."
            body="The working flow handles voice notes, text, and /resumen. It dedupes redelivered messages, stores confirmed transactions, and sends the 8pm P&L summary through Vercel Cron."
          />
          <StackPanel />
        </div>
      </section>

      <footer className="mt-32 border-t border-border">
        <div className="site-container flex flex-col gap-3 py-6 text-center text-[0.78rem] text-muted sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <span>Built for Vercel Zero to Agent, ChatSDK Agents track.</span>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <a
              href="https://joseluisflores.dev"
              target="_blank"
              rel="noreferrer"
              className="transition-colors hover:text-foreground"
            >
              By Jose Luis Flores
            </a>
            <a
              href={githubUrl}
              target="_blank"
              rel="noreferrer"
              className="transition-colors hover:text-foreground"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}

function ProofPanel({
  eyebrow,
  heading,
  body,
  className = "",
}: {
  eyebrow: string;
  heading: string;
  body: string;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col justify-between rounded-[8px] border border-border bg-[var(--color-surface)] p-6 shadow-[0_18px_45px_-34px_oklch(0.18_0.012_200/0.35)] transition-[transform,border-color,box-shadow,background-color] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:border-[color-mix(in_oklch,var(--color-brand)_46%,var(--color-border))] hover:bg-[oklch(0.997_0.004_180)] hover:shadow-[0_24px_60px_-38px_oklch(0.18_0.012_200/0.48)] sm:p-7 ${className}`}
    >
      <p className="text-[0.74rem] font-semibold uppercase tracking-[0.12em] text-[var(--color-brand-ink)]">
        {eyebrow}
      </p>
      <div className="mt-8 sm:mt-10">
        <h2 className="max-w-[22rem] text-[1.45rem] font-semibold leading-[1.15] tracking-tight text-foreground sm:text-[1.75rem]">
          {heading}
        </h2>
        <p className="mt-4 max-w-[34rem] text-[0.96rem] leading-[1.65] text-muted">
          {body}
        </p>
      </div>
    </div>
  );
}

function StackPanel() {
  const stack = [
    "Next.js App Router",
    "Vercel ChatSDK",
    "Kapso WhatsApp adapter",
    "AI SDK",
    "AI Gateway",
    "Claude Sonnet 4.6",
    "Postgres + Drizzle",
    "Vercel Cron",
  ];

  return (
    <div className="rounded-[8px] border border-[var(--color-brand)] bg-[var(--color-brand-soft)] p-6 shadow-[0_18px_45px_-36px_oklch(0.36_0.075_175/0.36)] transition-[transform,border-color,box-shadow,background-color] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:border-[var(--color-brand-ink)] hover:bg-[oklch(0.955_0.035_175)] hover:shadow-[0_26px_64px_-40px_oklch(0.36_0.075_175/0.56)] sm:p-7">
      <p className="text-[0.74rem] font-semibold uppercase tracking-[0.12em] text-[var(--color-brand-ink)]">
        ChatSDK Agents stack
      </p>
      <h2 className="mt-8 max-w-[26rem] text-[1.45rem] font-semibold leading-[1.15] tracking-tight text-foreground sm:mt-10 sm:text-[1.75rem]">
        A WhatsApp-native agent, deployed on Vercel.
      </h2>
      <div className="mt-6 flex flex-wrap gap-2">
        {stack.map((item) => (
          <span
            key={item}
            className="rounded-full border border-[color-mix(in_oklch,var(--color-brand)_38%,transparent)] bg-[oklch(0.992_0.003_180/0.72)] px-3 py-1.5 text-[0.78rem] font-medium text-[var(--color-brand-ink)]"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function CuentaClaraMark() {
  return (
    <span
      aria-hidden
      className="flex size-6 items-center justify-center rounded-[7px] bg-[var(--color-brand)] text-white"
    >
      <svg
        viewBox="0 0 16 16"
        className="size-3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M3 5h10M3 8h7M3 11h5" />
      </svg>
    </span>
  );
}
