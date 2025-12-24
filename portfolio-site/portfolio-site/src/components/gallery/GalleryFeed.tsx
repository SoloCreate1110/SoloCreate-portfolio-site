'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Work } from '@/types';
import { Heart, MessageCircle, Eye, ExternalLink } from 'lucide-react';
import { formatNumber, formatDate } from '@/lib/utils';

interface GalleryFeedProps {
  works: Work[];
}

export default function GalleryFeed({ works }: GalleryFeedProps) {
  return (
    <div className="flex flex-col gap-8">
      {works.map((work, index) => (
        <article
          key={work.id}
          className="border-4 border-black bg-white shadow-[8px_8px_0_0_#000] animate-fade-in-up"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          {/* 画像 */}
          <div className="relative aspect-video md:aspect-[16/9] overflow-hidden">
            <Image
              src={work.thumbnail_url}
              alt={work.title}
              fill
              sizes="100vw"
              className="object-cover"
              priority={index < 2}
            />
          </div>

          {/* コンテンツ */}
          <div className="p-6 md:p-8">
            {/* ヘッダー */}
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h3 
                  className="text-2xl md:text-3xl font-bold uppercase tracking-tight mb-2"
                  style={{ fontFamily: "'Archivo Black', sans-serif" }}
                >
                  {work.title}
                </h3>
                {work.published_at && (
                  <p className="text-sm text-gray-500 font-bold">
                    {formatDate(work.published_at)}
                  </p>
                )}
              </div>
              <Link
                href={`/works/${work.id}`}
                className="flex-shrink-0 w-12 h-12 bg-black text-white flex items-center justify-center hover:bg-amber-400 hover:text-black transition-colors"
              >
                <ExternalLink size={20} />
              </Link>
            </div>

            {/* 説明 */}
            <p className="text-gray-700 leading-relaxed mb-4 line-clamp-3">
              {work.description}
            </p>

            {/* タグ */}
            {work.tags && work.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {work.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="text-xs font-bold uppercase bg-black text-white px-3 py-1"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            )}

            {/* 統計情報 */}
            <div className="flex items-center gap-6 pt-4 border-t-2 border-black">
              <span className="flex items-center gap-2 font-bold">
                <Heart size={18} />
                {formatNumber(work.like_count)}
              </span>
              <span className="flex items-center gap-2 font-bold">
                <MessageCircle size={18} />
                {formatNumber(work.comment_count)}
              </span>
              <span className="flex items-center gap-2 font-bold">
                <Eye size={18} />
                {formatNumber(work.view_count)}
              </span>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
