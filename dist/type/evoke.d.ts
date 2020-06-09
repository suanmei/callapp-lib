/**
 * 通过 top.location.href 跳转
 * 使用 top 是因为在 qq 中打开的页面不属于顶级页面(iframe级别)
 * 自身 url 变更无法触动唤端操作
 * @param {string}} [uri] - 需要打开的地址
 */
export declare function evokeByLocation(uri: string): void;
/**
 * 通过 iframe 唤起
 * @param {string}} [uri] - 需要打开的地址
 */
export declare function evokeByIFrame(uri: string): void;
/**
 * 通过 A 标签唤起
 * @param {string} uri - 需要打开的地址
 */
export declare function evokeByTagA(uri: string): void;
/**
 * 检测是否唤端成功
 * @param cb - 唤端失败回调函数
 * @param timeout
 */
export declare function checkOpen(cb: () => void, timeout: number): void;
