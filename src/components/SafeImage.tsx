import React, { useState } from 'react';
import { Coffee } from 'lucide-react';

interface SafeImageProps {
  src: string;
  alt: string;
  fallbackLabel?: string;
  className?: string;
}

export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt,
  fallbackLabel,
  className = '',
}) => {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#F2EFE9] via-[#EAE5DC] to-[#DFD9CE] text-zinc-600 p-6 text-center select-none ${className}`}
        role="img"
        aria-label={alt}
      >
        <Coffee className="w-8 h-8 text-[#1F4E3D] mb-2.5 stroke-[1.5]" />
        <span className="font-display text-base font-semibold text-zinc-800">
          {fallbackLabel || alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      loading="lazy"
      onError={() => setHasError(true)}
      className={className}
    />
  );
};
