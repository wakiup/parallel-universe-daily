declare module "dom-to-image-more" {
  export function toPng(
    node: HTMLElement,
    options?: {
      quality?: number;
      pixelRatio?: number;
      bgcolor?: string;
      backgroundColor?: string;
      width?: number;
      height?: number;
      style?: Record<string, string>;
      cacheBust?: boolean;
      filter?: (node: HTMLElement) => boolean;
      skipAutoScale?: boolean;
      includeQueryParams?: boolean;
    }
  ): Promise<string>;

  export function toJpeg(
    node: HTMLElement,
    options?: {
      quality?: number;
      pixelRatio?: number;
      bgcolor?: string;
      backgroundColor?: string;
      width?: number;
      height?: number;
      style?: Record<string, string>;
      cacheBust?: boolean;
      filter?: (node: HTMLElement) => boolean;
      skipAutoScale?: boolean;
      includeQueryParams?: boolean;
    }
  ): Promise<string>;

  export function toBlob(
    node: HTMLElement,
    options?: {
      quality?: number;
      pixelRatio?: number;
      bgcolor?: string;
      backgroundColor?: string;
      width?: number;
      height?: number;
      style?: Record<string, string>;
      cacheBust?: boolean;
      filter?: (node: HTMLElement) => boolean;
      skipAutoScale?: boolean;
      includeQueryParams?: boolean;
    }
  ): Promise<Blob>;

  export function toSvg(
    node: HTMLElement,
    options?: {
      bgcolor?: string;
      backgroundColor?: string;
      width?: number;
      height?: number;
      style?: Record<string, string>;
      cacheBust?: boolean;
      filter?: (node: HTMLElement) => boolean;
      skipAutoScale?: boolean;
      includeQueryParams?: boolean;
    }
  ): Promise<string>;
}
