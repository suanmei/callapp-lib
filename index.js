/**
 * @author suanmei <mr_suanmei@163.com>
 */
import { getIOSVersion, getBrowser } from './sources/browser';
import * as generate from './sources/generate';
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
    const defaultOptions = { timeout: 2000 };
    this.options = Object.assign(defaultOptions, options);
  }

  /**
   * 注册为方法
   * generateScheme | generateIntent | generateUniversalLink | generateYingYongBao | checkOpen
   */
  generateScheme(config) {
    return generate.generateScheme(config, this.options);
  }

  generateIntent(config) {
    return generate.generateIntent(config, this.options);
  }

  generateUniversalLink(config) {
    return generate.generateUniversalLink(config, this.options);
  }

  generateYingYongBao(config) {
    return generate.generateYingYongBao(config, this.options);
  }

  checkOpen(cb) {
    return checkOpen(cb, this.options.timeout);
  }

  /**
   * 唤端失败跳转 app store
   * @memberof CallApp
   */
  fallToAppStore() {
    this.checkOpen(() => {
      evokeByLocation(this.options.appstore);
    });
  }

  /**
   * 唤端失败跳转通用(下载)页
   * @memberof CallApp
   */
  fallToFbUrl() {
    this.checkOpen(() => {
      evokeByLocation(this.options.fallback);
    });
  }

  /**
   * 唤端失败调用自定义回调函数
   * @memberof CallApp
   */
  fallToCustomCb(callback) {
    this.checkOpen(() => {
      callback();
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

    const {
      universal,
      appstore,
      logFunc,
      intent,
    } = this.options;

    const { callback } = config;
    const supportUniversal = typeof universal !== 'undefined';
    const schemeURL = this.generateScheme(config);
    let checkOpenFall = null;

    if (typeof logFunc !== 'undefined') {
      logFunc();
    }

    if (browser.isIos) {
      // 近期ios版本qq禁止了scheme和universalLink唤起app，安卓不受影响 - 18年12月23日
      // ios qq浏览器禁止了scheme和universalLink - 2019年5月1日
      if (browser.isWechat || browser.isQQ || browser.isQQBrowser) {
        evokeByLocation(appstore);
      } else if ((getIOSVersion() < 9)) {
        evokeByIFrame(schemeURL);
        checkOpenFall = this.fallToAppStore;
      } else if (!supportUniversal) {
        evokeByLocation(schemeURL);
        checkOpenFall = this.fallToAppStore;
      } else {
        evokeByLocation(this.generateUniversalLink(config));
      }
    // Android
    } else if (browser.isWechat) {
      evokeByLocation(this.generateYingYongBao(config));
    } else if (browser.isOriginalChrome) {
      if (typeof intent !== 'undefined') {
        evokeByLocation(this.generateIntent(config));
      } else {
        // scheme 在 andriod chrome 25+ 版本上必须手势触发
        evokeByTagA(schemeURL);
        checkOpenFall = this.fallToFbUrl;
      }
    } else {
      evokeByIFrame(schemeURL);
      checkOpenFall = this.fallToFbUrl;
    }

    if (typeof callback !== 'undefined') {
      this.fallToCustomCb(callback);
      return;
    }

    if (!checkOpenFall) return;

    checkOpenFall.call(this);
  }
}

export default CallApp;
