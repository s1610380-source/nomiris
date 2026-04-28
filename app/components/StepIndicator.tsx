interface Props {
  step: 1 | 2 | 3;
}

const STEPS: { num: 1 | 2 | 3; label: string }[] = [
  { num: 1, label: "条件入力" },
  { num: 2, label: "候補をピック" },
  { num: 3, label: "提案文" },
];

export default function StepIndicator({ step }: Props) {
  return (
    <div className="bg-nomiris-bg border-b border-nomiris-line/60">
      <div className="mx-auto max-w-2xl px-4 py-3">
        <ol className="flex items-center justify-between gap-1">
          {STEPS.map((s, idx) => {
            const isActive = s.num === step;
            const isDone = s.num < step;
            return (
              <li
                key={s.num}
                className="flex flex-1 items-center gap-1.5 min-w-0"
              >
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition ${
                    isActive
                      ? "bg-nomiris-orange text-white shadow-sm"
                      : isDone
                        ? "bg-nomiris-orangeLight text-white"
                        : "bg-white text-nomiris-textSub border border-nomiris-line"
                  }`}
                >
                  {isDone ? "✓" : s.num}
                </span>
                <span
                  className={`text-xs sm:text-sm font-semibold truncate ${
                    isActive
                      ? "text-nomiris-brownDark"
                      : "text-nomiris-textSub"
                  }`}
                >
                  {s.label}
                </span>
                {idx < STEPS.length - 1 && (
                  <span
                    aria-hidden
                    className="ml-1 hidden sm:inline text-nomiris-line"
                  >
                    ›
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
