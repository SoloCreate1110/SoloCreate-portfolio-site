import Link from 'next/link';
import { cn } from '@/lib/utils';

interface ButtonProps {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: 'default' | 'accent' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  external?: boolean;
}

export default function Button({
  children,
  href,
  onClick,
  variant = 'default',
  size = 'md',
  className = '',
  type = 'button',
  disabled = false,
  external = false,
}: ButtonProps) {
  const baseStyles = `
    inline-flex items-center justify-center
    font-bold uppercase tracking-wider
    border-4 border-black
    transition-all duration-200
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  const variantStyles = {
    default: 'bg-white text-black hover:bg-black hover:text-white',
    accent: 'bg-amber-400 text-black hover:bg-black hover:text-amber-400',
    outline: 'bg-transparent text-black hover:bg-black hover:text-white',
  };

  const sizeStyles = {
    sm: 'px-4 py-2 text-sm shadow-[3px_3px_0_0_#000] hover:shadow-[5px_5px_0_0_#000] hover:translate-x-[-2px] hover:translate-y-[-2px]',
    md: 'px-6 py-3 text-base shadow-[4px_4px_0_0_#000] hover:shadow-[6px_6px_0_0_#000] hover:translate-x-[-2px] hover:translate-y-[-2px]',
    lg: 'px-8 py-4 text-lg shadow-[6px_6px_0_0_#000] hover:shadow-[8px_8px_0_0_#000] hover:translate-x-[-2px] hover:translate-y-[-2px]',
  };

  const combinedClassName = cn(
    baseStyles,
    variantStyles[variant],
    sizeStyles[size],
    className
  );

  if (href) {
    if (external) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={combinedClassName}
        >
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={combinedClassName}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={combinedClassName}
    >
      {children}
    </button>
  );
}
