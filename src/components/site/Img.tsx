import Image from "next/image";

interface Props {
  src: string;
  alt: string;
  /** Responsive hint for the browser – defaults to full width. */
  sizes?: string;
  priority?: boolean;
  className?: string;
}

/**
 * Optimised image (AVIF/WebP, srcset, lazy). Layout is controlled by site.css
 * (width/height 100% + object-fit), so intrinsic dimensions here are only a hint.
 */
export function Img({ src, alt, sizes = "100vw", priority, className }: Props) {
  if (!src) return null;
  return (
    <Image
      src={src}
      alt={alt}
      width={1600}
      height={1100}
      sizes={sizes}
      priority={priority}
      className={className}
      unoptimized={src.endsWith(".svg")}
    />
  );
}
