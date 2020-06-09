import { CallappConfig, CallappOptions, Intent } from './types';

// 生成基本的 url scheme
export function buildScheme(config: CallappConfig, options: CallappOptions): string {
  const { path, param } = config;
  const { buildScheme: customBuildScheme } = options;

  if (typeof customBuildScheme !== 'undefined') {
    return customBuildScheme(config, options);
  }

  const { host, port, protocol } = options.scheme;
  const portPart = port ? `:${port}` : '';
  const hostPort = host ? `${host}${portPart}/` : '';
  const query =
    typeof param !== 'undefined'
      ? Object.keys(param)
          .map((key) => `${key}=${param[key]}`)
          .join('&')
      : '';
  const urlQuery = query ? `?${query}` : '';

  return `${protocol}://${hostPort}${path}${urlQuery}`;
}

// 生成业务需要的 url scheme（区分是否是外链）
export function generateScheme(config: CallappConfig, options: CallappOptions): string {
  const { outChain } = options;
  let uri = buildScheme(config, options);

  if (typeof outChain !== 'undefined' && outChain) {
    const { protocol, path, key } = outChain;
    uri = `${protocol}://${path}?${key}=${encodeURIComponent(uri)}`;
  }

  return uri;
}

// 生成 android intent
export function generateIntent(config: CallappConfig, options: CallappOptions): string {
  const { outChain } = options;
  const { intent, fallback } = options;
  if (typeof intent === 'undefined') return '';

  const keys = Object.keys(intent) as Array<keyof Intent>;
  const intentParam = keys.map((key) => `${key}=${intent[key]};`).join('');
  const intentTail = `#Intent;${intentParam}S.browser_fallback_url=${encodeURIComponent(
    fallback
  )};end;`;
  let urlPath = buildScheme(config, options);

  if (typeof outChain !== 'undefined' && outChain) {
    const { path, key } = outChain;
    return `intent://${path}?${key}=${encodeURIComponent(urlPath)}${intentTail}`;
  }

  urlPath = urlPath.slice(urlPath.indexOf('//') + 2);

  return `intent://${urlPath}${intentTail}`;
}

// 生成 universalLink
export function generateUniversalLink(config: CallappConfig, options: CallappOptions): string {
  const { universal } = options;
  if (typeof universal === 'undefined') return '';

  const { host, pathKey } = universal;
  const { path, param } = config;
  const query =
    typeof param !== 'undefined'
      ? Object.keys(param)
          .map((key) => `${key}=${param[key]}`)
          .join('&')
      : '';
  const urlQuery = query ? `&${query}` : '';

  return `https://${host}?${pathKey}=${path}${urlQuery}`;
}

// 生成 应用宝链接
export function generateYingYongBao(config: CallappConfig, options: CallappOptions): string {
  const url = generateScheme(config, options);
  // 支持 AppLink
  return `${options.yingyongbao}&android_schema=${encodeURIComponent(url)}`;
}
