import { Hidden, VisibilityChange } from './types';

let hidden: Hidden;
let visibilityChange: VisibilityChange;
let iframe: HTMLIFrameElement;

function getSupportedProperty(): void {
  if (typeof document.hidden !== 'undefined') {
    // Opera 12.10 and Firefox 18 and later support
    hidden = 'hidden';
    visibilityChange = 'visibilitychange';
  } else if (typeof document.msHidden !== 'undefined') {
    hidden = 'msHidden';
    visibilityChange = 'msvisibilitychange';
  } else if (typeof document.webkitHidden !== 'undefined') {
    hidden = 'webkitHidden';
    visibilityChange = 'webkitvisibilitychange';
  }
}

getSupportedProperty();

/**
 * 判断页面是否隐藏（进入后台）
 */
function isPageHidden(): boolean {
  if (typeof hidden === 'undefined') return false;
  return document[hidden] as boolean;
}

/**
 * 通过 top.location.href 跳转
 * 使用 top 是因为在 qq 中打开的页面不属于顶级页面(iframe级别)
 * 自身 url 变更无法触动唤端操作
 * @param {string}} [uri] - 需要打开的地址
 */
export function evokeByLocation(uri: string): void {
  window.top.location.href = uri;
}

/**
 * 通过 iframe 唤起
 * @param {string}} [uri] - 需要打开的地址
 */
export function evokeByIFrame(uri: string): void {
  if (!iframe) {
    iframe = document.createElement('iframe');
    iframe.frameBorder = '0';
    iframe.style.cssText = 'display:none;border:0;width:0;height:0;';
    document.body.append(iframe);
  }

  iframe.src = uri;
}

/**
 * 检测是否唤端成功
 * @param cb - 唤端失败回调函数
 * @param timeout
 */
export function checkOpen(cb: () => void, timeout: number): void {
  const timer = setTimeout(() => {
    const pageHidden = isPageHidden();
    if (!pageHidden) {
      cb();
    }
  }, timeout);

  if (typeof visibilityChange !== 'undefined') {
    document.addEventListener(visibilityChange, () => {
      clearTimeout(timer);
    });
  } else {
    window.addEventListener('pagehide', () => {
      clearTimeout(timer);
    });
  }
}
