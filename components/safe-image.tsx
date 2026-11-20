"use client";

import React, { useState, useEffect } from "react";
import Image, { ImageProps } from "next/image";

interface SafeImageProps extends Omit<ImageProps, "onError"> {
  fallbackSrc: string;
}

/**
 * SafeImage attempts to load the primary `src` (e.g. Supabase storage URL).
 * If it fails to load or errors out, it gracefully falls back to `fallbackSrc`
 * (e.g. local /public/assets/... file) so that users never see a broken image or blank space.
 */
export function SafeImage({ src, fallbackSrc, alt, ...rest }: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState<string>(src as string);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setImgSrc(src as string);
    setHasError(false);
  }, [src]);

  return (
    <Image
      {...rest}
      src={hasError || !imgSrc ? fallbackSrc : imgSrc}
      alt={alt}
      onError={() => {
        if (!hasError && imgSrc !== fallbackSrc) {
          setHasError(true);
          setImgSrc(fallbackSrc);
        }
      }}
    />
  );
}
