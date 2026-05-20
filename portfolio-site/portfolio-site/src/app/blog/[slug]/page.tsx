import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Header, Footer, Badge } from '@/components';
import { getBlogPostBySlug, dummyBlogPosts } from '@/data/dummy';
import { formatDate } from '@/lib/utils';
import { ArrowLeft, Calendar, User, Clock } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface BlogDetailPageProps {
  params: Promise<{ slug: string }>;
}

// メタデータ生成（SSR/SSG対応）
export async function generateMetadata({ params }: BlogDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  
  if (!post) {
    return {
      title: '記事が見つかりません',
    };
  }

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.thumbnail_url ? [post.thumbnail_url] : [],
      type: 'article',
      publishedTime: post.published_at || undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: post.thumbnail_url ? [post.thumbnail_url] : [],
    },
  };
}

// 静的パス生成（SSG対応）
export async function generateStaticParams() {
  return dummyBlogPosts.map((post) => ({
    slug: post.slug,
  }));
}

// 読了時間を計算
function calculateReadingTime(content: string): number {
  const wordsPerMinute = 400; // 日本語の場合
  const charCount = content.length;
  return Math.ceil(charCount / wordsPerMinute);
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const readingTime = calculateReadingTime(post.content);

  // 関連記事（同じタグを持つ記事）
  const relatedPosts = dummyBlogPosts
    .filter(p => p.id !== post.id)
    .slice(0, 2);

  return (
    <>
      <Header />
      
      <main className="container-custom py-12">
        {/* 戻るリンク */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm font-bold uppercase mb-8 hover:bg-amber-400 px-2 py-1 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Blog
        </Link>

        <article className="max-w-4xl mx-auto">
          {/* ヘッダー */}
          <header className="mb-12">
            {/* タグ */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.map((tag) => (
                  <Badge key={tag.id} variant="accent">
                    {tag.name}
                  </Badge>
                ))}
              </div>
            )}
            
            {/* タイトル */}
            <h1 
              className="text-3xl md:text-5xl lg:text-6xl mb-6 leading-tight"
              style={{ fontFamily: "'Archivo Black', sans-serif" }}
            >
              {post.title}
            </h1>

            {/* メタ情報 */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 border-b-4 border-black pb-6">
              {post.author && (
                <span className="flex items-center gap-2">
                  <User size={16} />
                  {post.author.name}
                </span>
              )}
              {post.published_at && (
                <span className="flex items-center gap-2">
                  <Calendar size={16} />
                  {formatDate(post.published_at)}
                </span>
              )}
              <span className="flex items-center gap-2">
                <Clock size={16} />
                約{readingTime}分で読めます
              </span>
            </div>
          </header>

          {/* サムネイル */}
          {post.thumbnail_url && (
            <div className="border-4 border-black shadow-[8px_8px_0_0_#000] mb-12 overflow-hidden">
              <div className="relative aspect-video">
                <Image
                  src={post.thumbnail_url}
                  alt={post.title}
                  fill
                  sizes="100vw"
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          )}

          {/* 本文 */}
          <div className="markdown-content mb-12">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {post.content}
            </ReactMarkdown>
          </div>

          {/* 著者情報 */}
          {post.author && (
            <div className="border-4 border-black p-6 mb-12 bg-gray-50">
              <h2 className="text-xl font-bold uppercase mb-4">Author</h2>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-black text-white flex items-center justify-center text-2xl font-bold">
                  {post.author.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="text-lg font-bold">{post.author.name}</p>
                  <p className="text-sm text-gray-600">{post.author.role}</p>
                </div>
                <Link
                  href="/about"
                  className="btn-brutal text-sm"
                >
                  View Profile
                </Link>
              </div>
            </div>
          )}

          {/* シェアボタン */}
          <div className="border-4 border-black p-6 mb-12 bg-amber-400">
            <p className="text-center font-bold mb-4">この記事をシェアする</p>
            <div className="flex justify-center gap-4">
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(`/blog/${post.slug}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-brutal"
              >
                Twitter
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`/blog/${post.slug}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-brutal"
              >
                Facebook
              </a>
            </div>
          </div>
        </article>

        {/* 関連記事 */}
        {relatedPosts.length > 0 && (
          <section className="mt-24 max-w-4xl mx-auto">
            <h2 
              className="text-3xl font-bold uppercase mb-8 pb-4 border-b-4 border-black"
              style={{ fontFamily: "'Archivo Black', sans-serif" }}
            >
              Related Posts
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedPosts.map((relatedPost) => (
                <Link
                  key={relatedPost.id}
                  href={`/blog/${relatedPost.slug}`}
                  className="block group"
                >
                  <article className="card-brutal">
                    {relatedPost.thumbnail_url && (
                      <div className="relative aspect-video overflow-hidden">
                        <Image
                          src={relatedPost.thumbnail_url}
                          alt={relatedPost.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 50vw"
                          className="object-cover border-2 border-black transition-all duration-300 group-hover:grayscale"
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <p className="text-xs font-bold text-gray-500 mb-2">
                        {relatedPost.published_at && formatDate(relatedPost.published_at)}
                      </p>
                      <h3 className="font-bold line-clamp-2">{relatedPost.title}</h3>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </>
  );
}
