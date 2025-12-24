import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'accent' | 'outline';
  className?: string;
}

export default function Badge({
  children,
  variant = 'default',
  className = '',
}: BadgeProps) {
  const baseStyles = `
    inline-block
    px-3 py-1
    text-xs font-bold uppercase tracking-wider
    border-2 border-black
  `;

  const variantStyles = {
    default: 'bg-black text-white',
    accent: 'bg-amber-400 text-black',
    outline: 'bg-white text-black',
  };

  return (
    <span className={cn(baseStyles, variantStyles[variant], className)}>
      {children}
    </span>
  );
}
