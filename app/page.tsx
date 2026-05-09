import Link from "next/link";
import Header from "./components/Header";
import InstallButton from "./components/InstallButton";

/* =====================================================================
 * 飲みリス🐿️ ランディングページ
 * 構成: Hero / Features / Modes / Flow / Business Pro / Date Pro / Pricing / FAQ / Final CTA / Footer
 * ===================================================================== */

/* ---------- 共通プリミティブ ---------- */

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full bg-nomiris-cream border border-nomiris-line px-3 py-1 text-xs font-bold text-nomiris-brown shadow-sm">
      {children}
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "center" | "left";
}) {
  const alignCls = align === "center" ? "text-center mx-auto" : "text-left";
  return (
    <div className={`max-w-3xl ${alignCls} space-y-3`}>
      {eyebrow && (
        <div className={align === "center" ? "flex justify-center" : ""}>
          <SectionEyebrow>{eyebrow}</SectionEyebrow>
        </div>
      )}
      <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-nomiris-brownDark leading-tight">
        {title}
      </h2>
      {description && (
        <p className="text-base md:text-lg text-nomiris-textSub leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}

/* ---------- ヒーロー ---------- */

function HeroPreview() {
  // CSS のみで描いたアプリプレビュー（ブラウザ風フレーム）
  return (
    <div className="relative">
      {/* 背景の柔らかいオレンジ・楕円グロー */}
      <div
        aria-hidden
        className="absolute -inset-6 -z-10 rounded-[3rem] bg-gradient-to-br from-orange-100/70 via-amber-50 to-rose-50 blur-2xl opacity-80"
      />
      <div className="relative rounded-[2rem] border border-nomiris-line bg-white shadow-2xl p-3 md:p-4 motion-safe:md:rotate-1 motion-safe:hover:rotate-0 transition-transform duration-500">
        {/* ブラウザバー */}
        <div className="flex items-center gap-1.5 px-2 py-2">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
          <div className="ml-3 flex-1 rounded-full bg-nomiris-cream/70 border border-nomiris-line/50 px-3 py-1 text-[10px] text-nomiris-textSub truncate">
            nomiris.app/app
          </div>
        </div>

        <div className="rounded-2xl bg-gradient-to-b from-nomiris-cream/80 to-white border border-nomiris-line/50 p-3 md:p-4 space-y-3 relative">
          {/* Pro バッジ（右上） */}
          <span className="absolute -top-2 -right-2 inline-flex items-center gap-0.5 rounded-full border border-amber-300 bg-amber-100 px-2.5 py-1 text-[10px] font-bold text-amber-800 shadow">
            <span aria-hidden>✨</span>Pro
          </span>

          {/* 条件チップ */}
          <div className="flex flex-wrap gap-1.5">
            <span className="inline-flex items-center rounded-full bg-nomiris-orange/10 border border-nomiris-orange/30 text-nomiris-orangeDark text-[11px] font-bold px-2.5 py-1">
              📍 新宿
            </span>
            <span className="inline-flex items-center rounded-full bg-nomiris-cream border border-nomiris-line text-nomiris-brown text-[11px] font-bold px-2.5 py-1">
              👥 4人
            </span>
            <span className="inline-flex items-center rounded-full bg-nomiris-cream border border-nomiris-line text-nomiris-brown text-[11px] font-bold px-2.5 py-1">
              💴 〜6,000円
            </span>
            <span className="inline-flex items-center rounded-full bg-nomiris-cream border border-nomiris-line text-nomiris-brown text-[11px] font-bold px-2.5 py-1">
              🍻 にぎやか
            </span>
          </div>

          {/* 候補カード 2 枚 */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-nomiris-line bg-white p-2.5 shadow-sm">
              <div className="text-[11px] font-bold text-nomiris-brownDark truncate">
                千里香 新宿店
              </div>
              <div className="text-[10px] text-nomiris-textSub">中華 / 個室あり</div>
              <div className="mt-1.5 flex items-center justify-between">
                <span className="text-[10px] font-bold text-nomiris-orange">
                  ¥5,000〜6,000
                </span>
                <span className="text-[10px] text-amber-600">★ 4.2</span>
              </div>
            </div>
            <div className="rounded-xl border border-nomiris-orange/40 bg-nomiris-orange/5 p-2.5 shadow-sm ring-1 ring-nomiris-orange/30">
              <div className="text-[11px] font-bold text-nomiris-brownDark truncate">
                炭火焼 すみれ
              </div>
              <div className="text-[10px] text-nomiris-textSub">居酒屋 / 飲み放題</div>
              <div className="mt-1.5 flex items-center justify-between">
                <span className="text-[10px] font-bold text-nomiris-orange">
                  ¥4,500〜5,500
                </span>
                <span className="text-[10px] text-amber-600">★ 4.5</span>
              </div>
            </div>
          </div>

          {/* 提案文ボックス */}
          <div className="rounded-xl border border-nomiris-line bg-nomiris-bg/60 p-2.5">
            <div className="text-[10px] font-bold text-nomiris-brown mb-1 flex items-center justify-between">
              <span>📝 提案文</span>
              <span className="text-[9px] text-nomiris-textSub">LINE 用</span>
            </div>
            <div className="text-[10px] text-nomiris-textMain leading-relaxed line-clamp-3">
              下記の通り、候補案まとめました！
              <br />
              新宿駅近く・4人・〜6,000円で、賑やかすぎない雰囲気の…
            </div>
          </div>

          <div className="flex justify-end">
            <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold px-3 py-1.5 shadow-sm">
              📋 コピー
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* 背景装飾 */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-b from-nomiris-cream via-white to-white"
      />
      <div
        aria-hidden
        className="absolute -top-20 -right-20 -z-10 h-[28rem] w-[28rem] rounded-full bg-orange-100/60 blur-3xl"
      />
      <div
        aria-hidden
        className="absolute top-40 -left-32 -z-10 h-80 w-80 rounded-full bg-amber-100/50 blur-3xl"
      />
      {/* ドットパターン（右上） */}
      <div
        aria-hidden
        className="absolute top-24 right-6 -z-10 h-32 w-32 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(rgba(232,132,59,0.5) 1.2px, transparent 1.2px)",
          backgroundSize: "12px 12px",
        }}
      />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-10 pb-16 md:pt-20 md:pb-28">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <div className="space-y-6 max-w-xl">
            <SectionEyebrow>
              <span aria-hidden>🐿️</span>
              幹事向け候補案作成 Web アプリ
            </SectionEyebrow>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-nomiris-brownDark leading-[1.1]">
              お店選びだけで
              <br />
              終わらない。
            </h1>

            <p className="text-base md:text-lg text-nomiris-textSub leading-relaxed">
              候補店を比較して、LINE・Slack・メールに
              <br className="hidden sm:block" />
              そのまま貼れる提案文まで作成。
              <br />
              飲み会・会食・デートの準備を、もっとスマートに。
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                href="/app"
                className="inline-flex items-center justify-center gap-1.5 rounded-full bg-nomiris-orange text-white font-bold px-6 py-3.5 text-base shadow-md hover:bg-nomiris-orangeDark transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
              >
                <span aria-hidden>🐿️</span>
                無料で候補案を作る
              </Link>
              <Link
                href="#pro"
                className="inline-flex items-center justify-center gap-1 rounded-full bg-white text-nomiris-brownDark font-bold px-6 py-3.5 text-base border border-nomiris-line hover:bg-nomiris-cream transition"
              >
                Pro 機能を見る →
              </Link>
            </div>

            {/* PWA インストール案内（Android: prompt / iOS: 案内シート / standalone: 自動非表示） */}
            <div className="pt-1">
              <InstallButton className="inline-flex items-center justify-center gap-1.5 rounded-full border border-nomiris-orange/40 bg-white text-nomiris-orangeDark font-bold px-4 py-2 text-xs sm:text-sm shadow-sm hover:bg-nomiris-cream transition" />
            </div>

            <div className="flex items-center gap-4 pt-2 text-xs text-nomiris-textSub">
              <span className="inline-flex items-center gap-1">
                <span className="text-emerald-500" aria-hidden>✓</span>
                インストール不要
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="text-emerald-500" aria-hidden>✓</span>
                登録不要
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="text-emerald-500" aria-hidden>✓</span>
                3 ステップ
              </span>
            </div>
          </div>

          <div className="lg:pl-6">
            <HeroPreview />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- B. できること ---------- */

interface FeatureCardProps {
  emoji: string;
  title: string;
  description: string;
}

function FeatureCard({ emoji, title, description }: FeatureCardProps) {
  return (
    <div className="group rounded-2xl border border-nomiris-line bg-white p-6 shadow-sm transition-all duration-300 motion-safe:hover:-translate-y-1 hover:shadow-md hover:border-nomiris-orange/30">
      <div className="h-12 w-12 rounded-2xl bg-nomiris-cream border border-nomiris-line/50 flex items-center justify-center text-2xl mb-4 transition-transform duration-300 motion-safe:group-hover:scale-110">
        <span aria-hidden>{emoji}</span>
      </div>
      <h3 className="text-lg font-bold text-nomiris-brownDark mb-2">{title}</h3>
      <p className="text-sm text-nomiris-textSub leading-relaxed">{description}</p>
    </div>
  );
}

function FeaturesSection() {
  const features: FeatureCardProps[] = [
    {
      emoji: "📋",
      title: "候補店を整理",
      description:
        "見つけたお店を、予算・駅・雰囲気・用途ごとに一覧化できます。",
    },
    {
      emoji: "📊",
      title: "比較して選びやすく",
      description:
        "どのお店が今回の条件に合うか、比較表で分かりやすく確認できます。",
    },
    {
      emoji: "✉️",
      title: "そのまま送れる文章",
      description:
        "LINE・Slack・メールに貼れる提案文を自動で整えます。",
    },
    {
      emoji: "🎯",
      title: "仕事もデートも対応",
      description:
        "会食、接待、初デート、お礼文まで Pro でサポートします。",
    },
  ];
  return (
    <section id="features" className="bg-white py-16 md:py-24 scroll-mt-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="できること"
          title={
            <>
              お店選びだけで終わらない、
              <br className="hidden sm:block" />4 つの基本機能
            </>
          }
          description="幹事の頭の中にある「候補店リスト」を、そのまま共有できる形に整えます。"
        />
        <div className="mt-10 md:mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {features.map((f) => (
            <FeatureCard key={f.title} {...f} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- C. 3 つのモード ---------- */

interface ModeCardProps {
  href: string;
  emoji: string;
  title: string;
  description: string;
  features: string[];
  isPro?: boolean;
  freeLabel?: boolean;
}

function ModeCard({
  href,
  emoji,
  title,
  description,
  features,
  isPro,
  freeLabel,
}: ModeCardProps) {
  return (
    <Link
      href={href}
      className={`group relative rounded-3xl border p-6 md:p-7 flex flex-col gap-4 transition-all duration-300 motion-safe:hover:-translate-y-1 ${
        isPro
          ? "bg-gradient-to-br from-amber-50 to-orange-50 border-amber-300/70 ring-1 ring-amber-200/50 hover:shadow-lg hover:ring-amber-300"
          : "bg-white border-nomiris-line hover:border-nomiris-orange/40 hover:shadow-md"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="h-14 w-14 rounded-2xl bg-white border border-nomiris-line/50 flex items-center justify-center text-3xl shadow-sm">
          <span aria-hidden>{emoji}</span>
        </div>
        {isPro ? (
          <span className="inline-flex items-center gap-0.5 rounded-full border border-amber-300 bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-800 shadow-sm">
            <span aria-hidden>✨</span>Pro
          </span>
        ) : freeLabel ? (
          <span className="inline-flex items-center rounded-full border border-nomiris-orange/40 bg-white text-nomiris-orange text-[11px] font-bold px-2.5 py-1">
            無料
          </span>
        ) : null}
      </div>

      <div>
        <h3
          className={`text-xl font-bold ${
            isPro ? "text-amber-900" : "text-nomiris-brownDark"
          }`}
        >
          {title}
        </h3>
        <p
          className={`mt-1.5 text-sm leading-relaxed ${
            isPro ? "text-amber-900/80" : "text-nomiris-textSub"
          }`}
        >
          {description}
        </p>
      </div>

      <ul className="space-y-1.5">
        {features.map((f) => (
          <li
            key={f}
            className={`flex items-start gap-2 text-sm ${
              isPro ? "text-amber-900" : "text-nomiris-textMain"
            }`}
          >
            <span
              aria-hidden
              className={`mt-0.5 ${isPro ? "text-amber-600" : "text-nomiris-orange"}`}
            >
              ✓
            </span>
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <div
        className={`mt-auto pt-2 text-sm font-bold flex items-center gap-1 ${
          isPro ? "text-amber-700" : "text-nomiris-orange"
        }`}
      >
        このモードで作る
        <span className="transition-transform duration-200 motion-safe:group-hover:translate-x-1" aria-hidden>
          →
        </span>
      </div>
    </Link>
  );
}

function ModesSection() {
  return (
    <section
      id="modes"
      className="py-16 md:py-24 scroll-mt-20 bg-gradient-to-b from-white to-nomiris-cream/40"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="3 つのモード"
          title={
            <>
              シーンに合わせて、
              <br className="hidden sm:block" />
              使い分けられる
            </>
          }
          description="飲み会・会食・デート、それぞれに合う文面とチェック項目を用意しています。"
        />
        <div className="mt-10 md:mt-14 grid grid-cols-1 md:grid-cols-3 gap-5">
          <ModeCard
            href="/app?mode=casual"
            emoji="🍻"
            title="カジュアル飲み"
            description="友達・サークル・同期との飲み会候補を、気軽に整理できます。"
            freeLabel
            features={[
              "友達 LINE 用の砕けた文面",
              "サークル / 同期向けの一斉共有文",
              "予算・エリア・人数で候補をピック",
              "コピー & そのまま貼り付け",
            ]}
          />
          <ModeCard
            href="/app?mode=business"
            emoji="💼"
            title="仕事・会食"
            description="社内提案、社外共有、接待、お礼メールまで、失礼なく整えます。"
            isPro
            features={[
              "上司・社内向けの丁寧な提案メール",
              "取引先への候補共有メール",
              "翌日のお礼メール",
              "個室・接待向きチェック",
              "懸念点の自動コメント",
            ]}
          />
          <ModeCard
            href="/app?mode=date"
            emoji="💕"
            title="デート・マッチングアプリ"
            description="初デートの誘い方から、お店共有、お礼 LINE、2 回目の誘いまでサポート。"
            isPro
            features={[
              "初デートの自然な誘い文",
              "候補店共有 LINE",
              "デート後のお礼 LINE",
              "2 回目につなげる一言",
              "重すぎない文章調整",
            ]}
          />
        </div>
      </div>
    </section>
  );
}

/* ---------- D. 候補案作成の流れ ---------- */

function FlowPreview1() {
  return (
    <div className="rounded-xl border border-nomiris-line bg-white p-3 shadow-sm space-y-2">
      <div className="text-[10px] font-bold text-nomiris-brown">条件入力</div>
      <div className="space-y-1.5">
        <div className="h-2 rounded-full bg-nomiris-cream w-3/4" />
        <div className="h-2 rounded-full bg-nomiris-cream w-1/2" />
      </div>
      <div className="flex flex-wrap gap-1">
        <span className="text-[9px] font-bold text-nomiris-orangeDark bg-nomiris-orange/10 border border-nomiris-orange/30 rounded-full px-2 py-0.5">
          新宿
        </span>
        <span className="text-[9px] font-bold text-nomiris-brown bg-nomiris-cream border border-nomiris-line rounded-full px-2 py-0.5">
          4人
        </span>
        <span className="text-[9px] font-bold text-nomiris-brown bg-nomiris-cream border border-nomiris-line rounded-full px-2 py-0.5">
          6,000円
        </span>
      </div>
    </div>
  );
}

function FlowPreview2() {
  return (
    <div className="rounded-xl border border-nomiris-line bg-white p-3 shadow-sm space-y-2">
      <div className="text-[10px] font-bold text-nomiris-brown">候補ピック</div>
      <div className="space-y-1.5">
        <div className="rounded-md bg-nomiris-cream/60 border border-nomiris-line/60 p-1.5">
          <div className="h-1.5 rounded-full bg-nomiris-brown/30 w-2/3 mb-1" />
          <div className="h-1 rounded-full bg-nomiris-line w-1/2" />
        </div>
        <div className="rounded-md bg-nomiris-orange/10 border border-nomiris-orange/30 p-1.5 ring-1 ring-nomiris-orange/20">
          <div className="h-1.5 rounded-full bg-nomiris-orange/60 w-3/4 mb-1" />
          <div className="h-1 rounded-full bg-nomiris-orange/30 w-1/2" />
        </div>
      </div>
    </div>
  );
}

function FlowPreview3() {
  return (
    <div className="rounded-xl border border-nomiris-line bg-white p-3 shadow-sm space-y-2">
      <div className="text-[10px] font-bold text-nomiris-brown flex items-center justify-between">
        <span>提案文</span>
        <span className="text-[8px] text-nomiris-textSub">LINE</span>
      </div>
      <div className="rounded-md bg-nomiris-bg/60 border border-nomiris-line/60 p-2 space-y-1">
        <div className="h-1.5 rounded-full bg-nomiris-brown/40 w-full" />
        <div className="h-1.5 rounded-full bg-nomiris-brown/40 w-5/6" />
        <div className="h-1.5 rounded-full bg-nomiris-brown/40 w-2/3" />
      </div>
      <div className="flex justify-end">
        <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] font-bold px-2 py-0.5 shadow-sm">
          📋 コピー
        </span>
      </div>
    </div>
  );
}

interface FlowStep {
  num: number;
  title: string;
  description: string;
  preview: React.ReactNode;
}

function FlowSection() {
  const steps: FlowStep[] = [
    {
      num: 1,
      title: "条件を入れる",
      description: "モード・エリア・予算・雰囲気を選択。",
      preview: <FlowPreview1 />,
    },
    {
      num: 2,
      title: "候補店を追加する",
      description: "カタログ + HotPepper から自動ピック / 比較表で確認。",
      preview: <FlowPreview2 />,
    },
    {
      num: 3,
      title: "比較表と提案文を作る",
      description: "LINE・Slack・メール用の文面を自動生成。",
      preview: <FlowPreview3 />,
    },
  ];

  return (
    <section id="flow" className="py-16 md:py-24 bg-white scroll-mt-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="使い方"
          title="3 ステップで、候補案が完成"
          description="入力 → ピック → 提案文の 3 画面だけ。所要時間はだいたい 2 分。"
        />

        <div className="mt-10 md:mt-14 relative">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
            {steps.map((s, i) => (
              <div key={s.num} className="relative">
                <div className="rounded-3xl border border-nomiris-line bg-white p-6 shadow-sm h-full transition-all duration-300 motion-safe:hover:-translate-y-1 hover:shadow-md">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-full bg-nomiris-orange text-white text-base font-bold flex items-center justify-center shadow-sm">
                      {s.num}
                    </div>
                    <h3 className="text-lg font-bold text-nomiris-brownDark">
                      {s.title}
                    </h3>
                  </div>
                  <p className="text-sm text-nomiris-textSub leading-relaxed mb-4">
                    {s.description}
                  </p>
                  {s.preview}
                </div>

                {/* 矢印 */}
                {i < steps.length - 1 && (
                  <>
                    <div
                      aria-hidden
                      className="hidden md:flex absolute top-1/2 -right-3 z-10 -translate-y-1/2 h-6 w-6 items-center justify-center rounded-full bg-white border border-nomiris-line text-nomiris-orange text-sm shadow-sm"
                    >
                      →
                    </div>
                    <div
                      aria-hidden
                      className="md:hidden flex justify-center my-1 text-nomiris-orange text-xl"
                    >
                      ↓
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 flex justify-center">
          <Link
            href="/app"
            className="inline-flex items-center justify-center gap-1.5 rounded-full bg-nomiris-orange text-white font-bold px-6 py-3 text-sm shadow-sm hover:bg-nomiris-orangeDark transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
          >
            <span aria-hidden>🐿️</span>
            まず試してみる
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ---------- E / F. Pro 機能セクション ---------- */

interface ProFeature {
  emoji: string;
  title: string;
  description: string;
}

function ProFeatureCard({ emoji, title, description }: ProFeature) {
  return (
    <div className="group rounded-2xl border border-amber-300/60 bg-white/90 p-5 shadow-sm transition-all duration-300 motion-safe:hover:-translate-y-1 hover:shadow-md hover:border-amber-400">
      <div className="flex items-start justify-between mb-3">
        <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 border border-amber-200/60 flex items-center justify-center text-xl">
          <span aria-hidden>{emoji}</span>
        </div>
        <span className="inline-flex items-center gap-0.5 rounded-full border border-amber-300 bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
          <span aria-hidden>✨</span>Pro
        </span>
      </div>
      <h3 className="text-base font-bold text-amber-900 mb-1.5">{title}</h3>
      <p className="text-sm text-amber-900/75 leading-relaxed">{description}</p>
    </div>
  );
}

function BusinessProSection() {
  const features: ProFeature[] = [
    {
      emoji: "📨",
      title: "社内提案メール",
      description: "上司に送る候補店提案を、丁寧で分かりやすい文面に整えます。",
    },
    {
      emoji: "🤝",
      title: "社外共有メール",
      description: "取引先に失礼なく送れる、落ち着いた候補共有文を作れます。",
    },
    {
      emoji: "🌅",
      title: "翌日のお礼メール",
      description: "会食後の翌日に送れる、自然で丁寧なお礼文を作れます。",
    },
    {
      emoji: "🛋️",
      title: "個室・接待向きチェック",
      description: "条件に合った店を提示し、接待向きかコメントを添えます。",
    },
    {
      emoji: "⚠️",
      title: "懸念点チェック",
      description: "候補ごとに気になるポイントを自動抽出します。",
    },
  ];

  return (
    <section
      id="pro"
      className="py-16 md:py-24 scroll-mt-20 relative overflow-hidden"
    >
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-br from-orange-50 via-amber-50/70 to-rose-50/40"
      />
      <div
        aria-hidden
        className="absolute -top-20 right-1/4 -z-10 h-72 w-72 rounded-full bg-amber-200/30 blur-3xl"
      />

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="✨ Business Pro"
          title={
            <>
              会食の店選びから、
              <br className="hidden sm:block" />
              社内提案・社外共有・お礼メールまで。
            </>
          }
          description="上司や社外に送る文面を、失礼なく、自然に整えます。"
        />

        <div className="mt-10 md:mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {features.map((f) => (
            <ProFeatureCard key={f.title} {...f} />
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <Link
            href="/app?mode=business"
            className="inline-flex items-center justify-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold px-6 py-3 text-sm shadow-md hover:from-amber-600 hover:to-orange-600 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
          >
            💼 仕事モードで作る
          </Link>
        </div>
      </div>
    </section>
  );
}

function DateProSection() {
  const features: ProFeature[] = [
    {
      emoji: "💌",
      title: "初デートの誘い文",
      description: "重すぎず自然な誘い文を整えます。",
    },
    {
      emoji: "📍",
      title: "候補店共有 LINE",
      description: "相手に送りやすい短文に整理します。",
    },
    {
      emoji: "🌸",
      title: "デート後のお礼 LINE",
      description: "重すぎず、自然に印象を残す文面に。",
    },
    {
      emoji: "🔁",
      title: "2 回目につなげる LINE",
      description: "次の予定を自然に切り出します。",
    },
    {
      emoji: "🎚️",
      title: "重すぎない文章調整",
      description: "相手との距離感に合わせてトーンを微調整。",
    },
  ];

  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-br from-rose-50 via-amber-50/40 to-yellow-50"
      />
      <div
        aria-hidden
        className="absolute top-20 -left-10 -z-10 h-72 w-72 rounded-full bg-rose-200/30 blur-3xl"
      />

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="✨ Date Pro"
          title={
            <>
              初デートの店選びと LINE 文面を、
              <br className="hidden sm:block" />
              自然にいい感じに。
            </>
          }
          description="誘い方、お店の共有、お礼 LINE、2 回目につなげる一言までサポート。"
        />

        <div className="mt-10 md:mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {features.map((f) => (
            <ProFeatureCard key={f.title} {...f} />
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <Link
            href="/app?mode=date"
            className="inline-flex items-center justify-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold px-6 py-3 text-sm shadow-md hover:from-amber-600 hover:to-orange-600 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
          >
            💕 デートモードで作る
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ---------- G. 料金プレビュー ---------- */

interface PricingCardData {
  title: string;
  price: string;
  unit: string;
  tagline: string;
  features: string[];
  ctaLabel: string;
  ctaHref: string;
  highlight?: boolean;
  badge?: string;
}

function PricingCard({
  title,
  price,
  unit,
  tagline,
  features,
  ctaLabel,
  ctaHref,
  highlight,
  badge,
}: PricingCardData) {
  return (
    <div
      className={`relative rounded-3xl border p-6 md:p-7 flex flex-col gap-4 transition-all duration-300 ${
        highlight
          ? "bg-gradient-to-br from-amber-50 to-orange-50 border-amber-300 ring-2 ring-amber-300/60 shadow-lg lg:scale-105 z-10"
          : "bg-white border-nomiris-line shadow-sm hover:shadow-md"
      }`}
    >
      {badge && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[11px] font-bold px-3 py-1 shadow-md">
          <span aria-hidden>⭐</span>
          {badge}
        </span>
      )}

      <div>
        <h3
          className={`text-lg font-bold ${
            highlight ? "text-amber-900" : "text-nomiris-brownDark"
          }`}
        >
          {title}
        </h3>
        <p
          className={`mt-1 text-xs leading-relaxed ${
            highlight ? "text-amber-900/70" : "text-nomiris-textSub"
          }`}
        >
          {tagline}
        </p>
      </div>

      <div className="flex items-baseline gap-1">
        <span
          className={`text-4xl font-bold ${
            highlight ? "text-amber-900" : "text-nomiris-brownDark"
          }`}
        >
          {price}
        </span>
        <span
          className={`text-xs font-semibold ${
            highlight ? "text-amber-900/70" : "text-nomiris-textSub"
          }`}
        >
          {unit}
        </span>
      </div>

      <ul className="space-y-2">
        {features.map((f) => (
          <li
            key={f}
            className={`flex items-start gap-2 text-sm ${
              highlight ? "text-amber-900" : "text-nomiris-textMain"
            }`}
          >
            <span
              aria-hidden
              className={`mt-0.5 ${highlight ? "text-amber-600" : "text-nomiris-orange"}`}
            >
              ✓
            </span>
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <Link
        href={ctaHref}
        className={`mt-auto inline-flex items-center justify-center gap-1 rounded-full font-bold px-5 py-3 text-sm transition-all duration-200 ${
          highlight
            ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md hover:from-amber-600 hover:to-orange-600 hover:shadow-lg hover:-translate-y-0.5"
            : "bg-white border border-nomiris-line text-nomiris-brown hover:bg-nomiris-cream"
        }`}
      >
        {ctaLabel}
      </Link>
    </div>
  );
}

function PricingPreviewSection() {
  const plans: PricingCardData[] = [
    {
      title: "Free",
      price: "¥0",
      unit: "/ ずっと無料",
      tagline: "友達との飲み会候補を気軽に整理。",
      features: [
        "カジュアル飲みモード",
        "候補店 3 件まで",
        "友達 LINE 用の文面",
        "コピー機能",
        "履歴 1 件保存",
      ],
      ctaLabel: "無料で始める",
      ctaHref: "/app",
    },
    {
      title: "Pro",
      price: "¥300",
      unit: "/ 月（年¥3,000）",
      tagline: "仕事・会食・デートまでしっかりサポート。",
      features: [
        "全モード解放",
        "候補店無制限",
        "社内・社外メール",
        "接待・お礼メール",
        "デート LINE 一式",
        "AI おすすめ順位",
        "比較表のフル列",
        "履歴を無制限",
        "懸念点チェック",
      ],
      ctaLabel: "✨ Pro にアップグレード",
      ctaHref: "/pricing",
      highlight: true,
      badge: "おすすめ",
    },
    {
      title: "エンタープライズ",
      price: "お問い合わせ",
      unit: "ご要望に合わせて",
      tagline: "チームでの導入・カスタマイズに。",
      features: [
        "Pro プランのすべて",
        "チーム共有・複数ユーザー",
        "専任サポート",
        "SSO / SAML",
        "監査ログ・データエクスポート",
        "SLA・カスタム契約",
      ],
      ctaLabel: "📩 ご相談する",
      ctaHref: "/pricing",
    },
  ];

  return (
    <section
      id="pricing-preview"
      className="py-16 md:py-24 bg-white scroll-mt-20"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="料金プラン"
          title="シンプルな料金プラン"
          description="必要な機能だけ選べます。アップグレードはいつでもキャンセル可能です。"
        />

        <div className="mt-10 md:mt-16 grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 lg:items-stretch">
          {plans.map((p) => (
            <PricingCard key={p.title} {...p} />
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/pricing"
            className="inline-flex items-center gap-1 text-sm font-bold text-nomiris-orange hover:text-nomiris-orangeDark transition"
          >
            料金プランを詳しく見る →
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ---------- H. FAQ ---------- */

interface FaqItemProps {
  q: string;
  a: string;
}

function FaqItem({ q, a }: FaqItemProps) {
  return (
    <details className="group rounded-2xl border border-nomiris-line bg-white px-5 py-4 shadow-sm transition-all open:shadow-md open:border-nomiris-orange/30">
      <summary className="flex items-center justify-between gap-3 cursor-pointer list-none">
        <span className="font-bold text-nomiris-brownDark text-sm md:text-base pr-2">
          {q}
        </span>
        <span
          aria-hidden
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-nomiris-cream border border-nomiris-line text-nomiris-orange text-sm font-bold transition-transform duration-300 group-open:rotate-45"
        >
          +
        </span>
      </summary>
      <p className="mt-3 text-sm text-nomiris-textSub leading-relaxed">{a}</p>
    </details>
  );
}

function FaqSection() {
  const items: FaqItemProps[] = [
    {
      q: "飲みリスは店検索アプリですか？",
      a: "いいえ。すでに見つけた候補店を整理し、提案文を作るアプリです。お店探しは食べログ・Google マップ等で行ってください。",
    },
    {
      q: "Free でどこまで使えますか？",
      a: "カジュアル飲みモード・候補店 3 件まで・友達向け文面の生成とコピーが使えます。",
    },
    {
      q: "Pro の支払いはいつから発生しますか？",
      a: "現状は決済導線を準備中で、開発モードでは課金なしで Pro 機能を試せます。",
    },
    {
      q: "スマホでも使えますか？",
      a: "はい。スマホ最適化済で、PWA としてホーム画面に追加できます。",
    },
    {
      q: "データはどこに保存されますか？",
      a: "現状はブラウザの localStorage のみ。アカウント連携は今後対応予定です。",
    },
    {
      q: "法人での利用は可能ですか？",
      a: "個人 Pro として利用可能です。チームプランは検討中です。",
    },
    {
      q: "食べログ・ぐるなびと連携できますか？",
      a: "ホットペッパーグルメと連携済みです。食べログ・ぐるなびは API 制約により未対応です。",
    },
    {
      q: "解約はいつでもできますか？",
      a: "はい、Pro はいつでも解約できます（実決済導入後）。",
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-white to-nomiris-cream/40">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="よくある質問"
          title="FAQ"
          description="お問い合わせ前にこちらをご確認ください。"
        />
        <div className="mt-10 md:mt-12 space-y-3">
          {items.map((item) => (
            <FaqItem key={item.q} {...item} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- I. 最終 CTA ---------- */

function FinalCtaSection() {
  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-br from-nomiris-orange via-orange-400 to-amber-400"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />
      {/* 大きなリスシルエット */}
      <div
        aria-hidden
        className="absolute -bottom-10 -right-10 text-[16rem] md:text-[20rem] opacity-15 leading-none select-none rotate-12"
      >
        🐿️
      </div>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center relative">
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white leading-tight drop-shadow-sm">
          今すぐ、候補案づくりを
          <br className="sm:hidden" />
          始めよう。
        </h2>
        <p className="mt-4 text-base md:text-lg text-white/90">
          無料で 3 ステップ。インストール不要。
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/app"
            className="inline-flex items-center justify-center gap-1.5 rounded-full bg-white text-nomiris-orangeDark font-bold px-7 py-4 text-base shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5"
          >
            <span aria-hidden>🐿️</span>
            無料で候補案を作る
          </Link>
          <Link
            href="/pricing"
            className="inline-flex items-center justify-center gap-1 rounded-full bg-white/15 backdrop-blur text-white font-bold px-7 py-4 text-base border border-white/40 hover:bg-white/25 transition"
          >
            料金プランを見る
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ---------- J. フッター ---------- */

function Footer() {
  return (
    <footer className="bg-nomiris-brownDark text-white/85">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 md:py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl" aria-hidden>
                🐿️
              </span>
              <span className="font-extrabold tracking-tight text-white text-lg">
                飲み<span className="text-amber-300">リス</span>
              </span>
            </div>
            <p className="mt-3 text-sm text-white/65 leading-relaxed max-w-sm">
              飲み会・会食・デートの候補案を、きれいに一発作成する幹事向け Web アプリ。
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white/60 mb-3">
              サービス
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/app" className="hover:text-white transition">
                  アプリを開く
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-white transition">
                  料金プラン
                </Link>
              </li>
              <li>
                <Link href="/history" className="hover:text-white transition">
                  履歴
                </Link>
              </li>
              <li>
                <Link href="/#features" className="hover:text-white transition">
                  できること
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white/60 mb-3">
              サポート
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-white transition">
                  ヘルプ
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  お問い合わせ
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  利用規約
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  プライバシー
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-2">
          <InstallButton className="inline-flex items-center justify-center gap-1 rounded-full border border-white/30 bg-white/10 text-white font-bold px-3 py-1.5 text-xs hover:bg-white/20 transition" />
        </div>

        <div className="mt-6 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-white/50">
          <span>© 2026 飲みリス</span>
          <span>データはブラウザの localStorage にのみ保存されます</span>
        </div>
      </div>
    </footer>
  );
}

/* ---------- ページ本体 ---------- */

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1">
        <Hero />
        <FeaturesSection />
        <ModesSection />
        <FlowSection />
        <BusinessProSection />
        <DateProSection />
        <PricingPreviewSection />
        <FaqSection />
        <FinalCtaSection />
      </main>
      <Footer />
    </div>
  );
}
