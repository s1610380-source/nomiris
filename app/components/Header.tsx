interface StepProps {
  num: number;
  label: string;
}

function Step({ num, label }: StepProps) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-nomiris-orange text-white text-xs font-bold">
        {num}
      </span>
      <span className="text-xs sm:text-sm font-semibold text-nomiris-brown">
        {label}
      </span>
    </div>
  );
}

export default function Header() {
  return (
    <header className="bg-gradient-to-b from-nomiris-cream to-nomiris-bg border-b border-nomiris-line/60">
      <div className="mx-auto max-w-2xl px-4 pt-7 pb-5">
        <div className="flex items-center gap-2">
          <span className="text-3xl" aria-hidden>
            🐿️
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-nomiris-brownDark">
            飲みリス
          </h1>
        </div>
        <p className="mt-1 text-sm sm:text-base text-nomiris-textSub">
          飲み会候補、サクッとまとめる。
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
          <Step num={1} label="条件入力" />
          <span className="text-nomiris-line">›</span>
          <Step num={2} label="候補リスト" />
          <span className="text-nomiris-line">›</span>
          <Step num={3} label="提案文生成" />
        </div>
      </div>
    </header>
  );
}
