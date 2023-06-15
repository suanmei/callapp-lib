import * as Browser from './browser';
import * as generate from './generate';
import { evokeByLocation, evokeByTagA, evokeByIFrame, checkOpen } from './evoke';
import {
  CallappConfig,
  CallappOptions,
  WxTagFailure,
  WxTagErrorEvent,
  DomListType,
  WxTagOption,
  WeappConfig,
} from './types';

class CallApp {
  private readonly options: CallappOptions & { timeout: number };

  private domList: DomListType[] = [];

  private hasApp = false;

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

  public generateWeappTag(config: CallappConfig & WeappConfig): string {
    return generate.generateWeappTag(config, this.options);
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

  wxTagFailure(reason: WxTagFailure | undefined): void {
    const { logFunc } = this.options;
    if (typeof logFunc !== 'undefined') {
      logFunc('failure', reason);
    }
  }

  signup(config: (CallappConfig & WeappConfig) | Array<CallappConfig & WeappConfig>): void {
    const { useWxNative, wxAppid } = this.options;
    if (Browser.isWechat && useWxNative && !wxAppid) {
      throw new Error('use wx-tag need wxAppid in the options');
    }

    const list = !Array.isArray(config) ? [config] : config;
    const domList: DomListType[] = [];
    list.forEach((c) => this.registeDom(c, domList));
    // 注册微信打开app
    this.registeWxApp(domList);

    if (!useWxNative || !window.wx) return;

    wx.error(() => {
      this.wxTagFailure({
        errMsg: 'wx register fail',
      });
    });

    document.addEventListener('WeixinOpenTagsError', (e: Event & WxTagErrorEvent) => {
      // 无法使用开放标签的错误原因，需回退兼容。仅无法使用开放标签，JS-SDK其他功能不受影响
      this.wxTagFailure(e.detail);
    });
  }

  registeDom(config: CallappConfig & WeappConfig, domList: DomListType[]): DomListType[] {
    if (!config.id) {
      throw new Error('use dom you need id parameter to register');
    }
    if (config.type === 'minapp' && !config.appid && !this.options.weappId) {
      throw new Error('minapp need appid');
    }
    const dom = document.querySelector(`#${config.id}`);
    if (!dom) {
      throw new Error(`make sure the dom by #${config.id} is exists`);
    }
    const index = this.domList.findIndex((obj) => obj.config.id === config.id);
    if (index !== -1) {
      throw new Error(`the #${config.id} is not only`);
    }
    config.type = config.type ?? 'app';
    if (config.type === 'minapp') {
      config.env = config.env ?? 'release';
      config.appid = config.appid ?? this.options.weappId;
    }

    const obj = {
      btn: dom as HTMLElement,
      type: config.type,
      config,
      isRegister: false,
      isWxNativeReady: false,
    };
    domList.push(obj);
    return domList;
  }

  // dom事件注册
  bindClickEvent(obj: DomListType): void {
    if (!obj.isRegister && obj.type === 'app') {
      obj.btn.addEventListener('click', () => {
        const notUseWxNative = Browser.isWechat && !this.options.useWxNative;
        const wxNativeError = Browser.isWechat && !this.hasApp;
        const ready = Browser.isWechat && this.options.useWxNative && obj.isWxNativeReady;
        if (ready) return;
        if (!Browser.isWechat || notUseWxNative || wxNativeError) {
          this.open(obj.config);
        }
      });
      obj.isRegister = true;
    }
  }

  registeWxApp(domList: DomListType[]): void {
    if (!Browser.isWechat) {
      domList.forEach((obj) => {
        this.bindClickEvent(obj);
      });
      return;
    }

    const tagType = {
      app: 'generateWxTag',
      minapp: 'generateWeappTag',
    } as const;
    wx.ready(() => {
      domList.forEach((obj) => {
        this.bindClickEvent(obj);
        if (!this.options.useWxNative && obj.type === 'app') return;

        const { btn, type } = obj;
        btn.innerHTML = this[tagType[type]](obj.config);
        const wxBtn = btn.firstChild as HTMLElement;

        wxBtn.addEventListener('ready', () => {
          obj.isWxNativeReady = true;
        });
        // e: Event & WxTagErrorEvent
        wxBtn.addEventListener('launch', () => {
          if (obj.type === 'app') {
            this.hasApp = true;
          }
        });
        wxBtn.addEventListener('error', (e: Event & WxTagErrorEvent) => {
          // 如果微信打开失败，证明没有应用，在ios需要打开app store。不能跳转universal link
          this.wxTagFailure(e.detail);
          if (type === 'app') {
            this.hasApp = false;
            this.open(obj.config);
          }
        });
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
        (Browser.isWechat && this.options.useWxNative && !this.hasApp)
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
