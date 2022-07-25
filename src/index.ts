import * as Browser from './browser';
import * as generate from './generate';
import { evokeByLocation, evokeByTagA, evokeByIFrame, checkOpen } from './evoke';
import {
  CallappConfig,
  CallappOptions,
  WxTagCalled,
  WxTagErrorEvent,
  domListType,
  WxTagOption,
} from './types';

class CallApp {
  private readonly options: CallappOptions & { timeout: number };

  private domList: domListType[] = [];

  private hasApp = true;

  // Create an instance of CallApp
  constructor(options: CallappOptions) {
    const defaultOptions = { useWxNative: true, timeout: 2000 };
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

  public generateWxTag(config: CallappConfig & WxTagOption): string {
    return generate.generateWxTag(config, this.options);
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

  // dom事件注册
  bindClickEvent(): void {
    this.domList.forEach((obj) => {
      if (!obj.isRegister) {
        const { id, height, ...config } = obj.config;
        obj.btn.addEventListener('click', () => {
          if (Browser.isWechat && this.options.useWxNative && !obj.isWxNativeBtnReady) return;
          this.open(config);
        });
        obj.isRegister = true;
      }
    });
  }

  wxTagCalled(reason: WxTagCalled | undefined, type: 'pending' | 'failure' = 'failure'): void {
    const { logFunc } = this.options;
    if (typeof logFunc !== 'undefined') {
      logFunc(type, reason);
    }
  }

  setDomConfig(config: (CallappConfig & WxTagOption) | Array<CallappConfig & WxTagOption>): void {
    const { useWxNative, wxAppid } = this.options;
    if (Browser.isWechat && useWxNative && !wxAppid) {
      throw new Error('use wx-tag need wxAppid in the options');
    }

    const list = !Array.isArray(config) ? [config] : config;
    list.forEach((c) => this.registerDomClick(c));

    this.bindClickEvent();

    if (!useWxNative || !window.wx) return;

    wx.error(() => {
      this.wxTagCalled({
        errMsg: 'error',
      });
    });

    document.addEventListener('WeixinOpenTagsError', (e: Event & WxTagErrorEvent) => {
      // 无法使用开放标签的错误原因，需回退兼容。仅无法使用开放标签，JS-SDK其他功能不受影响
      this.wxTagCalled(e.detail);
      // this.bindClickEvent();
    });
  }

  registerDomClick(config: CallappConfig & WxTagOption): void {
    if (!config.id) {
      throw new Error('use dom you need id parameter to register');
    }
    const openapp = document.querySelector(`#${config.id}`);
    if (!openapp) {
      throw new Error(`make sure the dom by #${config.id} is exists`);
    }
    const index = this.domList.findIndex((obj) => obj.config.id === config.id);
    if (index !== -1) {
      throw new Error(`the #${config.id} is not only`);
    }
    const obj = {
      btn: openapp as HTMLElement,
      config,
      isRegister: false,
      isWxNativeBtnReady: false,
    };
    this.domList.push(obj);

    if (!this.options.useWxNative || !window.wx) return;
    wx.ready(() => {
      openapp.innerHTML = generate.generateWxTag(config, this.options);
      const btn = openapp.firstChild as HTMLElement;

      btn.addEventListener('ready', () => {
        obj.isWxNativeBtnReady = true;
      });

      btn.addEventListener('launch', (e: Event & WxTagErrorEvent) => {
        this.wxTagCalled(
          {
            errMsg: 'launch',
            ...e.detail,
          },
          'pending'
        );
        this.hasApp = true;
      });
      btn.addEventListener('error', (e: Event & WxTagErrorEvent) => {
        // 如果微信打开失败，证明没有应用，在ios需要打开app store。不能跳转universal link
        this.hasApp = false;
        this.wxTagCalled(e.detail);
        const { id, height, ...openConfig } = config;
        this.open(openConfig);
      });
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

    const isSupportWeibo = !!this.options.isSupportWeibo;
    if (Browser.isIos || Browser.isIpad) {
      // ios qq 禁止了 universalLink 唤起app，安卓不受影响 - 18年12月23日
      // ios qq 浏览器禁止了 universalLink - 19年5月1日
      // ios 微信自 7.0.5 版本放开了 Universal Link 的限制
      // ios 微博禁止了 universalLink
      if (
        (Browser.isWechat && Browser.semverCompare(Browser.getWeChatVersion(), '7.0.5') === -1) ||
        (Browser.isWeibo && !isSupportWeibo) ||
        !this.hasApp
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
    } else if (
      Browser.isWechat ||
      Browser.isBaidu ||
      (Browser.isWeibo && !isSupportWeibo) ||
      Browser.isQzone
    ) {
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
