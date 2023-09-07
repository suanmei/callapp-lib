declare const wx: {
  ready: (callback: () => void) => void;
  error: (callback: () => void) => void;
};
declare interface Window {
  wx: typeof wx;
}
interface Document {
  webkitHidden?: boolean;
  msHidden?: boolean;
}
