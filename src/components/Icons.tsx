type IconProps = {
  size?: number;
  className?: string;
  "aria-hidden"?: boolean | "true" | "false";
};

function baseProps({ size = 20, className, ...rest }: IconProps) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 256 256",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 16,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    ...rest,
  };
}

export function IconCart(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <circle cx="88" cy="216" r="12" fill="currentColor" stroke="none" />
      <circle cx="192" cy="216" r="12" fill="currentColor" stroke="none" />
      <path d="M32 48h24l20.89 104.46A16 16 0 0 0 92.54 164h98.92a16 16 0 0 0 15.65-12.12L224 64H56" />
    </svg>
  );
}

export function IconUpload(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M128 152V40" />
      <path d="M88 80l40-40 40 40" />
      <path d="M40 152v40a16 16 0 0 0 16 16h144a16 16 0 0 0 16-16v-40" />
    </svg>
  );
}

export function IconArrowRight(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M40 128h176" />
      <path d="M144 64l64 64-64 64" />
    </svg>
  );
}

export function IconArrowUp(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M128 216V40" />
      <path d="M80 88l48-48 48 48" />
    </svg>
  );
}

export function IconChevronLeft(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M160 48l-80 80 80 80" />
    </svg>
  );
}

export function IconChevronRight(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M96 48l80 80-80 80" />
    </svg>
  );
}

export function IconPackage(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M128 40 40 84v88l88 44 88-44V84Z" />
      <path d="M128 128 40 84" />
      <path d="M128 128v88" />
      <path d="M128 128l88-44" />
      <path d="M176 62 80 110" />
    </svg>
  );
}

export function IconTruck(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M16 144h128v48H16z" />
      <path d="M144 160h48l32 32v32h-80z" />
      <circle cx="56" cy="208" r="16" />
      <circle cx="184" cy="208" r="16" />
      <path d="M16 144V80a16 16 0 0 1 16-16h96v80" />
    </svg>
  );
}

export function IconShield(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M128 24 40 56v56c0 56 40 92 88 112 48-20 88-56 88-112V56Z" />
      <path d="M88 128l24 24 48-48" />
    </svg>
  );
}

export function IconPencil(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M184 40 216 72 96 192 48 208 64 160Z" />
      <path d="M160 64l32 32" />
    </svg>
  );
}

export function IconScales(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M128 40v176" />
      <path d="M72 216h112" />
      <path d="M40 88h176" />
      <path d="M72 88 40 152h64Z" />
      <path d="M184 88l-32 64h64Z" />
    </svg>
  );
}

export function IconCheck(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <circle cx="128" cy="128" r="88" />
      <path d="M88 128l28 28 52-56" />
    </svg>
  );
}

export function IconMenu(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M40 72h176" />
      <path d="M40 128h176" />
      <path d="M40 184h176" />
    </svg>
  );
}

export function IconClose(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M64 64l128 128" />
      <path d="M192 64 64 192" />
    </svg>
  );
}

export function IconHome(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M40 120 128 48l88 72" />
      <path d="M64 112v88a8 8 0 0 0 8 8h40v-56h32v56h40a8 8 0 0 0 8-8v-88" />
    </svg>
  );
}

export function IconHeart(props: IconProps & { filled?: boolean }) {
  const { filled, ...rest } = props;
  if (filled) {
    return (
      <svg
        {...baseProps(rest)}
        fill="currentColor"
        stroke="currentColor"
        strokeWidth={12}
      >
        <path d="M128 216s-76-48-92-96a48 48 0 0 1 84-44 48 48 0 0 1 84 44c-16 48-92 96-92 96Z" />
      </svg>
    );
  }
  return (
    <svg {...baseProps(rest)}>
      <path d="M128 216s-76-48-92-96a48 48 0 0 1 84-44 48 48 0 0 1 84 44c-16 48-92 96-92 96Z" />
    </svg>
  );
}

export function IconPhone(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M80 48h40l16 48-28 16a120 120 0 0 0 48 48l16-28 48 16v40a16 16 0 0 1-16 16A152 152 0 0 1 64 64a16 16 0 0 1 16-16Z" />
    </svg>
  );
}

export function IconSearch(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <circle cx="112" cy="112" r="72" />
      <path d="M168 168l48 48" />
    </svg>
  );
}

export function IconGrid(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <rect x="40" y="40" width="68" height="68" />
      <rect x="148" y="40" width="68" height="68" />
      <rect x="40" y="148" width="68" height="68" />
      <rect x="148" y="148" width="68" height="68" />
    </svg>
  );
}

export function IconStar(props: IconProps & { filled?: boolean }) {
  const { filled, ...rest } = props;
  return (
    <svg
      {...baseProps(rest)}
      fill={filled ? "currentColor" : "none"}
      strokeWidth={filled ? 12 : 16}
    >
      <path d="M128 28l28 72h76l-62 46 24 74-66-46-66 46 24-74-62-46h76Z" />
    </svg>
  );
}

export function IconShare(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <circle cx="64" cy="128" r="24" />
      <circle cx="176" cy="64" r="24" />
      <circle cx="176" cy="192" r="24" />
      <path d="M88 116l64-40" />
      <path d="M88 140l64 40" />
    </svg>
  );
}

export function IconFacebook(props: IconProps) {
  return (
    <svg
      {...baseProps(props)}
      fill="currentColor"
      stroke="none"
      viewBox="0 0 24 24"
    >
      <path d="M22 12.07C22 6.48 17.52 2 11.93 2S1.86 6.48 1.86 12.07c0 5.02 3.66 9.18 8.44 9.93v-7.02H7.9v-2.91h2.4V9.84c0-2.37 1.4-3.69 3.56-3.69 1.03 0 2.12.19 2.12.19v2.34h-1.2c-1.18 0-1.55.74-1.55 1.49v1.78h2.64l-.42 2.91h-2.22V22c4.78-.75 8.44-4.91 8.44-9.93Z" />
    </svg>
  );
}

export function IconViber(props: IconProps) {
  return (
    <svg
      {...baseProps(props)}
      fill="currentColor"
      stroke="none"
      viewBox="0 0 24 24"
    >
      <path d="M11.4 2C6.8 2.1 3.1 5.4 2.5 9.9c-.5 3.7.9 6.5 3.1 8.2v3.1l3-1.6c.9.3 1.9.4 2.9.4h.1c4.9 0 9-3.7 9.4-8.5C21.4 6.2 16.8 1.9 11.4 2Zm4.9 12.5c-.2.5-1.1 1-1.6 1.1-.4.1-.9.2-2.9-.6-2.4-1-4-3.6-4.1-3.8-.1-.2-.9-1.2-.9-2.3s.6-1.6.8-1.8c.2-.2.4-.3.6-.3h.4c.1 0 .3 0 .5.4.2.5.6 1.5.7 1.6.1.1.1.3 0 .4l-.3.4c-.1.1-.3.3-.1.6.1.3.6 1 1.3 1.6.9.8 1.6 1 1.9 1.1.2.1.4.1.5-.1l.7-.8c.1-.1.3-.1.5-.1.2.1 1.1.5 1.3.6.2.1.4.2.4.3.1.2.1.9-.1 1.4Z" />
    </svg>
  );
}

