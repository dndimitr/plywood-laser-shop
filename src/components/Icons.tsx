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
