import type { ReactNode } from "react";

interface PhoneFrameProps {
  children: ReactNode;
  time?: string;
  carrier?: string;
}

export function PhoneFrame({
  children,
  time = "8:47",
  carrier = "Tigo",
}: PhoneFrameProps) {
  return (
    <div className="phone-frame relative mx-auto">
      <div
        className="
          relative overflow-hidden rounded-[40px]
          bg-[var(--color-phone-bezel)] p-[5px]
          shadow-[0_40px_70px_-30px_oklch(0.18_0.012_200/0.35),0_14px_30px_-18px_oklch(0.18_0.012_200/0.18)]
        "
      >
        <div className="relative flex aspect-[9/19] flex-col overflow-hidden rounded-[36px] bg-[var(--color-chat-paper)]">
          <div className="relative z-10 flex h-11 items-end justify-between bg-[var(--color-brand)] px-5 pb-1.5 text-[12px] font-semibold tabular-nums text-white sm:px-6">
            <span>{time}</span>

            <span className="absolute left-1/2 top-2 h-[22px] w-[78px] -translate-x-1/2 rounded-full bg-[var(--color-phone-bezel)] sm:w-[92px]" />

            <span className="flex items-center gap-1.5">
              <span className="flex items-end gap-[2px]" aria-hidden>
                <i className="block h-[3px] w-[3px] rounded-[1px] bg-white" />
                <i className="block h-[5px] w-[3px] rounded-[1px] bg-white" />
                <i className="block h-[7px] w-[3px] rounded-[1px] bg-white" />
                <i className="block h-[9px] w-[3px] rounded-[1px] bg-white" />
              </span>
              <span className="text-[11px] font-medium tracking-tight text-white">
                {carrier}
              </span>
              <span
                className="ml-1 inline-flex h-[11px] w-[22px] items-center rounded-[3px] bg-transparent p-[1.5px] ring-1 ring-white"
                aria-hidden
              >
                <i className="block h-full w-[80%] rounded-[1.5px] bg-white" />
                <i className="ml-[1px] block h-[5px] w-[1.5px] rounded-r-[1px] bg-white" />
              </span>
            </span>
          </div>

          {children}
        </div>
      </div>

      <div
        aria-hidden
        className="
          pointer-events-none absolute inset-x-10 -bottom-6 h-12
          rounded-[100%] bg-foreground/10 blur-2xl
        "
      />
    </div>
  );
}
