import Image from "next/image";

type BrandLogoProps = {
  /** header | footer | hero */
  variant?: "header" | "footer" | "hero";
  className?: string;
  priority?: boolean;
};

/**
 * Studio Breza wordmark + birch-B mark.
 * Uses optimized transparent PNG for crisp UI.
 */
export function BrandLogo({
  variant = "header",
  className,
  priority = false,
}: BrandLogoProps) {
  const sizes =
    variant === "hero"
      ? { width: 280, height: 97, className: "brand-logo brand-logo--hero" }
      : variant === "footer"
        ? { width: 168, height: 58, className: "brand-logo brand-logo--footer" }
        : { width: 148, height: 51, className: "brand-logo brand-logo--header" };

  return (
    <Image
      src="/brand/studio-breza-logo-header.png"
      alt="Studio Breza"
      width={sizes.width}
      height={sizes.height}
      className={[sizes.className, className].filter(Boolean).join(" ")}
      priority={priority}
      unoptimized={false}
    />
  );
}
