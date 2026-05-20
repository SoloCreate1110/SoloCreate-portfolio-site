import Link from 'next/link';
import { Twitter, Instagram, Github, Mail } from 'lucide-react';

const socialLinks = [
  { href: 'https://twitter.com/example', icon: Twitter, label: 'Twitter' },
  { href: 'https://instagram.com/example', icon: Instagram, label: 'Instagram' },
  { href: 'https://github.com/example', icon: Github, label: 'GitHub' },
  { href: 'mailto:hello@example.com', icon: Mail, label: 'Email' },
];

const footerLinks = [
  { href: '/works', label: 'Works' },
  { href: '/blog', label: 'Blog' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
  { href: '/privacy', label: 'Privacy' },
  { href: '/terms', label: 'Terms' },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black text-white">
      <div className="container-custom py-12 md:py-16">
        {/* 上部セクション */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* ロゴ・説明 */}
          <div>
            <Link href="/" className="inline-block mb-4">
              <span className="text-3xl font-black uppercase tracking-tight"
                    style={{ fontFamily: "'Archivo Black', sans-serif" }}>
                BOLD
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              ルールを壊し、新しい価値を創造する。<br />
              東京を拠点に活動するデザイナー。
            </p>
          </div>

          {/* ナビゲーション */}
          <div>
            <h3 className="text-lg font-bold uppercase mb-4">Navigation</h3>
            <ul className="grid grid-cols-2 gap-2">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-amber-400 text-sm uppercase transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ソーシャルリンク */}
          <div>
            <h3 className="text-lg font-bold uppercase mb-4">Connect</h3>
            <div className="flex gap-4">
              {socialLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 border-2 border-white flex items-center justify-center hover:bg-amber-400 hover:border-amber-400 hover:text-black transition-colors"
                  aria-label={link.label}
                >
                  <link.icon size={20} />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* 下部セクション */}
        <div className="border-t border-gray-800 pt-8">
          <p className="text-center text-gray-500 text-sm uppercase font-bold">
            © {currentYear} YAMADA TARO. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
