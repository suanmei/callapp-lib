/**
 * @author suanmei <mr_suanmei@163.com>
 */
import { getIOSVersion, getBrowser } from './sources/browser';
import {
  evokeByLocation,
  evokeByIFrame,
  evokeByTagA,
  checkOpen,
} from './sources/evoke';

class CallApp {
  /**
   *Creates an instance of CallApp.
   * @param {object=} options - 配置项
   * @memberof CallApp
   */
  constructor(options) {
    this.options = options || {};
  }

  /**
   * 搭建基本的 url scheme
   * @param {object} config - 参数项
   * @returns {string} url scheme
   * @memberof CallApp
   */
  buildScheme(config) {
    const { path, param } = config;
    const query = typeof param !== 'undefined'
      ? Object.keys(param).map(key => `${key}=${param[key]}`).join('&')
      : '';

    return `${this.options.protocol}://${path}?${query}`;
  }

  /**
   * 生成业务需要的 url scheme（区分是否是外链）
   * @param {object} config - 参数项
   * @returns {string} url scheme
   * @memberof CallApp
   */
  generateScheme(config) {
    const { outChain } = this.options;
    let uri = this.buildScheme(config);

    if (typeof outChain !== 'undefined' && outChain) {
      const { protocal, path, key } = outChain;
      uri = `${protocal}://${path}?${key}=${encodeURIComponent(uri)}`;
    }

    return uri;
  }

  /**
   * 生成 android intent
   * @param {object} config - 唤端参数项
   * @returns {string} intent
   * @memberof CallApp
   */
  generateIntent(config) {
    const { outChain } = config;
    const { intent } = this.options;
    const urlPath = this.buildScheme(config);
    const intentParam = Object.keys(intent).map(key => `${key}=${intent[key]};`).join('');

    if (typeof outChain !== 'undefined' && !outChain) {
      const { path, key } = config.outChain;
      return `intent://${path}?${key}=${encodeURIComponent(urlPath)}/#Intent;${intentParam};end;`;
    }

    return `intent://${urlPath}/#Intent;${intentParam};end;`;
  }

  /**
   * 生成 universalLink
   * @param {object} config - 唤端参数项
   * @returns {string} universalLink
   * @memberof CallApp
   */
  generateUniversalLink(config) {
    const { host, pathKey } = this.options.universal;
    const { path, param } = config;
    const query = typeof param !== 'undefined'
      ? Object.keys(param).map(key => `${key}=${param[key]}`).join('&')
      : '';

    return `//${host}?${pathKey}=${path}${query ? '&' : ''}${query}`;
  }

  /**
   * 生成 universalLink
   * @param {object} config - 唤端参数项
   * @returns {string} universalLink
   * @memberof CallApp
   */
  generateYingYongBao(config) {
    const url = this.generateScheme(config);
    // 支持 AppLink
    return `${this.options.yingyongbao}&android_schema=${encodeURIComponent(url)}`;
  }

  /**
   * 唤端失败跳转 app store
   * @memberof CallApp
   */
  fallToAppStore() {
    checkOpen(() => {
      evokeByLocation(this.options.appstore);
    });
  }

  /**
   * 唤端失败跳转通用(下载)页
   * @memberof CallApp
   */
  fallToFbUrl() {
    checkOpen(() => {
      evokeByLocation(this.options.fallback);
    });
  }

  /**
   * 唤起客户端
   * 根据不同 browser 执行不同唤端策略
   * @param {object} config - 唤端参数项
   * @memberof CallApp
   */
  open(config) {
    const browser = getBrowser();
    const { universal, appstore } = this.options;
    const supportUniversal = typeof universal !== 'undefined';

    if (browser.isIos) {
      if (browser.isWechat) {
        evokeByLocation(appstore);
      } else if ((browser.isSafari && getIOSVersion() < 9) || !supportUniversal) {
        evokeByIFrame(this.generateScheme(config));
        this.fallToAppStore();
      } else {
        evokeByLocation(this.generateUniversalLink(config));
      }
      return;
    }

    if (browser.isWechat) {
      evokeByLocation(this.generateYingYongBao(config));
    } else if (browser.isOriginalChrome) {
      evokeByTagA(this.generateIntent(config));
      this.fallToFbUrl();
    } else {
      evokeByIFrame(this.generateScheme(config));
      this.fallToFbUrl();
    }
  }
}

export default CallApp;
