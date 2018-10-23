let iframe = null;

function getPagePropertyPrefix() {
  const prefixes = ['webkit', 'moz', 'ms', 'o'];
  let correctPrefix;

  if ('hidden' in document) return '';

  prefixes.forEach((prefix) => {
    if (`${prefix}Hidden` in document) {
      correctPrefix = prefix;
    }
  });

  return correctPrefix || false;
}

function isPageHidden() {
  const prefix = getPagePropertyPrefix();
  if (prefix === false) return false;

  const hiddenProperty = prefix ? `${prefix}Hidden` : 'hidden';
  return document[hiddenProperty];
}

function getVisibilityChangeProperty() {
  const prefix = getPagePropertyPrefix();
  if (prefix === false) return false;

  return `${prefix}visibilitychange`;
}

/**
 * 通过 top.location.href 跳转
 * 使用 top 是因为在 qq 中打开的页面不属于顶级页面(iframe级别)
 * 自身 url 变更无法触动唤端操作
 * @param {string}} [uri] - 需要打开的地址
 */
export function evokeByLocation(uri) {
  window.top.location.href = uri;
}

/**
 * 通过 iframe 唤起
 * @param {string}} [uri] - 需要打开的地址
 */
export function evokeByIFrame(uri) {
  if (!iframe) {
    iframe = document.createElement('iframe');
    iframe.frameborder = '0';
    iframe.style.cssText = 'display:none;border:0;width:0;height:0;';
    document.body.appendChild(iframe);
  }

  iframe.src = uri;
}

/**
 * 检测是否唤端成功
 * @param {function} cb - 唤端失败回调函数
 */
export function checkOpen(cb, timeout) {
  const visibilityChangeProperty = getVisibilityChangeProperty();
  const timer = setTimeout(() => {
    const hidden = isPageHidden();
    if (!hidden) {
      cb();
    }
  }, timeout);

  if (visibilityChangeProperty) {
    document.addEventListener(visibilityChangeProperty, () => {
      clearTimeout(timer);
    });

    return;
  }

  window.addEventListener('pagehide', () => {
    clearTimeout(timer);
  });
}
