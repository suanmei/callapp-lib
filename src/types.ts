export interface CallappConfig<Params = Record<string, unknown>> {
  path: string;
  param?: Params;
  callback?: () => void;
}

export interface WxTagOption {
  id: string;
  height?: number;
}

export interface domListType {
  btn: HTMLElement;
  config: CallappConfig & WxTagOption;
  isRegister: boolean;
  isWxNativeBtnReady: boolean;
}

export interface WxTagErrorEvent {
  detail?: WxTagCalled;
}

export interface WxTagCalled {
  errMsg?: string;
  appId?: string;
  extInfo?: string;
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
  useWxNative?: boolean;
  wxAppid?: string;
  appstore: string;
  yingyongbao?: string;
  isSupportWeibo?: boolean;
  fallback: string;
  timeout?: number;
  logFunc?: (status: 'pending' | 'failure', wxTagCalled?: WxTagCalled) => void;
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
