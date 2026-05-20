'use client';

import { GalleryViewMode } from '@/types';
import { Grid3X3, Columns, List } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GalleryViewToggleProps {
  currentView: GalleryViewMode;
  onViewChange: (view: GalleryViewMode) => void;
}

const viewOptions: { value: GalleryViewMode; icon: React.ReactNode; label: string }[] = [
  { value: 'grid', icon: <Grid3X3 size={20} />, label: 'グリッド表示' },
  { value: 'carousel', icon: <Columns size={20} />, label: 'カルーセル表示' },
  { value: 'feed', icon: <List size={20} />, label: 'フィード表示' },
];

export default function GalleryViewToggle({
  currentView,
  onViewChange,
}: GalleryViewToggleProps) {
  return (
    <div className="flex border-4 border-black">
      {viewOptions.map((option) => (
        <button
          key={option.value}
          onClick={() => onViewChange(option.value)}
          className={cn(
            'flex items-center justify-center w-12 h-12 transition-colors',
            currentView === option.value
              ? 'bg-black text-white'
              : 'bg-white text-black hover:bg-gray-100'
          )}
          aria-label={option.label}
          title={option.label}
        >
          {option.icon}
        </button>
      ))}
    </div>
  );
}
