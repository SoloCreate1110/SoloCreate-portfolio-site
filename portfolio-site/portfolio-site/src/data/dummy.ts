import { Work, Profile, BlogPost, Tag, Comment } from '@/types';

// ダミープロフィール
export const dummyProfile: Profile = {
  id: '1',
  user_id: 'user-1',
  name: '山田 太郎',
  name_en: 'YAMADA TARO',
  role: 'Graphic Designer',
  bio: 'ルールを壊し、新しい価値を創造する。\n東京を拠点に活動するデザイナー。\n\nグラフィック、ウェブ、UI/UXなど、媒体にとらわれず最適なアウトプットを追求します。',
  avatar_url: '/images/avatar.jpg',
  website: 'https://example.com',
  twitter: 'https://twitter.com/example',
  instagram: 'https://instagram.com/example',
  github: 'https://github.com/example',
  email: 'hello@example.com',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

// ダミータグ
export const dummyTags: Tag[] = [
  { id: '1', name: 'イラスト', slug: 'illustration', created_at: '2024-01-01T00:00:00Z' },
  { id: '2', name: 'ロゴデザイン', slug: 'logo-design', created_at: '2024-01-01T00:00:00Z' },
  { id: '3', name: 'Webデザイン', slug: 'web-design', created_at: '2024-01-01T00:00:00Z' },
  { id: '4', name: 'ブランディング', slug: 'branding', created_at: '2024-01-01T00:00:00Z' },
  { id: '5', name: 'モーション', slug: 'motion', created_at: '2024-01-01T00:00:00Z' },
  { id: '6', name: 'UI/UX', slug: 'ui-ux', created_at: '2024-01-01T00:00:00Z' },
];

// ダミー作品
export const dummyWorks: Work[] = [
  {
    id: '1',
    author_id: 'user-1',
    title: 'Brand Identity Design',
    description: 'スタートアップ企業のブランドアイデンティティデザイン。ロゴ、名刺、ウェブサイトまで一貫したデザインシステムを構築しました。\n\nクライアントの「革新的でありながら信頼感のある」というコンセプトを、幾何学的なフォルムと落ち着いたカラーパレットで表現しています。',
    category: 'image',
    status: 'public',
    thumbnail_url: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=800&fit=crop',
    published_at: '2024-12-01T00:00:00Z',
    created_at: '2024-12-01T00:00:00Z',
    updated_at: '2024-12-01T00:00:00Z',
    deleted_at: null,
    like_count: 128,
    comment_count: 12,
    view_count: 1520,
    author: dummyProfile,
    tags: [dummyTags[1], dummyTags[3]],
  },
  {
    id: '2',
    author_id: 'user-1',
    title: 'Abstract Illustration Series',
    description: '抽象的な形と色彩で感情を表現したイラストレーションシリーズ。デジタルとアナログの技法を組み合わせて制作しました。',
    category: 'image',
    status: 'public',
    thumbnail_url: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800&h=800&fit=crop',
    published_at: '2024-11-15T00:00:00Z',
    created_at: '2024-11-15T00:00:00Z',
    updated_at: '2024-11-15T00:00:00Z',
    deleted_at: null,
    like_count: 256,
    comment_count: 24,
    view_count: 2340,
    author: dummyProfile,
    tags: [dummyTags[0]],
  },
  {
    id: '3',
    author_id: 'user-1',
    title: 'E-Commerce Website',
    description: 'ファッションブランドのECサイトデザイン。ユーザー体験を重視し、商品の魅力を最大限に引き出すUIを設計しました。',
    category: 'web',
    status: 'public',
    thumbnail_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=800&fit=crop',
    published_at: '2024-11-01T00:00:00Z',
    created_at: '2024-11-01T00:00:00Z',
    updated_at: '2024-11-01T00:00:00Z',
    deleted_at: null,
    like_count: 89,
    comment_count: 8,
    view_count: 980,
    author: dummyProfile,
    tags: [dummyTags[2], dummyTags[5]],
  },
  {
    id: '4',
    author_id: 'user-1',
    title: 'Motion Graphics Reel',
    description: 'モーショングラフィックスの作品集。After EffectsとCinema 4Dを使用して制作しました。',
    category: 'video',
    status: 'public',
    thumbnail_url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&h=800&fit=crop',
    published_at: '2024-10-20T00:00:00Z',
    created_at: '2024-10-20T00:00:00Z',
    updated_at: '2024-10-20T00:00:00Z',
    deleted_at: null,
    like_count: 312,
    comment_count: 45,
    view_count: 4200,
    author: dummyProfile,
    tags: [dummyTags[4]],
  },
  {
    id: '5',
    author_id: 'user-1',
    title: 'Typography Poster',
    description: 'タイポグラフィを主役にしたポスターデザイン。文字の持つ力強さと美しさを追求しました。',
    category: 'image',
    status: 'public',
    thumbnail_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=800&fit=crop',
    published_at: '2024-10-10T00:00:00Z',
    created_at: '2024-10-10T00:00:00Z',
    updated_at: '2024-10-10T00:00:00Z',
    deleted_at: null,
    like_count: 178,
    comment_count: 15,
    view_count: 1890,
    author: dummyProfile,
    tags: [dummyTags[0], dummyTags[3]],
  },
  {
    id: '6',
    author_id: 'user-1',
    title: 'Mobile App UI Design',
    description: 'フィットネスアプリのUIデザイン。ユーザーのモチベーションを高めるビジュアルとインタラクションを設計しました。',
    category: 'web',
    status: 'public',
    thumbnail_url: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=800&fit=crop',
    published_at: '2024-09-25T00:00:00Z',
    created_at: '2024-09-25T00:00:00Z',
    updated_at: '2024-09-25T00:00:00Z',
    deleted_at: null,
    like_count: 145,
    comment_count: 18,
    view_count: 1650,
    author: dummyProfile,
    tags: [dummyTags[5]],
  },
  {
    id: '7',
    author_id: 'user-1',
    title: 'Geometric Art Collection',
    description: '幾何学的なパターンを用いたアート作品コレクション。数学的な美しさと有機的な表現の融合を目指しました。',
    category: 'image',
    status: 'public',
    thumbnail_url: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=800&h=800&fit=crop',
    published_at: '2024-09-10T00:00:00Z',
    created_at: '2024-09-10T00:00:00Z',
    updated_at: '2024-09-10T00:00:00Z',
    deleted_at: null,
    like_count: 201,
    comment_count: 22,
    view_count: 2100,
    author: dummyProfile,
    tags: [dummyTags[0]],
  },
  {
    id: '8',
    author_id: 'user-1',
    title: 'Corporate Website Redesign',
    description: '大手企業のコーポレートサイトリニューアル。ブランドイメージを刷新しながら、使いやすさを向上させました。',
    category: 'web',
    status: 'public',
    thumbnail_url: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=800&h=800&fit=crop',
    published_at: '2024-08-20T00:00:00Z',
    created_at: '2024-08-20T00:00:00Z',
    updated_at: '2024-08-20T00:00:00Z',
    deleted_at: null,
    like_count: 98,
    comment_count: 11,
    view_count: 1120,
    author: dummyProfile,
    tags: [dummyTags[2], dummyTags[3]],
  },
  {
    id: '9',
    author_id: 'user-1',
    title: 'Character Design',
    description: 'ゲーム用キャラクターデザイン。個性的でありながら親しみやすいキャラクターを目指しました。',
    category: 'image',
    status: 'public',
    thumbnail_url: 'https://images.unsplash.com/photo-1569437061241-a848be43cc82?w=800&h=800&fit=crop',
    published_at: '2024-08-05T00:00:00Z',
    created_at: '2024-08-05T00:00:00Z',
    updated_at: '2024-08-05T00:00:00Z',
    deleted_at: null,
    like_count: 287,
    comment_count: 32,
    view_count: 3200,
    author: dummyProfile,
    tags: [dummyTags[0]],
  },
];

// ダミーブログ記事
export const dummyBlogPosts: BlogPost[] = [
  {
    id: '1',
    author_id: 'user-1',
    title: 'デザインプロセスについて考える',
    slug: 'design-process',
    content: `# デザインプロセスについて考える

デザインとは、単なる見た目の装飾ではありません。それは課題解決のための思考プロセスであり、コミュニケーションの手段です。

## なぜプロセスが重要なのか

良いデザインは偶然生まれるものではありません。体系的なプロセスを経ることで、より確実に目標を達成できます。

### 1. リサーチ

まずは徹底的なリサーチから始めます。クライアントのビジネス、ターゲットユーザー、競合他社について深く理解することが重要です。

### 2. コンセプト設計

リサーチで得た知見をもとに、デザインの方向性を決定します。この段階でしっかりとしたコンセプトを固めることで、後の工程がスムーズになります。

### 3. プロトタイピング

アイデアを形にしていきます。最初は荒いスケッチから始め、徐々に精度を上げていきます。

### 4. フィードバックと改善

クライアントやユーザーからのフィードバックを受け、改善を重ねます。この反復が最終的な品質を決定します。

## まとめ

デザインプロセスは一見遠回りに見えるかもしれませんが、結果的には最短距離で目標に到達する方法です。`,
    excerpt: 'デザインとは、単なる見た目の装飾ではありません。それは課題解決のための思考プロセスであり、コミュニケーションの手段です。',
    thumbnail_url: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=1200&h=630&fit=crop',
    status: 'public',
    published_at: '2024-12-10T00:00:00Z',
    created_at: '2024-12-10T00:00:00Z',
    updated_at: '2024-12-10T00:00:00Z',
    deleted_at: null,
    author: dummyProfile,
    tags: [dummyTags[3]],
  },
  {
    id: '2',
    author_id: 'user-1',
    title: '2024年のデザイントレンド振り返り',
    slug: 'design-trends-2024',
    content: `# 2024年のデザイントレンド振り返り

2024年も様々なデザイントレンドが生まれました。今年特に印象的だったトレンドを振り返ります。

## ネオブルータリズムの進化

ネオブルータリズムは2023年から続くトレンドですが、2024年はより洗練された形で多くのプロジェクトに採用されました。

## AIとデザインの融合

生成AIの進化により、デザインワークフローが大きく変化しました。AIはツールとして活用しつつ、人間ならではの創造性を発揮することが重要です。

## サステナブルデザイン

環境への配慮がデザインにも求められるようになりました。デジタルカーボンフットプリントを意識したウェブデザインが注目されています。`,
    excerpt: '2024年も様々なデザイントレンドが生まれました。今年特に印象的だったトレンドを振り返ります。',
    thumbnail_url: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=1200&h=630&fit=crop',
    status: 'public',
    published_at: '2024-12-05T00:00:00Z',
    created_at: '2024-12-05T00:00:00Z',
    updated_at: '2024-12-05T00:00:00Z',
    deleted_at: null,
    author: dummyProfile,
    tags: [dummyTags[2], dummyTags[5]],
  },
  {
    id: '3',
    author_id: 'user-1',
    title: 'フリーランスデザイナーとして独立して3年',
    slug: 'freelance-3years',
    content: `# フリーランスデザイナーとして独立して3年

フリーランスとして独立してから3年が経ちました。この3年間で学んだことを共有します。

## 独立のきっかけ

会社員時代、自分のペースで仕事をしたい、もっと多様なプロジェクトに携わりたいという思いが強くなりました。

## 最初の1年

正直、最初の1年は大変でした。営業、経理、実務をすべて一人でこなす必要があり、時間管理に苦労しました。

## 転機となった出来事

2年目に大きなプロジェクトを任せていただいたことが転機となりました。このプロジェクトを通じて、自分の強みを再認識できました。

## これからの目標

今後は、より大きなプロジェクトに挑戦しつつ、後進の育成にも力を入れていきたいと考えています。`,
    excerpt: 'フリーランスとして独立してから3年が経ちました。この3年間で学んだことを共有します。',
    thumbnail_url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&h=630&fit=crop',
    status: 'public',
    published_at: '2024-11-20T00:00:00Z',
    created_at: '2024-11-20T00:00:00Z',
    updated_at: '2024-11-20T00:00:00Z',
    deleted_at: null,
    author: dummyProfile,
    tags: [],
  },
];

// ダミーコメント
export const dummyComments: Comment[] = [
  {
    id: '1',
    user_id: 'user-2',
    work_id: '1',
    content: '素晴らしいデザインですね！色使いがとても参考になります。',
    created_at: '2024-12-02T10:00:00Z',
    updated_at: '2024-12-02T10:00:00Z',
    deleted_at: null,
    user: {
      ...dummyProfile,
      id: '2',
      name: '佐藤 花子',
      name_en: 'SATO HANAKO',
    },
  },
  {
    id: '2',
    user_id: 'user-3',
    work_id: '1',
    content: 'ブランディングの一貫性が素晴らしいです。どのくらいの期間で制作されましたか？',
    created_at: '2024-12-03T14:30:00Z',
    updated_at: '2024-12-03T14:30:00Z',
    deleted_at: null,
    user: {
      ...dummyProfile,
      id: '3',
      name: '鈴木 一郎',
      name_en: 'SUZUKI ICHIRO',
    },
  },
];

// ヘルパー関数
export function getWorkById(id: string): Work | undefined {
  return dummyWorks.find(work => work.id === id);
}

export function getWorksByCategory(category: string): Work[] {
  return dummyWorks.filter(work => work.category === category);
}

export function getWorksByTag(tagSlug: string): Work[] {
  return dummyWorks.filter(work => 
    work.tags?.some(tag => tag.slug === tagSlug)
  );
}

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return dummyBlogPosts.find(post => post.slug === slug);
}

export function getRelatedWorks(workId: string, limit: number = 3): Work[] {
  const work = getWorkById(workId);
  if (!work) return [];
  
  return dummyWorks
    .filter(w => w.id !== workId && (
      w.category === work.category ||
      w.tags?.some(t => work.tags?.some(wt => wt.id === t.id))
    ))
    .slice(0, limit);
}
