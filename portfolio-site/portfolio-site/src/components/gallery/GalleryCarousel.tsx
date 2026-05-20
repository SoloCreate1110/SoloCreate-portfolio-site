'use client';

import { useState, useRef } from 'react';
import { Work } from '@/types';
import WorkCard from './WorkCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface GalleryCarouselProps {
  works: Work[];
}

export default function GalleryCarousel({ works }: GalleryCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.8;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="relative">
      {/* 左スクロールボタン */}
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-black text-white border-4 border-black flex items-center justify-center hover:bg-amber-400 hover:text-black transition-colors"
          aria-label="前へ"
        >
          <ChevronLeft size={24} />
        </button>
      )}

      {/* 右スクロールボタン */}
      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-black text-white border-4 border-black flex items-center justify-center hover:bg-amber-400 hover:text-black transition-colors"
          aria-label="次へ"
        >
          <ChevronRight size={24} />
        </button>
      )}

      {/* カルーセルコンテナ */}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {works.map((work, index) => (
          <div
            key={work.id}
            className="flex-shrink-0 w-[85%] md:w-[45%] lg:w-[30%] snap-start"
          >
            <WorkCard work={work} priority={index < 3} />
          </div>
        ))}
      </div>
    </div>
  );
}
