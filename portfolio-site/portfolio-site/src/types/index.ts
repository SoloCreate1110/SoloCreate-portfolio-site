// ============================================
// データモデル型定義（Supabase想定）
// ============================================

// ユーザー関連
export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  name: string;
  name_en: string;
  role: string;
  bio: string;
  avatar_url: string | null;
  website: string | null;
  twitter: string | null;
  instagram: string | null;
  github: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
}

// 作品関連
export type WorkCategory = 'image' | 'video' | 'audio' | 'text' | 'web';
export type WorkStatus = 'draft' | 'public' | 'private';

export interface Work {
  id: string;
  author_id: string;
  title: string;
  description: string;
  category: WorkCategory;
  status: WorkStatus;
  thumbnail_url: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  like_count: number;
  comment_count: number;
  view_count: number;
  // リレーション
  author?: Profile;
  media?: WorkMedia[];
  tags?: Tag[];
}

export interface WorkMedia {
  id: string;
  work_id: string;
  type: 'image' | 'video' | 'audio' | 'embed';
  url: string;
  thumbnail_url: string | null;
  order: number;
  created_at: string;
}

// タグ関連
export interface Tag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface WorkTag {
  work_id: string;
  tag_id: string;
}

// いいね関連
export interface Like {
  id: string;
  user_id: string;
  work_id: string;
  created_at: string;
}

// コメント関連
export interface Comment {
  id: string;
  user_id: string;
  work_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  // リレーション
  user?: Profile;
}

// ブログ関連
export interface BlogPost {
  id: string;
  author_id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  thumbnail_url: string | null;
  status: 'draft' | 'public' | 'private';
  published_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  // リレーション
  author?: Profile;
  tags?: Tag[];
}

// ギャラリー表示モード
export type GalleryViewMode = 'grid' | 'carousel' | 'feed';

// ソートオプション
export type SortOption = 'newest' | 'popular' | 'comments';

// フィルターオプション
export interface FilterOptions {
  category?: WorkCategory;
  tag?: string;
  sort?: SortOption;
}

// ページネーション
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// API レスポンス
export interface ApiResponse<T> {
  data: T;
  error?: string;
  pagination?: PaginationInfo;
}
