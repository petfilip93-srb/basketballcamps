import React from 'react';

interface BasketballRatingProps {
  rating: number;
  readonly?: boolean;
  onChange?: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
}

export function BasketballRating({
  rating,
  readonly = false,
  onChange,
  size = 'md',
}: BasketballRatingProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const Basketball = ({ filled }: { filled: boolean }) => (
    <svg
      className={`${sizeClasses[size]} ${filled ? 'text-black' : 'text-slate-300'} ${!readonly && 'cursor-pointer'} transition-colors`}
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" fill={filled ? 'currentColor' : 'none'} />
      <path d="M12 2v20M2 12h20M6 6l12 12M18 6l-12 12" stroke="currentColor" strokeWidth="1" />
    </svg>
  );

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((index) => (
        <button
          key={index}
          onClick={() => !readonly && onChange?.(index)}
          disabled={readonly}
          className={readonly ? 'cursor-default' : 'hover:scale-110 transition-transform'}
        >
          <Basketball filled={index <= Math.round(rating)} />
        </button>
      ))}
    </div>
  );
}
