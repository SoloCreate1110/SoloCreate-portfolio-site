'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Work } from '@/types';
import { Heart, MessageCircle, Eye } from 'lucide-react';
import { formatNumber } from '@/lib/utils';

interface WorkCardProps {
  work: Work;
  priority?: boolean;
}

export default function WorkCard({ work, priority = false }: WorkCardProps) {
  return (
    <Link href={`/works/${work.id}`} className="block group">
      <article className="card-brutal cursor-pointer overflow-hidden">
        {/* 画像コンテナ */}
        <div className="relative aspect-square overflow-hidden">
          <Image
            src={work.thumbnail_url}
            alt={work.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover border-2 border-black transition-all duration-300 group-hover:grayscale group-hover:contrast-125"
            priority={priority}
          />
          
          {/* オーバーレイ背景 */}
          <div className="absolute inset-0 bg-amber-400 mix-blend-multiply opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* オーバーレイテキスト */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
            <span 
              className="text-2xl md:text-3xl text-white uppercase tracking-tight text-shadow"
              style={{ fontFamily: "'Archivo Black', sans-serif" }}
            >
              View Project
            </span>
          </div>
        </div>

        {/* カード情報 */}
        <div className="p-4 bg-white">
          <h3 
            className="text-lg font-bold uppercase tracking-tight mb-2 line-clamp-1"
            style={{ fontFamily: "'Archivo Black', sans-serif" }}
          >
            {work.title}
          </h3>
          
          {/* タグ */}
          {work.tags && work.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {work.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag.id}
                  className="text-xs font-bold uppercase bg-black text-white px-2 py-1"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}

          {/* 統計情報 */}
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <Heart size={14} />
              {formatNumber(work.like_count)}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle size={14} />
              {formatNumber(work.comment_count)}
            </span>
            <span className="flex items-center gap-1">
              <Eye size={14} />
              {formatNumber(work.view_count)}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
