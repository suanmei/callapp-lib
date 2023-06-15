const ua = navigator.userAgent || '';

// 版本号比较
export const semverCompare = (verionA: string, versionB: string): -1 | 0 | 1 => {
  // eslint-disable-next-line no-restricted-properties
  const { isNaN } = window;
  const splitA = verionA.split('.');
  const splitB = versionB.split('.');

  for (let i = 0; i < 3; i++) {
    const snippetA = Number(splitA[i]);
    const snippetB = Number(splitB[i]);

    if (snippetA > snippetB) return 1;
    if (snippetB > snippetA) return -1;

    // e.g. '1.0.0-rc' -- Number('0-rc') = NaN
    if (!isNaN(snippetA) && isNaN(snippetB)) return 1;
    if (isNaN(snippetA) && !isNaN(snippetB)) return -1;
  }

  return 0;
};

/**
 * 获取 ios 大版本号
 */
export const getIOSVersion = (): number => {
  const version = navigator.appVersion.match(/[ ,OSX] (\d+)_(\d+)_?(\d+)?/) as string[];
  return Number.parseInt(version[1], 10);
};

/**
 * 获取 微信 版本号
 */
export const getWeChatVersion = (): string => {
  const version = navigator.appVersion.match(/micromessenger\/(\d+\.\d+\.\d+)/i) as string[];
  return version[1];
};

export const isAndroid = /android/i.test(ua);

export const isIos = /iphone|ipod/i.test(ua);

export const isIpad =
  navigator.userAgent.match(/(iPad)/) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

export const isWechat = /micromessenger\/([\d.]+)/i.test(ua);

export const isWeibo = /(weibo).*weibo__([\d.]+)/i.test(ua);

export const isBaidu = /(baiduboxapp)\/([\d.]+)/i.test(ua);

export const isQQ = /qq\/([\d.]+)/i.test(ua);

export const isQQBrowser = /(qqbrowser)\/([\d.]+)/i.test(ua);

export const isQzone = /qzone\/.*_qz_([\d.]+)/i.test(ua);

// 安卓 chrome 浏览器，包含 原生chrome浏览器、三星自带浏览器、360浏览器以及早期国内厂商自带浏览器
export const isOriginalChrome =
  /chrome\/[\d.]+ mobile safari\/[\d.]+/i.test(ua) && isAndroid && ua.indexOf('Version') < 0;
