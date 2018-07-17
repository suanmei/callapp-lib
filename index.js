/**
 * @author suanmei <mr_suanmei@163.com>
 */

class CallApp {
  /**
   *Creates an instance of CallApp.
   * @param {object=} options - 配置项
   * @memberof CallApp
   */
  constructor(options) {
    this.options = options || {};
    this.iframe = null;
  }

  static getIOSVersion() {
    const verion = navigator.appVersion.match(/OS (\d+)_(\d+)_?(\d+)?/);
    return parseInt(verion[1], 10);
  }

  static getBrowser() {
    const ua = window.navigator.userAgent || '';
    const isAndroid = /android/i.test(ua);
    const isIos = /iphone|ipad|ipod/i.test(ua);
    const isWechat = /micromessenger\/([\d.]+)/i.test(ua);
    const isWeibo = /(weibo).*weibo__([\d.]+)/i.test(ua);
    const isQQ = /qq\/([\d.]+)/i.test(ua);
    const isQzone = /qzone\/.*_qz_([\d.]+)/i.test(ua);
    // 安卓 chrome 浏览器，很多 app 都是在 chrome 的 ua 上进行扩展的
    const isOriginalChrome = /chrome\/[\d.]+ Mobile Safari\/[\d.]+/i.test(ua) && isAndroid && ua.indexOf('Version') < 0;
    // chrome for ios 和 safari 的区别仅仅是将 Version/<VersionNum> 替换成了 CriOS/<ChromeRevision>
    // ios 上很多 app 都包含 safari 标识，但它们都是以自己的 app 标识开头，而不是 Mozilla
    const isSafari = /safari\/([\d.]+)$/i.test(ua) && isIos && ua.indexOf('Crios') < 0 && ua.indexOf('Mozilla') === 0;

    return {
      isAndroid,
      isIos,
      isWechat,
      isWeibo,
      isQQ,
      isQzone,
      isOriginalChrome,
      isSafari,
    };
  }

  static checkOpen(cb) {
    setTimeout(() => {
      const hidden = document.hidden || document.webkitHidden;
      if (!hidden) {
        cb();
      }
    }, 2500);
  }

  /**
   * 拼接基本的 url scheme
   * @static
   * @param {object} config - 参数项
   * @returns {string} url scheme
   * @memberof CallApp
   */
  pieceScheme(config) {
    const { path, param } = config;
    const query = Object.keys(param).map(key => `${key}=${param[key]}`);

    return `${this.options.protocol}://${path}?${query}`;
  }

  /**
   * 生成业务需要的 url scheme（区分是否是外链）
   * @static
   * @param {object} config - 参数项
   * @returns {string} url scheme
   * @memberof CallApp
   */
  generateScheme(config) {
    const { outChain } = this.options;
    let uri = this.pieceScheme(config);

    if (typeof outChain !== 'undefined' && outChain) {
      const { protocal, path, key } = outChain;
      uri = `${protocal}://${path}?${key}=${encodeURIComponent(uri)}`;
    }

    return uri;
  }

  /**
   * 生成 android intent
   * @static
   * @param {object} config - 唤端参数项
   * @returns {string} intent
   * @memberof CallApp
   */
  generateIntent(config) {
    const { outChain } = config;
    const { intent } = this.options;
    const urlPath = this.pieceScheme(config);
    const intentParam = Object.keys(intent).map(key => `${key}=${intent[key]};`);

    if (typeof outChain !== 'undefined' && !outChain) {
      const { path, key } = config.outChain;
      return `intent://${path}?${key}=${encodeURIComponent(urlPath)}/#Intent;${intentParam};end;`;
    }

    return `intent://${urlPath}/#Intent;${intentParam};end;`;
  }

  /**
   * 生成 universalLink
   * @static
   * @param {object} config - 唤端参数项
   * @returns {string} universalLink
   * @memberof CallApp
   */
  generateUniversalLink(config) {
    const { host, pathKey } = this.options.universal;
    const { path, param } = config;
    const query = Object.keys(param).map(key => `${key}=${param[key]}`);

    return `//${host}?${pathKey}=${path}&${query}`;
  }

  generateYingYongBao(config) {
    const url = this.generateScheme(config);

    return `${this.options.yingyongbao}&android_schema=${encodeURIComponent(url)}`;
  }

  /**
   * 通过 iframe 唤起
   * @static
   * @param {string}} [uri] - 需要打开的地址
   * @memberof CallApp
   */
  evokeByIFrame(uri) {
    if (!this.iframe) {
      this.iframe = document.createElement('iframe');
      this.iframe.frameborder = '0';
      this.iframe.style.cssText = 'display:none;border:0;width:0;height:0;';
      document.body.appendChild(this.iframe);
    }

    this.iframe.src = uri;
  }

  /**
   * 通过 A 标签唤起
   * @static
   * @param {string}} [uri] - 需要打开的地址
   * @memberof CallApp
   */
  static evokeByTagA(uri) {
    const tagA = document.createElement('a');
    const event = this.createEvent();

    tagA.setAttribute('href', uri);
    tagA.style.display = 'none';
    document.body.appendChild(tagA);

    tagA.dispatchEvent(event);
  }

  /**
   * 通过 location.href 跳转
   * @static
   * @param {string}} [uri] - 需要打开的地址
   * @memberof CallApp
   */
  static evokeByLocation(uri) {
    window.location.href = uri;
  }

  fallToAppStore() {
    CallApp.checkOpen(() => {
      CallApp.evokeByLocation(this.options.appstore);
    });
  }

  fallToFbUrl() {
    CallApp.checkOpen(() => {
      CallApp.evokeByLocation(this.options.fallback);
    });
  }

  /**
   * 创建 event 对象
   * @static
   * @returns {object} event 对象
   * @memberof CallApp
   */
  static createEvent() {
    let event;

    if (window.CustomEvent) {
      event = new window.CustomEvent('click', {
        canBubble: true,
        cancelable: true,
      });
    } else {
      event = document.createEvent('HTMLEvents');
      event.initEvent('click', false, false);
    }

    return event;
  }

  open(config) {
    const browser = CallApp.getBrowser();

    if (browser.isIos) {
      if (browser.isWechat) {
        CallApp.evokeByLocation(this.options.appstore);
      } else if ((browser.isSafari && CallApp.getIOSVersion() < 9) || typeof this.options.universal === 'undefined') {
        this.evokeByIFrame(this.generateScheme(config));
        this.fallToAppStore();
      } else {
        CallApp.evokeByTagA(this.generateUniversalLink(config));
      }
      return;
    }

    if (browser.isWechat) {
      CallApp.evokeByLocation(this.generateYingYongBao(config));
    } else if (browser.isOriginalChrome) {
      CallApp.evokeByTagA(this.generateIntent(config));
      this.fallToFbUrl();
    } else {
      this.evokeByIFrame(this.generateScheme(config));
      this.fallToFbUrl();
    }
  }
}

module.exports = CallApp;
