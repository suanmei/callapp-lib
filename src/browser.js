/**
 * 获取 ios 大版本号
 */
export function getIOSVersion() {
  const version = navigator.appVersion.match(/OS (\d+)_(\d+)_?(\d+)?/);
  return parseInt(version[1], 10);
}

/**
 * 获取 微信 版本号
 */
export function getWeChatVersion() {
  const version = navigator.appVersion.match(/micromessenger\/(\d+\.\d+\.\d+)/i);
  return version[1];
}

/**
 * 获取 browser 信息
 */
export function getBrowser() {
  const ua = window.navigator.userAgent || '';
  const isAndroid = /android/i.test(ua);
  const isIos = /iphone|ipad|ipod/i.test(ua);
  const isWechat = /micromessenger\/([\d.]+)/i.test(ua);
  const isWeibo = /(weibo).*weibo__([\d.]+)/i.test(ua);
  const isQQ = /qq\/([\d.]+)/i.test(ua);
  const isQQBrowser = /(qqbrowser)\/([\d.]+)/i.test(ua);
  const isQzone = /qzone\/.*_qz_([\d.]+)/i.test(ua);
  // 安卓 chrome 浏览器，很多 app 都是在 chrome 的 ua 上进行扩展的
  const isOriginalChrome = /chrome\/[\d.]+ Mobile Safari\/[\d.]+/i.test(ua) && isAndroid;
  // chrome for ios 和 safari 的区别仅仅是将 Version/<VersionNum> 替换成了 CriOS/<ChromeRevision>
  // ios 上很多 app 都包含 safari 标识，但它们都是以自己的 app 标识开头，而不是 Mozilla
  const isSafari = /safari\/([\d.]+)$/i.test(ua) && isIos && ua.indexOf('Crios') < 0 && ua.indexOf('Mozilla') === 0;

  return {
    isAndroid,
    isIos,
    isWechat,
    isWeibo,
    isQQ,
    isQQBrowser,
    isQzone,
    isOriginalChrome,
    isSafari,
  };
}
