// declarations.d.ts
declare module 'cookie' {
  interface CookieSerializeOptions {
      // Define properties and types as needed
      domain?: string;
      encode?(value: string): string;
      expires?: Date;
      httpOnly?: boolean;
      maxAge?: number;
      path?: string;
      sameSite?: boolean | 'lax' | 'strict' | 'none';
      secure?: boolean;
  }

  interface CookieParseOptions {
      // Define properties and types
      decode?(value: string): string;
  }

  export function serialize(name: string, val: string, options?: CookieSerializeOptions): string;
  export function parse(cookie: string, options?: CookieParseOptions): Record<string, string>;
}
