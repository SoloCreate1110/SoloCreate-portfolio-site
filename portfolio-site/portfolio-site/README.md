# BOLD Portfolio - ポートフォリオサイト

Next.js 16 (App Router) + TypeScript + Tailwind CSS で構築された、ネオブルータリズムスタイルのポートフォリオサイトです。

## 特徴

- **モダンな技術スタック**: Next.js 16 (App Router), TypeScript, Tailwind CSS
- **ネオブルータリズムデザイン**: 太い黒枠線、大胆なタイポグラフィ、アクセントカラー
- **レスポンシブ対応**: モバイル、タブレット、デスクトップに完全対応
- **SEO最適化**: SSG/SSR対応、サイトマップ、robots.txt、OGP設定
- **ギャラリー機能**: グリッド/カルーセル/フィード表示の切り替え
- **いいね・コメント機能**: インタラクティブな機能（Supabase連携準備済み）
- **ブログ機能**: Markdown対応のブログシステム

## ディレクトリ構成

```
portfolio-site/
├── src/
│   ├── app/                    # App Router ページ
│   │   ├── page.tsx           # トップページ
│   │   ├── layout.tsx         # ルートレイアウト
│   │   ├── globals.css        # グローバルスタイル
│   │   ├── works/             # 作品ページ
│   │   │   ├── page.tsx       # 作品一覧
│   │   │   └── [id]/          # 作品詳細
│   │   ├── blog/              # ブログページ
│   │   │   ├── page.tsx       # ブログ一覧
│   │   │   └── [slug]/        # ブログ詳細
│   │   ├── about/             # プロフィールページ
│   │   ├── contact/           # コンタクトページ
│   │   ├── sitemap.ts         # サイトマップ生成
│   │   ├── robots.ts          # robots.txt生成
│   │   └── not-found.tsx      # 404ページ
│   ├── components/             # コンポーネント
│   │   ├── layout/            # レイアウト系
│   │   │   ├── Header.tsx
│   │   │   └── Footer.tsx
│   │   ├── ui/                # UI系
│   │   │   ├── Button.tsx
│   │   │   ├── Badge.tsx
│   │   │   └── SectionHeader.tsx
│   │   ├── gallery/           # ギャラリー系
│   │   │   ├── WorkCard.tsx
│   │   │   ├── GalleryGrid.tsx
│   │   │   ├── GalleryCarousel.tsx
│   │   │   ├── GalleryFeed.tsx
│   │   │   ├── GalleryViewToggle.tsx
│   │   │   └── GalleryFilter.tsx
│   │   └── common/            # 共通
│   │       ├── HeroSection.tsx
│   │       └── ContactSection.tsx
│   ├── lib/                    # ユーティリティ
│   │   ├── supabase.ts        # Supabaseクライアント
│   │   └── utils.ts           # ヘルパー関数
│   ├── types/                  # 型定義
│   │   └── index.ts
│   └── data/                   # ダミーデータ
│       └── dummy.ts
├── supabase/
│   └── schema.sql             # データベーススキーマ
├── public/                     # 静的ファイル
├── next.config.ts             # Next.js設定
├── tailwind.config.ts         # Tailwind設定
├── tsconfig.json              # TypeScript設定
└── package.json
```

## セットアップ

### 必要条件

- Node.js 18以上
- pnpm (推奨) または npm

### インストール

```bash
# リポジトリをクローン
git clone <repository-url>
cd portfolio-site

# 依存関係をインストール
pnpm install

# 開発サーバーを起動
pnpm dev
```

### 環境変数

`.env.local` ファイルを作成し、以下の環境変数を設定してください：

```env
# サイトURL（SEO/OGP用）
NEXT_PUBLIC_SITE_URL=https://your-domain.com

# Supabase設定
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## データベース設計

Supabaseを使用する場合、`supabase/schema.sql` のスキーマを実行してください。

### 主要テーブル

| テーブル | 説明 |
|---------|------|
| `profiles` | ユーザープロフィール |
| `works` | 作品データ |
| `work_media` | 作品メディア（画像・動画） |
| `tags` | タグマスタ |
| `work_tags` | 作品-タグ中間テーブル |
| `likes` | いいね |
| `comments` | コメント |
| `blog_posts` | ブログ記事 |

## 主要コンポーネント

### ギャラリー表示

3種類の表示モードをサポート：

```tsx
// グリッド表示
<GalleryGrid works={works} columns={3} />

// カルーセル表示
<GalleryCarousel works={works} />

// フィード表示
<GalleryFeed works={works} />
```

### フィルタリング

カテゴリ、タグ、ソートによるフィルタリング：

```tsx
<GalleryFilter
  categories={categories}
  tags={tags}
  selectedCategory={selectedCategory}
  selectedTag={selectedTag}
  sortOption={sortOption}
  onCategoryChange={setSelectedCategory}
  onTagChange={setSelectedTag}
  onSortChange={setSortOption}
/>
```

## カスタマイズ

### デザインのカスタマイズ

`src/app/globals.css` でカスタムスタイルを定義しています：

```css
/* アクセントカラーの変更 */
.btn-brutal-accent {
  background-color: #your-color;
}

/* ボーダーの太さ変更 */
.card-brutal {
  border-width: 4px; /* 変更可能 */
}
```

### ダミーデータの置き換え

`src/data/dummy.ts` のデータを実際のSupabaseクエリに置き換えてください：

```tsx
// Before (ダミーデータ)
import { dummyWorks } from '@/data/dummy';

// After (Supabase)
const { data: works } = await supabase
  .from('works')
  .select('*, tags(*)')
  .eq('status', 'public')
  .order('published_at', { ascending: false });
```

## デプロイ

### Vercelへのデプロイ

```bash
# Vercel CLIでデプロイ
vercel
```

### その他のプラットフォーム

```bash
# プロダクションビルド
pnpm build

# 静的エクスポート（必要な場合）
pnpm build && pnpm export
```

## ライセンス

MIT License

---

Built with ❤️ using Next.js, TypeScript, and Tailwind CSS
