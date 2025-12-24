'use client';

import { useEffect, useState } from 'react';

interface HeroSectionProps {
  name: string;
  role: string;
  bio: string;
}

export default function HeroSection({ name, role, bio }: HeroSectionProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <header className="min-h-[80vh] flex flex-col justify-center border-b-4 border-black pb-12 mb-24 relative">
      {/* バッジ */}
      <div className="absolute top-0 right-0 bg-black text-white px-4 py-2 font-bold -rotate-3">
        PORTFOLIO v.1.1
      </div>

      {/* 肩書き */}
      <p className="text-lg md:text-xl font-bold uppercase tracking-widest bg-black text-white inline-block w-max px-2 py-1 mb-4 mt-16 md:mt-0">
        {role}
      </p>

      {/* 名前 */}
      <h1
        className={`text-5xl md:text-8xl lg:text-[10rem] uppercase leading-[0.8] mb-8 transition-all duration-1000 ${
          isVisible
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-24'
        }`}
        style={{ fontFamily: "'Archivo Black', sans-serif" }}
      >
        {name}
      </h1>

      {/* 下部セクション */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 border-t-4 border-black pt-8">
        {/* 自己紹介 */}
        <p className="text-lg font-bold leading-relaxed whitespace-pre-wrap">
          {bio}
        </p>

        {/* スクロールインジケーター */}
        <div className="flex items-center justify-center md:justify-end">
          <div className="text-4xl font-black animate-bounce-custom">
            ↓ SCROLL
          </div>
        </div>
      </div>
    </header>
  );
}
