import { CallappConfig, CallappOptions, Intent, WeappConfig, WxTagOption } from './types';

// 根据 param 生成 queryString
function generateQS(param?: Record<string, any>): string {
  const qs =
    typeof param !== 'undefined'
      ? Object.keys(param)
          .map((key) => `${key}=${param[key]}`)
          .join('&')
      : '';

  return qs ? `?${qs}` : '';
}

// 生成基本的 url scheme
export function buildScheme(config: CallappConfig, options: CallappOptions): string {
  const { path, param } = config;
  const { scheme, buildScheme: customBuildScheme } = options;

  if (typeof customBuildScheme !== 'undefined') {
    return customBuildScheme(config, options);
  }

  const { host, port, protocol } = scheme;
  const portPart = port ? `:${port}` : '';
  const hostPort = host ? `${host}${portPart}/` : '';
  const qs = generateQS(param);

  return `${protocol}://${hostPort}${path}${qs}`;
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
  const qs = generateQS(param);

  const newUniversalLink = `https://${host}/${path}${qs}`;
  const oldUniversalLink = `https://${host}?${pathKey}=${path}${qs.replace('?', '&')}`;

  return pathKey ? oldUniversalLink : newUniversalLink;
}

// 生成 应用宝链接
export function generateYingYongBao(config: CallappConfig, options: CallappOptions): string {
  const url = generateScheme(config, options);
  // 支持 AppLink
  return `${options.yingyongbao}&android_schema=${encodeURIComponent(url)}`;
}

function transformUnit(val: string) {
  if (!/[a-z]$/.test(val)) {
    val += 'px';
  }
  return val;
}

// 生成微信tag
export function generateWxTag(
  config: CallappConfig & WxTagOption,
  options: CallappOptions
): string {
  const { id, height = '40px', btnText = '立即打开' } = config;
  const { wxAppid } = options;
  const h = transformUnit(height);
  return `<wx-open-launch-app id="launch_${id}" appid="${wxAppid}" extinfo="${buildScheme(
    config,
    options
  )}" style="position:absolute;top:0;left:0;right:0;bottom:0;">
            <script type="text/wxtag-template">
              <style>.wx-btn{height: ${h};opacity: 0;}</style>
              <div class="wx-btn">${btnText}</div>
            </script>
          </wx-open-launch-app>`;
}

// 生成微信小程序tag
export function generateWeappTag(config: WeappConfig, options: CallappOptions): string {
  const {
    id,
    height = '40px',
    appid,
    wePath,
    username,
    env,
    extraData,
    btnText = '打开小程序',
  } = config;
  const { weappId } = options;
  if (!weappId && !appid) {
    throw new Error('need weapp appid');
  }
  const h = transformUnit(height);
  const extra =
    extraData && (typeof extraData === 'string' ? extraData : encodeURIComponent(extraData));
  return `<wx-open-launch-weapp id="weapp_${id}" appid="${
    appid || weappId
  }" path="${wePath}" username="${username}" env-version="${env}" extra-data="${extra}"
    style="position:absolute;top:0;left:0;right:0;bottom:0;">
      <script type="text/wxtag-template">
        <style>.btn {height: ${h};opacity: 0;}</style>
        <button class="btn">${btnText}</button>
      </script>
    </wx-open-launch-weapp>`;
}
