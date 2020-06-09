import { CallappConfig, CallappOptions } from './types';
declare class CallApp {
    private readonly options;
    constructor(options: CallappOptions);
    /**
     * 注册为方法
     * generateScheme | generateIntent | generateUniversalLink | generateYingYongBao | checkOpen
     */
    generateScheme(config: CallappConfig): string;
    generateIntent(config: CallappConfig): string;
    generateUniversalLink(config: CallappConfig): string;
    generateYingYongBao(config: CallappConfig): string;
    checkOpen(cb: () => void): void;
    fallToAppStore(): void;
    fallToFbUrl(): void;
    fallToCustomCb(callback: () => void): void;
    /**
     * 唤起客户端
     * 根据不同 browser 执行不同唤端策略
     */
    open(config: CallappConfig): void;
}
export default CallApp;
