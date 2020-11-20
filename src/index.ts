import * as Browser from './browser';
import * as generate from './generate';
import { evokeByLocation, evokeByTagA, evokeByIFrame, checkOpen } from './evoke';
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

  checkOpen(failure: () => void): void {
    const { logFunc, timeout } = this.options;

    return checkOpen(() => {
      if (typeof logFunc !== 'undefined') {
        logFunc('failure');
      }

      failure();
    }, timeout);
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
      logFunc('pending');
    }

    if (Browser.isIos) {
      // ios qq 禁止了 universalLink 唤起app，安卓不受影响 - 18年12月23日
      // ios qq 浏览器禁止了 universalLink - 19年5月1日
      // ios 微信自 7.0.5 版本放开了 Universal Link 的限制
      // ios 微博禁止了 universalLink
      if (
        (Browser.isWechat && Browser.semverCompare(Browser.getWeChatVersion(), '7.0.5') === -1) ||
        Browser.isWeibo
      ) {
        evokeByLocation(appstore);
      } else if (Browser.getIOSVersion() < 9) {
        evokeByIFrame(schemeURL);
        checkOpenFall = this.fallToAppStore;
      } else if (!supportUniversal || Browser.isQQ || Browser.isQQBrowser || Browser.isQzone) {
        evokeByTagA(schemeURL);
        checkOpenFall = this.fallToAppStore;
      } else {
        evokeByLocation(this.generateUniversalLink(config));
      }
      // Android
      // 在微信中且配置了应用宝链接
    } else if (Browser.isWechat && typeof this.options.yingyongbao !== 'undefined') {
      evokeByLocation(this.generateYingYongBao(config));
    } else if (Browser.isOriginalChrome) {
      if (typeof intent !== 'undefined') {
        evokeByLocation(this.generateIntent(config));
      } else {
        // scheme 在 andriod chrome 25+ 版本上iframe无法正常拉起
        evokeByLocation(schemeURL);
        checkOpenFall = this.fallToFbUrl;
      }
    } else if (Browser.isWechat || Browser.isBaidu || Browser.isWeibo || Browser.isQzone) {
      evokeByLocation(this.options.fallback);
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
