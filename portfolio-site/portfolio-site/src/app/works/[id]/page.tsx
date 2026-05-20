import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Header, Footer, SectionHeader, GalleryGrid, Badge, Button } from '@/components';
import { getWorkById, getRelatedWorks, dummyComments } from '@/data/dummy';
import { formatDate, formatNumber, categoryLabels } from '@/lib/utils';
import { Heart, MessageCircle, Eye, Share2, ArrowLeft, ExternalLink } from 'lucide-react';
import LikeButton from './LikeButton';
import CommentSection from './CommentSection';
import ShareButtons from './ShareButtons';

interface WorkDetailPageProps {
  params: Promise<{ id: string }>;
}

// メタデータ生成（SSR/SSG対応）
export async function generateMetadata({ params }: WorkDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const work = getWorkById(id);
  
  if (!work) {
    return {
      title: '作品が見つかりません',
    };
  }

  return {
    title: work.title,
    description: work.description.slice(0, 160),
    openGraph: {
      title: work.title,
      description: work.description.slice(0, 160),
      images: [work.thumbnail_url],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: work.title,
      description: work.description.slice(0, 160),
      images: [work.thumbnail_url],
    },
  };
}

// 静的パス生成（SSG対応）
export async function generateStaticParams() {
  const { dummyWorks } = await import('@/data/dummy');
  return dummyWorks.map((work) => ({
    id: work.id,
  }));
}

export default async function WorkDetailPage({ params }: WorkDetailPageProps) {
  const { id } = await params;
  const work = getWorkById(id);

  if (!work) {
    notFound();
  }

  const relatedWorks = getRelatedWorks(id, 3);
  const comments = dummyComments.filter(c => c.work_id === id);

  return (
    <>
      <Header />
      
      <main className="container-custom py-12">
        {/* 戻るリンク */}
        <Link
          href="/works"
          className="inline-flex items-center gap-2 text-sm font-bold uppercase mb-8 hover:bg-amber-400 px-2 py-1 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Works
        </Link>

        {/* メインコンテンツ */}
        <article>
          {/* ヘッダー */}
          <header className="mb-12">
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <Badge variant="accent">{categoryLabels[work.category]}</Badge>
              {work.published_at && (
                <span className="text-sm font-bold text-gray-500">
                  {formatDate(work.published_at)}
                </span>
              )}
            </div>
            
            <h1 
              className="text-4xl md:text-6xl lg:text-7xl uppercase mb-6"
              style={{ fontFamily: "'Archivo Black', sans-serif" }}
            >
              {work.title}
            </h1>

            {/* タグ */}
            {work.tags && work.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {work.tags.map((tag) => (
                  <Link
                    key={tag.id}
                    href={`/works?tag=${tag.slug}`}
                    className="text-sm font-bold uppercase bg-black text-white px-3 py-1 hover:bg-amber-400 hover:text-black transition-colors"
                  >
                    #{tag.name}
                  </Link>
                ))}
              </div>
            )}
          </header>

          {/* メイン画像 */}
          <div className="border-4 border-black shadow-[8px_8px_0_0_#000] mb-12 overflow-hidden">
            <div className="relative aspect-video md:aspect-[16/10]">
              <Image
                src={work.thumbnail_url}
                alt={work.title}
                fill
                sizes="100vw"
                className="object-cover"
                priority
              />
            </div>
          </div>

          {/* アクションバー */}
          <div className="flex flex-wrap items-center justify-between gap-4 py-6 border-y-4 border-black mb-12">
            <div className="flex items-center gap-6">
              <LikeButton
                workId={work.id}
                initialCount={work.like_count}
                initialLiked={false}
              />
              <span className="flex items-center gap-2 font-bold">
                <MessageCircle size={20} />
                {formatNumber(work.comment_count)}
              </span>
              <span className="flex items-center gap-2 font-bold">
                <Eye size={20} />
                {formatNumber(work.view_count)}
              </span>
            </div>
            
            <ShareButtons
              title={work.title}
              url={`/works/${work.id}`}
            />
          </div>

          {/* 説明文 */}
          <div className="max-w-3xl mb-12">
            <h2 className="text-2xl font-bold uppercase mb-4">Description</h2>
            <p className="text-lg leading-loose whitespace-pre-wrap">
              {work.description}
            </p>
          </div>

          {/* 作者情報 */}
          {work.author && (
            <div className="border-4 border-black p-6 mb-12 bg-gray-50">
              <h2 className="text-xl font-bold uppercase mb-4">Creator</h2>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-black text-white flex items-center justify-center text-2xl font-bold">
                  {work.author.name.charAt(0)}
                </div>
                <div>
                  <p className="text-lg font-bold">{work.author.name}</p>
                  <p className="text-sm text-gray-600">{work.author.role}</p>
                </div>
                <Link
                  href="/about"
                  className="ml-auto btn-brutal text-sm"
                >
                  View Profile
                </Link>
              </div>
            </div>
          )}

          {/* コメントセクション */}
          <CommentSection
            workId={work.id}
            comments={comments}
          />
        </article>

        {/* 関連作品 */}
        {relatedWorks.length > 0 && (
          <section className="mt-24">
            <SectionHeader title="Related" number="02" />
            <GalleryGrid works={relatedWorks} columns={3} />
          </section>
        )}
      </main>

      <Footer />
    </>
  );
}
