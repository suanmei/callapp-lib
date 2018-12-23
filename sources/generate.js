/**
 * 搭建基本的 url scheme
 * @param {object} config - 参数项
 * @returns {string} url scheme
 * @memberof CallApp
 */
export function buildScheme(config, options) {
  const { path, param } = config;
  // callapp-lib 2.0.0 版本移除 protocol 属性，添加 scheme 属性，详细用法见 README.md
  const { host, port, protocol } = options.scheme;
  const portPart = port ? `:${port}` : '';
  const hostPort = host ? `${host}${portPart}/` : '';
  const query = typeof param !== 'undefined' ? Object.keys(param).map(key => `${key}=${param[key]}`).join('&') : '';
  const urlQuery = query ? `?${query}` : '';

  return `${protocol}://${hostPort}${path}${urlQuery}`;
}

/**
 * 生成业务需要的 url scheme（区分是否是外链）
 * @param {object} config - 参数项
 * @returns {string} url scheme
 * @memberof CallApp
 */
export function generateScheme(config, options) {
  const { outChain } = options;
  let uri = buildScheme(config, options);

  if (typeof outChain !== 'undefined' && outChain) {
    const { protocol, path, key } = outChain;
    uri = `${protocol}://${path}?${key}=${encodeURIComponent(uri)}`;
  }

  return uri;
}

/**
 * 生成 android intent
 * @param {object} config - 唤端参数项
 * @returns {string} intent
 * @memberof CallApp
 */
export function generateIntent(config, options) {
  const { outChain } = options;
  const { intent, fallback } = options;
  const intentParam = Object.keys(intent).map(key => `${key}=${intent[key]};`).join('');
  const intentTail = `#Intent;${intentParam}S.browser_fallback_url=${encodeURIComponent(fallback)};end;`;
  let urlPath = buildScheme(config, options);

  if (typeof outChain !== 'undefined' && outChain) {
    const { path, key } = options.outChain;
    return `intent://${path}?${key}=${encodeURIComponent(urlPath)}${intentTail}`;
  }

  urlPath = urlPath.slice(urlPath.indexOf('//') + 2);

  return `intent://${urlPath}${intentTail}`;
}

/**
 * 生成 universalLink
 * @param {object} config - 唤端参数项
 * @returns {string} universalLink
 * @memberof CallApp
 */
export function generateUniversalLink(config, options) {
  const { universal } = options;
  if (!universal) return '';

  const { host, pathKey } = universal;
  const { path, param } = config;
  const query = typeof param !== 'undefined'
    ? Object.keys(param).map(key => `${key}=${param[key]}`).join('&')
    : '';
  const urlQuery = query ? `&${query}` : '';

  return `//${host}?${pathKey}=${path}${urlQuery}`;
}

/**
 * 生成 universalLink
 * @param {object} config - 唤端参数项
 * @returns {string} universalLink
 * @memberof CallApp
 */
export function generateYingYongBao(config, options) {
  const url = generateScheme(config, options);
  // 支持 AppLink
  return `${options.yingyongbao}&android_schema=${encodeURIComponent(url)}`;
}
