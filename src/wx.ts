import * as Browser from './browser';
import { generateWxOriginTag } from './generate';
import {
  CallappConfig,
  CallappOptions,
  DomListType,
  WeappConfig,
  WxTagErrorEvent,
  WxTagFailure,
} from './types';

type Open = (config: CallappConfig) => void;

export function wxTagFailure(reason: WxTagFailure | undefined, options: CallappOptions): void {
  const { logFunc } = options;
  if (typeof logFunc !== 'undefined') {
    logFunc('failure', reason);
  }
}
// dom事件注册
export function bindClickEvent(
  obj: DomListType,
  options: CallappOptions & { hasApp: boolean },
  open: Open
): void {
  if (!obj.isRegister && obj.type === 'app') {
    obj.btn.addEventListener('click', () => {
      const notUseWxNative = Browser.isWechat && !options.useWxNative;
      const wxNativeError = Browser.isWechat && !options.hasApp;
      const ready = Browser.isWechat && options.useWxNative && obj.isWxNativeReady;
      if (ready) return;
      if (!Browser.isWechat || notUseWxNative || wxNativeError) {
        open(obj.config);
      }
    });
    obj.isRegister = true;
  }
}

export function registeWxApp(
  domList: DomListType[],
  options: CallappOptions & { hasApp: boolean },
  open: Open
): void {
  if (!Browser.isWechat) {
    domList.forEach((obj) => {
      bindClickEvent(obj, options, open);
    });
    return;
  }

  wx.ready(() => {
    domList.forEach((obj) => {
      bindClickEvent(obj, options, open);
      if (!options.useWxNative && obj.type === 'app') return;

      const { btn, type, config } = obj;
      btn.innerHTML = generateWxOriginTag(config, options, type);
      const wxBtn = btn.firstChild as HTMLElement;

      wxBtn.addEventListener('ready', () => {
        obj.isWxNativeReady = true;
      });
      // e: Event & WxTagErrorEvent
      wxBtn.addEventListener('launch', () => {
        if (obj.type === 'app') {
          options.hasApp = true;
        }
      });
      wxBtn.addEventListener('error', (e: Event & WxTagErrorEvent) => {
        // 如果微信打开失败，证明没有应用，在ios需要打开app store。不能跳转universal link
        wxTagFailure(e.detail, options);
        if (type === 'app') {
          options.hasApp = e.detail?.errMsg !== 'launch:fail';
          open(obj.config);
        }
      });
    });
  });
}

export function registeDom(
  config: CallappConfig & WeappConfig,
  options: CallappOptions,
  domList: DomListType[]
): DomListType[] {
  if (!config.id) {
    throw new Error('use dom you need id parameter to register');
  }
  if (config.type === 'weapp' && !config.appid && !options.weappId) {
    throw new Error('weapp need appid');
  }
  const dom = document.querySelector(`#${config.id}`);
  if (!dom) {
    throw new Error(`make sure the dom by #${config.id} is exists`);
  }
  const index = domList.findIndex((obj) => obj.config.id === config.id);
  if (index !== -1) {
    throw new Error(`the #${config.id} is not only`);
  }
  config.type = config.type ?? 'app';
  if (config.type === 'weapp') {
    config.env = config.env ?? 'release';
    config.appid = config.appid ?? options.weappId;
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
