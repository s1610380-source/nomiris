import type { ReactNode } from "react";

interface Props {
  step?: number;
  emoji: string;
  title: string;
  description?: string;
  children: ReactNode;
}

export default function SectionCard({
  step,
  emoji,
  title,
  description,
  children,
}: Props) {
  return (
    <section className="nm-card">
      <div className="flex items-start gap-2">
        {step !== undefined && (
          <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-nomiris-orange text-white text-xs font-bold">
            {step}
          </span>
        )}
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-nomiris-brownDark">
            <span className="mr-1" aria-hidden>
              {emoji}
            </span>
            {title}
          </h2>
          {description && (
            <p className="mt-1 text-xs text-nomiris-textSub">{description}</p>
          )}
        </div>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}
