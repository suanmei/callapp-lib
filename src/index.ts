import * as Browser from './browser';
import * as generate from './generate';
import { evokeByLocation, evokeByIFrame, evokeByTagA, checkOpen } from './evoke';
import { CallappConfig, CallappOptions } from './types';

class CallApp {
  private readonly options: CallappOptions & { timeout: number };

  // Create an instance of CallApp
  constructor(options: CallappOptions) {
    const defaultOptions = { timeout: 2000 };
    this.options = Object.assign(defaultOptions, options);
  }

  /**
   * 注册为方法
   * generateScheme | generateIntent | generateUniversalLink | generateYingYongBao | checkOpen
   */
  public generateScheme(config: CallappConfig): string {
    return generate.generateScheme(config, this.options);
  }

  public generateIntent(config: CallappConfig): string {
    return generate.generateIntent(config, this.options);
  }

  public generateUniversalLink(config: CallappConfig): string {
    return generate.generateUniversalLink(config, this.options);
  }

  public generateYingYongBao(config: CallappConfig): string {
    return generate.generateYingYongBao(config, this.options);
  }

  checkOpen(cb: () => void): void {
    return checkOpen(cb, this.options.timeout);
  }

  // 唤端失败跳转 app store
  fallToAppStore(): void {
    this.checkOpen(() => {
      evokeByLocation(this.options.appstore);
    });
  }

  // 唤端失败跳转通用(下载)页
  fallToFbUrl(): void {
    this.checkOpen(() => {
      evokeByLocation(this.options.fallback);
    });
  }

  // 唤端失败调用自定义回调函数
  fallToCustomCb(callback: () => void): void {
    this.checkOpen(() => {
      callback();
    });
  }

  /**
   * 唤起客户端
   * 根据不同 browser 执行不同唤端策略
   */
  open(config: CallappConfig): void {
    const { universal, appstore, logFunc, intent } = this.options;

    const { callback } = config;
    const supportUniversal = typeof universal !== 'undefined';
    const schemeURL = this.generateScheme(config);
    let checkOpenFall;

    if (typeof logFunc !== 'undefined') {
      logFunc();
    }

    if (Browser.isIos) {
      // 近期ios版本qq禁止了scheme和universalLink唤起app，安卓不受影响 - 18年12月23日
      // ios qq浏览器禁止了scheme和universalLink - 2019年5月1日
      // ios 微信自 7.0.5 版本放开了 Universal Link 的限制
      if (
        (Browser.isWechat && Browser.getWeChatVersion() < '7.0.5') ||
        Browser.isQQ ||
        Browser.isQQBrowser
      ) {
        evokeByLocation(appstore);
      } else if (Browser.getIOSVersion() < 9) {
        evokeByIFrame(schemeURL);
        checkOpenFall = this.fallToAppStore;
      } else if (!supportUniversal) {
        evokeByLocation(schemeURL);
        checkOpenFall = this.fallToAppStore;
      } else {
        evokeByLocation(this.generateUniversalLink(config));
      }
      // Android
    } else if (Browser.isWechat) {
      evokeByLocation(this.generateYingYongBao(config));
    } else if (Browser.isOriginalChrome) {
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
