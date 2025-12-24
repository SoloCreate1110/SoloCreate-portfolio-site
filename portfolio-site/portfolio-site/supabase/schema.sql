-- ============================================
-- Supabase テーブル設計
-- ポートフォリオサイト用データベーススキーマ
-- ============================================

-- 拡張機能の有効化
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- プロフィールテーブル
-- ============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  name TEXT NOT NULL,
  name_en TEXT,
  role TEXT,
  bio TEXT,
  avatar_url TEXT,
  website TEXT,
  twitter TEXT,
  instagram TEXT,
  github TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- プロフィールのRLS（Row Level Security）
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "プロフィールは誰でも閲覧可能" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "ユーザーは自分のプロフィールを更新可能" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- タグテーブル
-- ============================================
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- タグのRLS
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "タグは誰でも閲覧可能" ON tags
  FOR SELECT USING (true);

-- ============================================
-- 作品テーブル
-- ============================================
CREATE TYPE work_category AS ENUM ('image', 'video', 'audio', 'text', 'web');
CREATE TYPE work_status AS ENUM ('draft', 'public', 'private');

CREATE TABLE works (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category work_category NOT NULL DEFAULT 'image',
  status work_status NOT NULL DEFAULT 'draft',
  thumbnail_url TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE,
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0
);

-- 作品のRLS
ALTER TABLE works ENABLE ROW LEVEL SECURITY;

CREATE POLICY "公開作品は誰でも閲覧可能" ON works
  FOR SELECT USING (status = 'public' AND deleted_at IS NULL);

CREATE POLICY "作者は自分の作品を全て閲覧可能" ON works
  FOR SELECT USING (author_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "作者は作品を作成可能" ON works
  FOR INSERT WITH CHECK (author_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "作者は自分の作品を更新可能" ON works
  FOR UPDATE USING (author_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "作者は自分の作品を削除可能" ON works
  FOR DELETE USING (author_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- インデックス
CREATE INDEX idx_works_author ON works(author_id);
CREATE INDEX idx_works_status ON works(status);
CREATE INDEX idx_works_category ON works(category);
CREATE INDEX idx_works_published_at ON works(published_at DESC);

-- ============================================
-- 作品メディアテーブル
-- ============================================
CREATE TYPE media_type AS ENUM ('image', 'video', 'audio', 'embed');

CREATE TABLE work_media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  work_id UUID REFERENCES works(id) ON DELETE CASCADE NOT NULL,
  type media_type NOT NULL DEFAULT 'image',
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 作品メディアのRLS
ALTER TABLE work_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "作品メディアは作品と同じ権限" ON work_media
  FOR SELECT USING (
    work_id IN (SELECT id FROM works WHERE status = 'public' AND deleted_at IS NULL)
    OR work_id IN (SELECT id FROM works WHERE author_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))
  );

-- ============================================
-- 作品タグ中間テーブル
-- ============================================
CREATE TABLE work_tags (
  work_id UUID REFERENCES works(id) ON DELETE CASCADE NOT NULL,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE NOT NULL,
  PRIMARY KEY (work_id, tag_id)
);

-- 作品タグのRLS
ALTER TABLE work_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "作品タグは誰でも閲覧可能" ON work_tags
  FOR SELECT USING (true);

-- ============================================
-- いいねテーブル
-- ============================================
CREATE TABLE likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  work_id UUID REFERENCES works(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, work_id)
);

-- いいねのRLS
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "いいねは誰でも閲覧可能" ON likes
  FOR SELECT USING (true);

CREATE POLICY "ログインユーザーはいいね可能" ON likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "ユーザーは自分のいいねを削除可能" ON likes
  FOR DELETE USING (auth.uid() = user_id);

-- いいねカウント更新トリガー
CREATE OR REPLACE FUNCTION update_work_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE works SET like_count = like_count + 1 WHERE id = NEW.work_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE works SET like_count = like_count - 1 WHERE id = OLD.work_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_work_like_count
AFTER INSERT OR DELETE ON likes
FOR EACH ROW EXECUTE FUNCTION update_work_like_count();

-- ============================================
-- コメントテーブル
-- ============================================
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  work_id UUID REFERENCES works(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- コメントのRLS
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "コメントは誰でも閲覧可能" ON comments
  FOR SELECT USING (deleted_at IS NULL);

CREATE POLICY "ログインユーザーはコメント可能" ON comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "ユーザーは自分のコメントを更新可能" ON comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "作者または投稿者はコメントを削除可能" ON comments
  FOR DELETE USING (
    auth.uid() = user_id
    OR work_id IN (SELECT id FROM works WHERE author_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))
  );

-- コメントカウント更新トリガー
CREATE OR REPLACE FUNCTION update_work_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE works SET comment_count = comment_count + 1 WHERE id = NEW.work_id;
  ELSIF TG_OP = 'DELETE' OR (TG_OP = 'UPDATE' AND NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL) THEN
    UPDATE works SET comment_count = comment_count - 1 WHERE id = COALESCE(NEW.work_id, OLD.work_id);
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_work_comment_count
AFTER INSERT OR DELETE OR UPDATE ON comments
FOR EACH ROW EXECUTE FUNCTION update_work_comment_count();

-- ============================================
-- ブログ記事テーブル
-- ============================================
CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT,
  excerpt TEXT,
  thumbnail_url TEXT,
  status work_status NOT NULL DEFAULT 'draft',
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- ブログ記事のRLS
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "公開記事は誰でも閲覧可能" ON blog_posts
  FOR SELECT USING (status = 'public' AND deleted_at IS NULL);

CREATE POLICY "作者は自分の記事を全て閲覧可能" ON blog_posts
  FOR SELECT USING (author_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "作者は記事を作成可能" ON blog_posts
  FOR INSERT WITH CHECK (author_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "作者は自分の記事を更新可能" ON blog_posts
  FOR UPDATE USING (author_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- インデックス
CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_posts_status ON blog_posts(status);
CREATE INDEX idx_blog_posts_published_at ON blog_posts(published_at DESC);

-- ============================================
-- ブログタグ中間テーブル
-- ============================================
CREATE TABLE blog_post_tags (
  blog_post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE NOT NULL,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE NOT NULL,
  PRIMARY KEY (blog_post_id, tag_id)
);

-- ブログタグのRLS
ALTER TABLE blog_post_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ブログタグは誰でも閲覧可能" ON blog_post_tags
  FOR SELECT USING (true);

-- ============================================
-- 更新日時自動更新トリガー
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_works_updated_at
BEFORE UPDATE ON works
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_comments_updated_at
BEFORE UPDATE ON comments
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_blog_posts_updated_at
BEFORE UPDATE ON blog_posts
FOR EACH ROW EXECUTE FUNCTION update_updated_at();
