import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Header, Footer, SectionHeader, GalleryGrid, ContactSection } from '@/components';
import { dummyProfile, dummyWorks } from '@/data/dummy';
import { Twitter, Instagram, Github, Globe, Mail } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About',
  description: `${dummyProfile.name}のプロフィールページ。${dummyProfile.role}として活動しています。`,
};

const socialLinks = [
  { href: dummyProfile.twitter, icon: Twitter, label: 'Twitter' },
  { href: dummyProfile.instagram, icon: Instagram, label: 'Instagram' },
  { href: dummyProfile.github, icon: Github, label: 'GitHub' },
  { href: dummyProfile.website, icon: Globe, label: 'Website' },
  { href: dummyProfile.email ? `mailto:${dummyProfile.email}` : null, icon: Mail, label: 'Email' },
].filter(link => link.href);

const skills = [
  { category: 'Design', items: ['Graphic Design', 'UI/UX Design', 'Web Design', 'Brand Identity'] },
  { category: 'Tools', items: ['Figma', 'Adobe Creative Suite', 'Sketch', 'Blender'] },
  { category: 'Development', items: ['HTML/CSS', 'JavaScript', 'React', 'Next.js'] },
];

export default function AboutPage() {
  // 最新の作品（3件）
  const latestWorks = dummyWorks.slice(0, 3);

  return (
    <>
      <Header />
      
      <main className="container-custom py-12">
        {/* ヒーローセクション */}
        <section className="mb-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* プロフィール画像 */}
            <div className="relative">
              <div className="border-4 border-black shadow-[12px_12px_0_0_#000] overflow-hidden">
                <div className="relative aspect-square bg-gray-200">
                  {/* プレースホルダー画像 */}
                  <div className="absolute inset-0 flex items-center justify-center bg-amber-400">
                    <span 
                      className="text-[12rem] font-black text-black opacity-20"
                      style={{ fontFamily: "'Archivo Black', sans-serif" }}
                    >
                      {dummyProfile.name_en.charAt(0)}
                    </span>
                  </div>
                </div>
              </div>
              {/* デコレーション */}
              <div className="absolute -top-4 -right-4 bg-black text-white px-4 py-2 font-bold -rotate-3">
                {dummyProfile.role}
              </div>
            </div>

            {/* プロフィール情報 */}
            <div>
              <p className="text-lg font-bold uppercase tracking-widest bg-black text-white inline-block px-2 py-1 mb-4">
                About Me
              </p>
              
              <h1 
                className="text-5xl md:text-7xl uppercase mb-6"
                style={{ fontFamily: "'Archivo Black', sans-serif" }}
              >
                {dummyProfile.name_en}
              </h1>

              <p className="text-xl text-gray-600 mb-2">{dummyProfile.name}</p>
              
              <p className="text-lg leading-loose whitespace-pre-wrap mb-8">
                {dummyProfile.bio}
              </p>

              {/* ソーシャルリンク */}
              <div className="flex gap-4">
                {socialLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 border-4 border-black flex items-center justify-center hover:bg-amber-400 transition-colors"
                    aria-label={link.label}
                  >
                    <link.icon size={20} />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* スキルセクション */}
        <section className="mb-24">
          <SectionHeader title="Skills" number="01" />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {skills.map((skillGroup, index) => (
              <div
                key={skillGroup.category}
                className="border-4 border-black p-6 shadow-[8px_8px_0_0_#000] animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <h3 
                  className="text-2xl font-bold uppercase mb-4 pb-4 border-b-4 border-black"
                  style={{ fontFamily: "'Archivo Black', sans-serif" }}
                >
                  {skillGroup.category}
                </h3>
                <ul className="space-y-2">
                  {skillGroup.items.map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-amber-400" />
                      <span className="font-bold">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* 経歴セクション */}
        <section className="mb-24">
          <SectionHeader title="Career" number="02" />
          
          <div className="max-w-3xl">
            <div className="space-y-8">
              {[
                { year: '2024 -', title: 'フリーランスデザイナー', description: '独立してフリーランスとして活動開始。ブランディング、Webデザイン、UI/UXデザインを中心に様々なプロジェクトに携わる。' },
                { year: '2021 - 2024', title: 'デザイン事務所 シニアデザイナー', description: '大手クライアントのブランディングプロジェクトをリード。チームマネジメントも担当。' },
                { year: '2018 - 2021', title: 'Web制作会社 デザイナー', description: 'Webサイト、アプリのUIデザインを担当。デザインシステムの構築にも携わる。' },
              ].map((career, index) => (
                <div
                  key={index}
                  className="flex gap-6 animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex-shrink-0 w-32">
                    <span className="text-sm font-bold bg-black text-white px-2 py-1">
                      {career.year}
                    </span>
                  </div>
                  <div className="flex-1 border-l-4 border-black pl-6 pb-8">
                    <h3 className="text-xl font-bold mb-2">{career.title}</h3>
                    <p className="text-gray-600">{career.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 作品セクション */}
        <section className="mb-24">
          <SectionHeader title="Works" number="03" />
          <GalleryGrid works={latestWorks} columns={3} />
          
          <div className="mt-12 text-center">
            <Link href="/works" className="btn-brutal">
              View All Works
            </Link>
          </div>
        </section>

        {/* コンタクトセクション */}
        <section className="mb-24">
          <ContactSection
            title="Let's Work Together"
            links={[
              { label: 'Contact Form', href: '/contact' },
              { label: 'Email', href: `mailto:${dummyProfile.email}`, external: true },
            ]}
          />
        </section>
      </main>

      <Footer />
    </>
  );
}
