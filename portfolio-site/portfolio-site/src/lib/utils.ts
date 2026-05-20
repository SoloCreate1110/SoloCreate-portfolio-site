import { type ClassValue, clsx } from 'clsx';

// クラス名を結合するユーティリティ
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// 日付フォーマット
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// 相対時間フォーマット
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'たった今';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}分前`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}時間前`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}日前`;
  
  return formatDate(dateString);
}

// 数値フォーマット（1000 -> 1K）
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

// スラッグ生成
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// テキスト切り詰め
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

// カテゴリラベル
export const categoryLabels: Record<string, string> = {
  image: '画像',
  video: '動画',
  audio: '音声',
  text: 'テキスト',
  web: 'Webサイト',
};

// カテゴリアイコン名（Lucide React用）
export const categoryIcons: Record<string, string> = {
  image: 'Image',
  video: 'Video',
  audio: 'Music',
  text: 'FileText',
  web: 'Globe',
};
