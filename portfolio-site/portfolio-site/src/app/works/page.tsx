'use client';

import { useState, useMemo } from 'react';
import { Header, Footer, SectionHeader, GalleryGrid, GalleryCarousel, GalleryFeed, GalleryViewToggle, GalleryFilter } from '@/components';
import { dummyWorks, dummyTags } from '@/data/dummy';
import { GalleryViewMode, WorkCategory, SortOption } from '@/types';

export default function WorksPage() {
  const [viewMode, setViewMode] = useState<GalleryViewMode>('grid');
  const [selectedCategory, setSelectedCategory] = useState<WorkCategory | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>('newest');

  // カテゴリ一覧を取得
  const categories: WorkCategory[] = ['image', 'video', 'audio', 'text', 'web'];

  // フィルタリング・ソート処理
  const filteredWorks = useMemo(() => {
    let works = [...dummyWorks];

    // カテゴリフィルター
    if (selectedCategory) {
      works = works.filter(work => work.category === selectedCategory);
    }

    // タグフィルター
    if (selectedTag) {
      works = works.filter(work =>
        work.tags?.some(tag => tag.slug === selectedTag)
      );
    }

    // ソート
    switch (sortOption) {
      case 'popular':
        works.sort((a, b) => b.like_count - a.like_count);
        break;
      case 'comments':
        works.sort((a, b) => b.comment_count - a.comment_count);
        break;
      case 'newest':
      default:
        works.sort((a, b) => 
          new Date(b.published_at || b.created_at).getTime() - 
          new Date(a.published_at || a.created_at).getTime()
        );
    }

    return works;
  }, [selectedCategory, selectedTag, sortOption]);

  // ギャラリー表示コンポーネントの選択
  const renderGallery = () => {
    switch (viewMode) {
      case 'carousel':
        return <GalleryCarousel works={filteredWorks} />;
      case 'feed':
        return <GalleryFeed works={filteredWorks} />;
      case 'grid':
      default:
        return <GalleryGrid works={filteredWorks} columns={3} />;
    }
  };

  return (
    <>
      <Header />
      
      <main className="container-custom py-12">
        {/* ページヘッダー */}
        <SectionHeader title="Works" number="01" className="mb-8" />

        {/* フィルター・表示切替 */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8 mb-12">
          <GalleryFilter
            categories={categories}
            tags={dummyTags}
            selectedCategory={selectedCategory}
            selectedTag={selectedTag}
            sortOption={sortOption}
            onCategoryChange={setSelectedCategory}
            onTagChange={setSelectedTag}
            onSortChange={setSortOption}
          />
          
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold uppercase">View:</span>
            <GalleryViewToggle
              currentView={viewMode}
              onViewChange={setViewMode}
            />
          </div>
        </div>

        {/* 件数表示 */}
        <p className="text-sm font-bold mb-8">
          {filteredWorks.length} works found
        </p>

        {/* ギャラリー */}
        {filteredWorks.length > 0 ? (
          renderGallery()
        ) : (
          <div className="text-center py-24 border-4 border-black bg-gray-50">
            <p className="text-xl font-bold uppercase">No works found</p>
            <p className="text-gray-500 mt-2">条件を変更してお試しください</p>
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}
