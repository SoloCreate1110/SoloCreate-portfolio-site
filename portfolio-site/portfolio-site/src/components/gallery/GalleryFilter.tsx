'use client';

import { WorkCategory, SortOption, Tag } from '@/types';
import { categoryLabels } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface GalleryFilterProps {
  categories: WorkCategory[];
  tags: Tag[];
  selectedCategory: WorkCategory | null;
  selectedTag: string | null;
  sortOption: SortOption;
  onCategoryChange: (category: WorkCategory | null) => void;
  onTagChange: (tag: string | null) => void;
  onSortChange: (sort: SortOption) => void;
}

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'newest', label: '新着順' },
  { value: 'popular', label: '人気順' },
  { value: 'comments', label: 'コメント数' },
];

export default function GalleryFilter({
  categories,
  tags,
  selectedCategory,
  selectedTag,
  sortOption,
  onCategoryChange,
  onTagChange,
  onSortChange,
}: GalleryFilterProps) {
  return (
    <div className="space-y-6">
      {/* カテゴリフィルター */}
      <div>
        <h3 className="text-sm font-bold uppercase mb-3">Category</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onCategoryChange(null)}
            className={cn(
              'px-4 py-2 text-sm font-bold uppercase border-2 border-black transition-colors',
              selectedCategory === null
                ? 'bg-black text-white'
                : 'bg-white text-black hover:bg-gray-100'
            )}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => onCategoryChange(category)}
              className={cn(
                'px-4 py-2 text-sm font-bold uppercase border-2 border-black transition-colors',
                selectedCategory === category
                  ? 'bg-black text-white'
                  : 'bg-white text-black hover:bg-gray-100'
              )}
            >
              {categoryLabels[category]}
            </button>
          ))}
        </div>
      </div>

      {/* タグフィルター */}
      {tags.length > 0 && (
        <div>
          <h3 className="text-sm font-bold uppercase mb-3">Tags</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onTagChange(null)}
              className={cn(
                'px-3 py-1 text-xs font-bold uppercase border-2 border-black transition-colors',
                selectedTag === null
                  ? 'bg-amber-400 text-black'
                  : 'bg-white text-black hover:bg-gray-100'
              )}
            >
              All
            </button>
            {tags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => onTagChange(tag.slug)}
                className={cn(
                  'px-3 py-1 text-xs font-bold uppercase border-2 border-black transition-colors',
                  selectedTag === tag.slug
                    ? 'bg-amber-400 text-black'
                    : 'bg-white text-black hover:bg-gray-100'
                )}
              >
                {tag.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ソートオプション */}
      <div>
        <h3 className="text-sm font-bold uppercase mb-3">Sort</h3>
        <div className="flex flex-wrap gap-2">
          {sortOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => onSortChange(option.value)}
              className={cn(
                'px-4 py-2 text-sm font-bold border-2 border-black transition-colors',
                sortOption === option.value
                  ? 'bg-black text-white'
                  : 'bg-white text-black hover:bg-gray-100'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
