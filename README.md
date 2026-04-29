# 飲みリス🐿️ (nomiris)

> **飲み会・会食の候補案を、きれいに一発作成。**

## アプリ概要

飲みリス🐿️ は、飲み会・会食・懇親会・デートの幹事のための **候補店まとめ＆提案文ジェネレーター** です。

- 用途に合わせて 3 モード（カジュアル飲み / 仕事・会食 / デート）を選び
- 候補店をピックして比較し
- LINE / Slack / メールにそのまま貼れる **提案文を 1 クリックで生成** します。

店舗検索・空席確認・予約・AI 連携などは **行いません**。あくまで「メモして整える」ための、実用的な MVP ツールです。

すべてのデータはブラウザの `localStorage` にのみ保存されるため、サーバー・アカウントは不要です。

## モード

- 🍻 **カジュアル飲み**（Free）— 友達・サークル・同期との飲み会向け。LINE / 連絡文 / 共有文。
- 💼 **仕事・会食**（Pro）— 社内提案メール、上司確認、社外メール、接待、お礼メール。
- 💕 **デート**（Pro）— 初デートの誘い、候補共有 LINE、リマインド、お礼、2 回目につなげる文面。

## プラン

| プラン | 価格 | できること |
| --- | --- | --- |
| Free | ¥0 | 候補店 3 件まで・カジュアル提案文・履歴最新 1 件 |
| Pro | ¥680/月 | 候補店無制限・全テンプレ解放・AI 比較表・履歴無制限 |
| 1回チケット | ¥200 | Pro 機能を 1 回だけ使える |

> **MVP 版の現状**: 決済プロバイダ（Stripe / PayPay）は scaffold のみ。env 未設定なら「Pro にアップグレード」を押すと開発モードとして `localStorage` の `nomiris.plan.v1` に `pro` が書き込まれるだけです。`/pricing` の「プランをリセット」ボタンで Free に戻せます。

## 使用技術

| 区分 | 内容 |
| --- | --- |
| フレームワーク | Next.js 15 (App Router) |
| 言語 | TypeScript (strict) |
| スタイル | Tailwind CSS v3 |
| UI | React 19、スマホファースト |
| 永続化 | ブラウザの `localStorage` |
| 外部 API | HotPepper Gourmet Search API（候補取得） |
| 決済 | Stripe / PayPay（API ルートは scaffold のみ、未実装） |

## ローカル起動方法

```bash
cd nomiris
npm install
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開きます。

## ビルド方法

```bash
npm run build
npm start
```

その他のスクリプト:

```bash
npm run lint   # ESLint チェック
```

## 環境変数

`.env.local` に以下を設定します（すべて任意。未設定でも起動可）。

```
# HotPepper Gourmet Search API（実候補の取得に使う。未設定の場合は組み込みカタログにフォールバック）
HOTPEPPER_API_KEY=

# 将来用：決済プロバイダ。未設定の場合は dev モードで localStorage に書き込むだけ。
STRIPE_SECRET_KEY=
PAYPAY_API_KEY=
```

## 開発時のプランリセット手順

- `/pricing` ページの「プランをリセット（Free に戻す）」ボタンを押す。
- もしくはブラウザの DevTools → Application → Local Storage で `nomiris.plan.v1` を削除する。

## localStorage キー

- `nomiris.condition.v4` — 入力中の条件（モード追加に伴い v3 → v4）
- `nomiris.plan.v1` — 現在のプラン（`free` / `pro`）
- `nomiris.history.v1` — 提案文の生成履歴

## GitHub への push 方法

```bash
git add .
git commit -m "feat: <変更内容>"
git push origin main
```

`main` への push で Vercel が自動再デプロイします。

## Vercel デプロイ手順（既に稼働中）

1. GitHub の `s1610380-source/nomiris` の `main` ブランチ push で自動デプロイ。
2. 環境変数（`HOTPEPPER_API_KEY` 等）は Vercel の Project Settings → Environment Variables から設定。

## ディレクトリ構成

```
nomiris/
├─ app/
│  ├─ components/                 # UI コンポーネント
│  │  ├─ Header.tsx               # ロゴ + 履歴 / 料金ナビ + プランバッジ
│  │  ├─ HomeHero.tsx             # トップのヒーロー + 3 モードカード
│  │  ├─ StepIndicator.tsx
│  │  ├─ Step1ConditionForm.tsx   # モードチップ + 条件入力
│  │  ├─ Step2Picker.tsx          # 候補ピック（カード / 比較表タブ）
│  │  ├─ Step3Proposal.tsx        # テンプレ別の提案文生成
│  │  ├─ CandidateCard.tsx
│  │  ├─ AddRestaurantForm.tsx
│  │  ├─ ProBadge.tsx             # Pro バッジ
│  │  ├─ ProLock.tsx              # Pro 限定エリアのオーバーレイ
│  │  └─ UpsellModal.tsx          # アップセル モーダル + Provider
│  ├─ lib/
│  │  ├─ types.ts                 # 型定義（Mode / Plan / Restaurant 等）
│  │  ├─ mockData.ts              # DEFAULT_CONDITION / STORAGE_KEYS / AREA_SUGGESTIONS
│  │  ├─ catalog.ts               # 22 件の組み込みカタログ
│  │  ├─ pick.ts                  # pickCandidates ロジック
│  │  ├─ hotpepper.ts             # HotPepper レスポンス → Restaurant 変換
│  │  ├─ templates.ts             # モード別テンプレ文面
│  │  ├─ history.ts               # 履歴保存・読み込み
│  │  ├─ plan.ts                  # usePlan / Plan 型
│  │  ├─ mode.ts                  # MODE_LABELS / SCENE_OPTIONS_BY_MODE 等
│  │  └─ checkout.ts              # 決済セッション開始（フロント）
│  ├─ api/
│  │  ├─ hotpepper/route.ts       # HotPepper Gourmet API プロキシ
│  │  └─ checkout/route.ts        # Stripe / PayPay scaffold（未実装）
│  ├─ pricing/page.tsx            # 料金プランページ
│  ├─ history/page.tsx            # 履歴ページ
│  ├─ globals.css
│  ├─ layout.tsx
│  └─ page.tsx
├─ public/
├─ tailwind.config.ts
├─ postcss.config.mjs
├─ next.config.ts
├─ tsconfig.json
└─ package.json
```
