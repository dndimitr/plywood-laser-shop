declare module "meta-capi-param-builder-clientjs" {
  export function processAndCollectAllParams(
    url?: string | null,
    getIpFn?: (() => string | Promise<string>) | null,
  ): Promise<Record<string, string>>;
  export function getFbc(): string;
  export function getFbp(): string;
  export function getClientIpAddress(): string;
}
