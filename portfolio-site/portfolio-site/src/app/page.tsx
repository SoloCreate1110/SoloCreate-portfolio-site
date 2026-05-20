import { Header, Footer, HeroSection, SectionHeader, GalleryGrid, ContactSection } from '@/components';
import { dummyWorks, dummyProfile, dummyBlogPosts } from '@/data/dummy';
import Link from 'next/link';
import Image from 'next/image';
import { formatDate } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';

export default function HomePage() {
  // 新着作品（最新6件）
  const latestWorks = dummyWorks.slice(0, 6);
  // 最新ブログ記事（最新3件）
  const latestPosts = dummyBlogPosts.slice(0, 3);

  return (
    <>
      <Header />
      
      <main className="container-custom">
        {/* ヒーローセクション */}
        <HeroSection
          name={dummyProfile.name_en}
          role={dummyProfile.role}
          bio={dummyProfile.bio}
        />

        {/* 作品セクション */}
        <section className="mb-24">
          <SectionHeader title="Works" number="01" />
          <GalleryGrid works={latestWorks} columns={3} />
          
          <div className="mt-12 text-center">
            <Link
              href="/works"
              className="btn-brutal inline-flex items-center gap-2"
            >
              View All Works
              <ArrowRight size={20} />
            </Link>
          </div>
        </section>

        {/* About セクション */}
        <section className="mb-24">
          <SectionHeader title="About" number="02" />
          
          <div className="max-w-3xl">
            <p className="text-lg leading-loose whitespace-pre-wrap mb-8">
              デザインとは、単なる見た目の装飾ではありません。
              それは課題解決のための思考プロセスであり、コミュニケーションの手段です。

              私は常に「なぜ？」を問い続け、本質的な価値を見つけ出すことを大切にしています。
              グラフィック、ウェブ、UI/UXなど、媒体にとらわれず最適なアウトプットを追求します。

              お仕事のご依頼やご相談は、下記コンタクトフォームよりお気軽にご連絡ください。
            </p>
            
            <Link
              href="/about"
              className="btn-brutal inline-flex items-center gap-2"
            >
              More About Me
              <ArrowRight size={20} />
            </Link>
          </div>
        </section>

        {/* ブログセクション */}
        <section className="mb-24">
          <SectionHeader title="Blog" number="03" />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {latestPosts.map((post, index) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="block group animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <article className="card-brutal h-full">
                  {/* サムネイル */}
                  {post.thumbnail_url && (
                    <div className="relative aspect-video overflow-hidden">
                      <Image
                        src={post.thumbnail_url}
                        alt={post.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover border-2 border-black transition-all duration-300 group-hover:grayscale"
                      />
                    </div>
                  )}
                  
                  {/* コンテンツ */}
                  <div className="p-4">
                    <p className="text-xs font-bold text-gray-500 mb-2">
                      {post.published_at && formatDate(post.published_at)}
                    </p>
                    <h3 className="text-lg font-bold mb-2 line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {post.excerpt}
                    </p>
                  </div>
                </article>
              </Link>
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <Link
              href="/blog"
              className="btn-brutal inline-flex items-center gap-2"
            >
              View All Posts
              <ArrowRight size={20} />
            </Link>
          </div>
        </section>

        {/* コンタクトセクション */}
        <section className="mb-24">
          <ContactSection />
        </section>
      </main>

      <Footer />
    </>
  );
}
