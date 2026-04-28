# 飲みリス🐿️ (nomiris)

> **飲み会候補、サクッとまとめる。**

## アプリ概要

飲みリス🐿️ は、飲み会・会食・懇親会の幹事のための **候補店まとめ＆提案文ジェネレーター** です。

- 自分で見つけた候補店を整理し
- 前提条件（エリア・予算・雰囲気など）と組み合わせて
- LINE / Slack / メールにそのまま貼れる **提案文を 1 クリックで生成** します。

店舗検索・空席確認・予約・AI 連携などは **行いません**。あくまで「メモして整える」ための、シンプルで実用的な MVP ツールです。

すべてのデータはブラウザの `localStorage` にのみ保存されるため、サーバー・アカウントは不要です。

## 使用技術

| 区分 | 内容 |
| --- | --- |
| フレームワーク | Next.js 15 (App Router) |
| 言語 | TypeScript (strict) |
| スタイル | Tailwind CSS v3 |
| UI | React 19, スマホファースト 1 ページ構成 |
| 永続化 | ブラウザの `localStorage` |
| 外部 API | なし（環境変数も不要） |

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

`npm start` は本番ビルドの結果をローカルで起動します。

その他のスクリプト:

```bash
npm run lint   # ESLint チェック
```

## GitHub への push 方法

GitHub CLI (`gh`) が使える場合:

```bash
gh repo create nomiris --public --source=. --push
```

`gh` 未ログイン or 未インストールの場合は、GitHub の Web 画面で空のリポジトリを作成してから:

```bash
git init                                       # 初回のみ（このリポジトリは初期化済み）
git add .
git commit -m "feat: initial commit"
git branch -M main
git remote add origin git@github.com:<your-account>/nomiris.git
git push -u origin main
```

## Vercel デプロイ手順

1. GitHub に nomiris リポジトリを push する。
2. [Vercel](https://vercel.com/) にログインする（GitHub 連携を許可）。
3. ダッシュボードの **Add New… → Project** をクリック。
4. **Import Git Repository** から `nomiris` を選択する。
5. Framework Preset が **Next.js** であることを確認する。
6. Root Directory はデフォルト（`./`）のまま。
7. Build Command / Output Directory も Vercel の自動検出で OK（変更不要）。
8. **環境変数は設定不要** （このアプリは外部 API・環境変数を使いません）。
9. **Deploy** ボタンを押す。数十秒で `https://nomiris-xxxx.vercel.app` のような URL が発行されます。

## 今後追加したい機能

- Supabase 連携（複数端末でのデータ同期）
- ログイン機能（メール / OAuth）
- 共有 URL の発行（候補リストをチームに共有）
- AI コメント生成（おすすめポイント・注意点の自動下書き）
- Google Maps URL から店舗情報（店名・エリア・評価）の自動取得
- 食べログ URL からメモを自動生成
- 複数イベントの管理（同時並行で別々の飲み会を整理）
- テンプレート保存（よく使う前提条件を保存・呼び出し）
- PWA 化（ホーム画面追加・オフライン対応）

## ディレクトリ構成

```
nomiris/
├─ app/
│  ├─ components/        # UIコンポーネント
│  │  ├─ Header.tsx
│  │  ├─ SectionCard.tsx
│  │  ├─ ConditionForm.tsx
│  │  ├─ RestaurantForm.tsx
│  │  ├─ RestaurantList.tsx
│  │  └─ ProposalPanel.tsx
│  ├─ lib/
│  │  ├─ types.ts            # EventCondition / Restaurant 等の型
│  │  ├─ mockData.ts         # 初期モック・localStorage キー
│  │  └─ generateProposal.ts # 提案文ジェネレーター
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
