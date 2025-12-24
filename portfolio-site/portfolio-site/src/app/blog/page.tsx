import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Header, Footer, SectionHeader } from '@/components';
import { dummyBlogPosts } from '@/data/dummy';
import { formatDate } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'デザインや制作に関する記事を掲載しています。',
};

export default function BlogPage() {
  return (
    <>
      <Header />
      
      <main className="container-custom py-12">
        <SectionHeader title="Blog" number="01" className="mb-12" />

        {/* ブログ記事一覧 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {dummyBlogPosts.map((post, index) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="block group animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <article className="card-brutal h-full flex flex-col">
                {/* サムネイル */}
                {post.thumbnail_url && (
                  <div className="relative aspect-video overflow-hidden">
                    <Image
                      src={post.thumbnail_url}
                      alt={post.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover border-2 border-black transition-all duration-300 group-hover:grayscale group-hover:contrast-125"
                    />
                    {/* オーバーレイ */}
                    <div className="absolute inset-0 bg-amber-400 mix-blend-multiply opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                )}
                
                {/* コンテンツ */}
                <div className="p-6 flex-1 flex flex-col">
                  {/* 日付 */}
                  <p className="text-xs font-bold text-gray-500 mb-2">
                    {post.published_at && formatDate(post.published_at)}
                  </p>
                  
                  {/* タイトル */}
                  <h2 
                    className="text-xl md:text-2xl font-bold mb-4 line-clamp-2"
                    style={{ fontFamily: "'Archivo Black', sans-serif" }}
                  >
                    {post.title}
                  </h2>
                  
                  {/* 抜粋 */}
                  <p className="text-gray-600 leading-relaxed line-clamp-3 flex-1">
                    {post.excerpt}
                  </p>

                  {/* タグ */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {post.tags.map((tag) => (
                        <span
                          key={tag.id}
                          className="text-xs font-bold uppercase bg-black text-white px-2 py-1"
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Read More */}
                  <div className="mt-4 pt-4 border-t-2 border-black">
                    <span className="text-sm font-bold uppercase group-hover:bg-amber-400 px-2 py-1 transition-colors">
                      Read More →
                    </span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>

        {/* 記事がない場合 */}
        {dummyBlogPosts.length === 0 && (
          <div className="text-center py-24 border-4 border-black bg-gray-50">
            <p className="text-xl font-bold uppercase">No posts yet</p>
            <p className="text-gray-500 mt-2">記事を準備中です</p>
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}
