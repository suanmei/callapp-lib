export interface CallappConfig<Params = Record<string, unknown>> {
  path: string;
  param?: Params;
  callback?: () => void;
}

export interface WxTagOption {
  id: string;
  type?: 'app' | 'minapp';
  height?: string;
  btnText?: string;
}

export interface WeappConfig extends WxTagOption {
  appid?: string;
  username?: string;
  wePath?: string;
  env?: 'release' | 'develop' | 'trial';
  extraData?: string;
}

export interface DomListType {
  btn: HTMLElement;
  type: 'app' | 'minapp';
  config: CallappConfig & WeappConfig;
  isRegister: boolean;
  isWxNativeReady: boolean;
}

export interface WxTagErrorEvent {
  detail?: WxTagFailure;
}

export interface WxTagFailure {
  errMsg?: string;
  appId?: string;
  extInfo?: string;
  // weapp
  userName?: string;
  path?: string;
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
  weappId?: string;
  appstore: string;
  yingyongbao?: string;
  isSupportWeibo?: boolean;
  fallback: string;
  timeout?: number;
  logFunc?: (status: 'pending' | 'failure', wxTagFailure?: WxTagFailure) => void;
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
