'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/works', label: 'Works' },
  { href: '/blog', label: 'Blog' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white border-b-4 border-black">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* ロゴ */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl md:text-3xl font-black uppercase tracking-tight"
                  style={{ fontFamily: "'Archivo Black', sans-serif" }}>
              BOLD
            </span>
            <span className="hidden md:inline-block bg-black text-white text-xs font-bold px-2 py-1 -rotate-3">
              PORTFOLIO
            </span>
          </Link>

          {/* デスクトップナビゲーション */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-bold uppercase tracking-wider hover:bg-amber-400 px-2 py-1 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* モバイルメニューボタン */}
          <button
            className="md:hidden p-2 border-2 border-black"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? 'メニューを閉じる' : 'メニューを開く'}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* モバイルナビゲーション */}
        {isMenuOpen && (
          <nav className="md:hidden border-t-4 border-black py-4">
            <ul className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="block text-lg font-bold uppercase tracking-wider py-3 px-4 hover:bg-amber-400 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
}
