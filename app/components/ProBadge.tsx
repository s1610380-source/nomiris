interface Props {
  className?: string;
  label?: string;
}

/** 小さなゴールド系バッジ「Pro」 */
export default function ProBadge({ className = "", label = "Pro" }: Props) {
  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-full border border-amber-300 bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 shadow-sm ${className}`}
    >
      <span aria-hidden>✨</span>
      <span>{label}</span>
    </span>
  );
}
