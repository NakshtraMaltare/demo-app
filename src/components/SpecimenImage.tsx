import { Sprout } from 'lucide-react';
import { useEffect, useState } from 'react';

interface SpecimenImageProps {
  src: string;
  alt: string;
  fallbackTitle?: string;
  className?: string;
}

export function SpecimenImage({
  src,
  alt,
  fallbackTitle = 'Botanical Specimen',
  className = 'h-full w-full object-cover',
}: SpecimenImageProps) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  if (!src || hasError) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#EDF2EC] via-[#F4F7F3] to-[#E4ECE3] p-6 text-center text-[#3B5241] ${className}`}
      >
        <Sprout className="mb-2 h-8 w-8 stroke-[1.5]" aria-hidden="true" />
        <span className="font-serif text-sm font-medium">{fallbackTitle}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
    />
  );
}
