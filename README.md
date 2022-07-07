# callapp-lib

callapp-lib 是一个 H5 唤起 APP 的解决方案，能够满足大部分唤起客户端的场景，也预留了扩展口，帮你实现一些定制化的功能。

如果你想了解一些唤端的原理知识，或者阅读下面的文档有不理解的名词，可以访问这篇博客 [H5 唤起 APP 指南](https://suanmei.github.io/2018/08/23/h5_call_app/) 。

如果你在使用 callapp-lib 的过程中，有好的想法或者发现了 bug，提 Issue 就行，作者会及时跟进。

## Install

Install with [npm](https://www.npmjs.com/):

```sh
npm install --save callapp-lib
```

## Usage

```js
const CallApp = require('callapp-lib');

or;

import CallApp from 'callapp-lib';
```

callapp-lib 同样支持 `script` 加载，你可以使用下面的 **cdn 文件（地址在下面的示例中）**，也可以下载 `dist/index.umd.js` 到你的项目中，`index.umd.js` 会暴露一个全局变量 `CallApp` ，这个全局变量和上面 `commonjs` 导入的 `CallApp` 内容是一致的，使用方法也是一致的。

```html
<!-- 及时下载未压缩的最新版本 Js -->
<script src="https://unpkg.com/callapp-lib"></script>

or

<!-- 具体某一版本，本例中是 3.1.2 ，下载速度较上面快一些，因为上面的地址会有 302 -->
<script src="https://unpkg.com/callapp-lib@3.1.2/dist/index.umd.js"></script>
```

callapp-lib 中传递出来的是一个类，你需要将它实例化，然后才能去调用实例对象的方法。

```js
const options = {
  key1: 'xxx',
  key2: 'xxx',
};
const callLib = new CallApp(options);

callLib.open({
  param: {},
  path: 'xxx',
});
```

## 微信原生标签使用

```html
<style>
  #open-app {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    opacity: 0;
  }
  .btn {
    position: relative;
    width: 100px;
    height: 40px;
    background: skyblue;
  }
  .btn p {
    color: #fff;
    font-size: 14px;
    line-height: 40px;
    text-align: center;
  }
</style>
<!-- 标签包裹一层，防止wx注入标签时防止闪烁，id标签默认是定位，所以父级需要relative -->
<div class="btn">
  <p>跳转文章</p>
  <div id="open-app"></div>
</div>
```

```js
const options = {
  key1: 'xxx',
  key2: 'xxx',
};
const lib = new CallApp(options);

lib.setDomConfig([
  {
    id: 'open-app',
    path: '',
    height?: 40,
    param?: {
      type: 'article',
      id: 163355,
    }
  }
]);
```

## 答疑

对常见的一些问题进行了[汇总](https://www.yuque.com/egm961/nmf9nm/llbg79)，如果这些问答无法解决你的疑惑，加钉钉群，按照提问模板进行提问

<img src="https://gw.alicdn.com/imgextra/i2/O1CN01lVbsJe1aFuAlli9Lw_!!6000000003301-2-tps-979-1280.png" width="160" />

## Options

实例化过程中，需要传递一个 options 对象给类，options 对象各属性需要严格按照下面的格式。

下面所有不是必填的，如果你不需要传值，就不要写这个属性，而不是传递一个空字符串或者空对象，callapp-lib 并未对这种情况进行严格的检测。

### scheme

类型: `object`  
必填: ✅

用来配置 URL Scheme 所必须的那些 v 字段。

- protocol

  类型: `string`  
  必填: ✅

  APP 协议，URL Scheme 的 scheme 字段，就是你要打开的 APP 的标识。

- host

  类型: `string`  
  必填: ❎

  URL Scheme 的 host 字段。

- port

  类型: `string` | `number`  
  必填: ❎

  URL Scheme 的 port 字段。

### protocol

callapp-lib 2.0.0 版本已移除，原先的 protocol 移入到新增的 scheme 属性中

### outChain

类型: `object`  
必填: ❎

外链。我们的 APP 的某些功能可能会集成到另一个 APP 中，为了区分它们的协议，会加上一个中间透明页来分发路由，这层中间页的 URL Scheme 对于我们来说就是外链。当然，这里的外链对 Intent 同样生效。

例：`youku://ykshortvideo?url=xxx`

- protocol (2.0.0 版本由原先的 protocal 修改为 protocol，原先的 protocal 是拼写错误)

  同 URL Scheme 的 scheme 字段，在你的 APP 就和上面的 protocol 属性值相同，在其他 APP 打开就传该 APP 的 scheme 标识。

- path

  参考 URL Scheme 的 path 字段，它代表了该 APP 的具体的某个功页面（功能），这里的 path 就是对应的中间页。

- key

  既然只是中间页，它自然要打开我们真正要打开的页面，所以我们需要把要打开的页面的 URL Scheme 传递过去。就像前端从 URL 的 query 字符串里面取值一样，客户端也是从 URL Scheme 里面来取。至于参数 key 定成什么，大家自己去协商吧，上面的示例中 `url` 也只是一个示例。

### intent

类型: `object`  
必填: ❎

安卓原生谷歌浏览器必须传递 Intent 协议地址，才能唤起 APP。

它支持以下五个属性，其中 scheme 和 上面的 protocal 一样，其他四个都是 apk 相关信息，其中 package 和 scheme 必传：

- package
- action
- category
- component
- scheme

### universal

类型: `object`  
必填: ❎

如果你们的 ios 工程师没有做相应的配置来让 APP 支持 Universal Link，你可以不用传递， _callap-lib_ 将会使用 URL Scheme 来替代它。

- host

  你的 Universal Link 的域名，`apple-app-site-association` 文件就放在这个域名对应的服务器上。

- pathKey

  `3.5.0` 版本以后 `pathKey` 非必填项，`pathkey` 填写与不填写代表了 Universal Link 拼接的两种方式。不建议使用 `pathKey` ，因为使用它拼接的 Universal Link 不贴合 URL 设计思想。

  - 不使用 pathKey：客户端提起 path 信息将会从 url 中获取，而不是从 queryString 中获取

    Universal Link 拼接规则:

    ```js
    const universalLink = `https://${host}/${open方法中的path}?${open方法中param转换的queryString}`;
    ```

  - 使用 pathKey：pathKey 就和前面 Intent 的 key 属性一样，只是这里的 pathKey 是客户端用来提取 path 信息的，以便知道调用的是 APP 的哪个页面。这个值也是需要你和 ios 童鞋协商定下来的。

    Universal Link 拼接规则:

    ```js
    const universalLink = `https://${host}?${pathKey}=${open方法中的path}&${open方法中param转换的queryString}`;
    ```

### appstore

类型: `string`  
必填: ✅

APP 的 App Store 地址，例： `https://itunes.apple.com/cn/app/id1383186862`。

### yingyongbao

类型: `string`  
必填: ❎

APP 的应用宝地址，例：`'//a.app.qq.com/o/simple.jsp?pkgname=com.youku.shortvideo'`。如果不填写，则安卓微信中会直接跳转 fallback

### useWxNative

类型：`boolean`
必填: ❎
默认：true

默认微信端使用微信原生标签，微信版本 `8.0.8` 以上版本支持使用

### wxAppid

类型：`string`
必填: ❎

<p style="color: red">useWxNative: true, 微信内使用原生标签注册，必填。否则不需要</p>

### isSupportWeibo

类型: `boolean`  
必填: ❎
默认值: false
是否支持微博，默认不支持

### timeout

类型: `number`  
必填: ❎  
默认值: 2000

等待唤端的时间（单位: ms），超时则判断为唤端失败。

### fallback

类型: `string`  
必填: ✅

唤端失败后跳转的地址。

### logFunc

类型: `function`  
必填: ❎

```js
(status: 'pending' | 'failure', wxTagCalled?) => void;
```

埋点入口函数。运营同学可能会希望我们在唤端的时候做埋点，将你的埋点函数传递进来，不管唤端成功与否，它都会被执行。当然，你也可以将这个函数另作他用。

这个回调函数会回执行两次，第一次是触发 open 方法，第二次是唤端失败，它有一个入参 status ，它有两个值 `pending` 和 `failure`，分别代表函数触发及唤端失败。

在微信标签使用中，触发时机是唤端`wx.error|唤端成功|唤端失败`，wxTagCalled 返回相应信息，成功`{errMsg: 'launch'}`，唤端失败返回微信返回的失败信息。wx.error 返回`{errMsg: 'error'}`

### buildScheme

类型: `function`  
必填: ❎

url scheme 自定义拼接函数，内置的 buildScheme 函数是按照 uri 规范来拼接的，如果你们的 app 对 url scheme 有特殊需求，可以自定义这个函数，此函数有两个入参，`(config, options)`, config 是你调用 open 方法是传入的对象，options 是你初始化 callapp-lib 时传入的对象。

## Method

### open

唤端功能。接收一个对象作为参数，该对象支持以下属性：

- path

  类型: `string`
  必填: ✅

  需要打开的页面对应的值，URL Scheme 中的 path 部分，参照 [H5 唤起 APP 指南](https://suanmei.github.io/2018/08/23/h5_call_app/) 一文中的解释。

  只想要直接打开 app ，不需要打开特定页面，path 传空字符串 `''` 就可以。

- param

  类型: `object`  
  必填: ❎

  打开 APP 某个页面，它需要接收的参数。

- callback
  必填: ❎

  类型: `function`

  自定义唤端失败回调函数。传递 `callback` 会覆盖 _callapp-lib_ 库中默认的唤端失败处理逻辑。

### generateScheme

接收一个对象作为参数，该对象包含以下属性：

- path
- param

属性含义和 `open` 方法参数的属性一致。

返回 URL Scheme。如果你觉得 _callapp-lib_ 的唤端处理方式不符合你的需求，但你又不想费心费力的自己去拼凑 URL Scheme，可以利用这个方法直接生成。

### generateIntent

生成 Intent 地址，接收参数同 `generateScheme` 方法参数。

### generateUniversalLink

生成 Universal Link，接收参数同 `generateScheme` 方法参数。

### setDomConfig

在微信环境下使用`微信原生标签`进行 app 跳转，其他环境下进行 dom 的点击事件绑定`open`方法
[微信公众号满足条件](https://developers.weixin.qq.com/doc/oplatform/Mobile_App/WeChat_H5_Launch_APP.html)
需要微信 jssdk [1.6.0](https://res.wx.qq.com/open/js/jweixin-1.6.0.js) 版本以上

<span style="color: red">注意：</span>

1. wx 注册 config 需要绑定的公众号
2. 域名需要开放平台绑定的域名
3. 微信注册 config 需要添加`openTagList: ['wx-open-launch-app']`

- id
  必填：✅
  用于微信自定义标签插入,最好根据父级进行定位，如果跳转失败会给该元素绑定点击事件（lib.open）

- height
  必填：❎
  默认：40
  必须设置高度，无固定高度无法点击跳转

- 其他参数同 open 方法

## 打赏

如果刚好解决了你的问题，如果你心情还不错，如果尚有余粮，可以给作者打赏一杯咖啡哦，爱宁~

<img src="https://gw.alicdn.com/imgextra/i3/O1CN01Mqk09Q1HOAWBMvUt2_!!6000000000747-0-tps-1152-1152.jpg" width="240" />
