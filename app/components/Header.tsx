export default function Header() {
  return (
    <header className="bg-gradient-to-b from-nomiris-cream to-nomiris-bg border-b border-nomiris-line/60">
      <div className="mx-auto max-w-2xl px-4 pt-7 pb-4">
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
      </div>
    </header>
  );
}
