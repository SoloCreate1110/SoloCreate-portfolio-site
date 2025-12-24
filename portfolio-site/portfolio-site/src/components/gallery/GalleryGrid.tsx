'use client';

import { Work } from '@/types';
import WorkCard from './WorkCard';

interface GalleryGridProps {
  works: Work[];
  columns?: 2 | 3 | 4;
}

export default function GalleryGrid({ works, columns = 3 }: GalleryGridProps) {
  const gridCols = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-6 md:gap-8`}>
      {works.map((work, index) => (
        <div
          key={work.id}
          className="animate-fade-in-up"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <WorkCard work={work} priority={index < 6} />
        </div>
      ))}
    </div>
  );
}
