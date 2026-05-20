import { createBrowserClient } from '@supabase/ssr';

// Supabase クライアント（ブラウザ用）
// 実際の運用時は環境変数を設定してください
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
  );
}

// サーバーサイド用のクライアント作成
// 実際の運用時は @supabase/ssr の createServerClient を使用
export function createServerClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
  );
}
