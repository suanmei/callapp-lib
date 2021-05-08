export interface CallappConfig<Params = Record<string, unknown>> {
  path: string;
  param?: Params;
  callback?: () => void;
}

export interface CallappOptions {
  scheme: {
    protocol: string;
    host?: string;
    port?: string | number;
  };
  outChain?: {
    protocol: string;
    path: string;
    key: string;
  };
  intent?: Intent;
  universal?: {
    host: string;
    pathKey?: string;
  };
  appstore: string;
  yingyongbao?: string;
  fallback: string;
  timeout?: number;
  logFunc?: (status: 'pending' | 'failure') => void;
  buildScheme?: (config: CallappConfig, options: CallappOptions) => string;
}

export interface Intent {
  package: string;
  scheme: string;
  action?: string;
  category?: string;
  component?: string;
}

export type Hidden = 'hidden' | 'webkitHidden' | 'msHidden' | undefined;

export type VisibilityChange =
  | 'visibilitychange'
  | 'webkitvisibilitychange'
  | 'msvisibilitychange'
  | undefined;
