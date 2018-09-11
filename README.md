## callapp-lib

callapp-lib 是一个 H5 唤起 APP 的解决方案，能够满足大部分唤端场景，也预留了扩展口，帮你实现一些定制化的功能。

如果你想了解一些唤端的原理知识，或者阅读下面的文档有不理解的名词，可以访问这篇博客 [H5唤起APP指南](https://suanmei.github.io/2018/08/23/h5_call_app/) 。

如果你在使用 callapp-lib 的过程中，有好的想法或者发现了bug，提 Issue 就行，作者会及时跟进。

## Install

Install with [npm](https://www.npmjs.com/):

``` sh
$ npm install --save callapp-lib
```

## Usage

``` js
const CallApp = require('callapp-lib');

or

import CallApp from 'callapp-lib';
```

callapp-lib 同样支持 `script` 加载，因为文件目前并未放到服务器上（但最近有计划放到 cdn 上），你暂时需要下载 `dist/index.umd.js` 到你的项目中，`index.umd.js` 会暴露一个全局变量 `CallApp` ，这个全局变量和上面 `commonjs` 导入的 `CallApp` 内容是一致的，使用方法也是一致的。

``` html
<script src="path/to/index.umd.js"></script>
```

callapp-lib 中传递出来的是一个类，你需要将它实例化，然后才能去调用实例对象的方法。

``` js
const options = {
  key1: 'xxx',
  key2: 'xxx'
};
const callLib = new CallApp(options);

callLib.open({
  param: {},
  path: 'xxx'
});
```

## Options

实例化过程中，需要传递一个 options 对象给类，options 对象各属性需要严格按照下面的格式。

下面所有不是必填的，如果你不需要传值，就不要写这个属性，而不是传递一个空字符串或者空对象，callapp-lib 并未对这种情况进行严格的检测。

### protocol

类型: `string`  
必填: ✅

URL Scheme 的 scheme 字段，是你要打开的 APP 的标识

### outChain

类型: `object`  
必填: ❎

外链。我们的 APP 的某些功能可能会集成到另一个 APP 中，为了区分它们的协议，会加上一个中间透明页来分发路由，这层中间页的 URL Scheme 对于我们来说就是外链。当然，这里的外链对 Intent 同样生效。

例：`youku://ykshortvideo?url=xxx`

+ protocal 

  同 URL Scheme 的 scheme 字段，在你的 APP 就和上面的 protocal 属性值相同，在其他 APP 打开就传该 APP 的 scheme 标识。

+ path

  参考 URL Scheme 的 path 字段，它代表了该 APP 的具体的某个功页面（功能），这里的 path 就是对应的中间页。

+ key

  既然只是中间页，它自然要打开我们真正要打开的页面，所以我们需要把要打开的页面的 URL Scheme 传递过去。就像前端从 URL 的 query 字符串里面取值一样，客户端也是从 URL Scheme 里面来取。至于参数 key 定成什么，大家自己去协商吧，上面的示例中 `url` 也只是一个示例。

### intent

类型: `object`  
必填: ✅

安卓原生谷歌浏览器必须传递 Intent 协议地址，才能唤起 APP。

它支持以下五个属性，其中 scheme 和 上面的 protocal 一样，其他四个都是 apk 相关信息，其中 package 和 scheme 必传：

  + package
  + action
  + category
  + component
  + scheme

### universal

类型: `object`  
必填: ❎

如果你们的 ios 工程师没有做相应的配置来让 APP 支持 Universal Link，你可以不用传递， *callap-lib* 将会使用 URL Scheme 来替代它。

+ host

  你的 Universal Link 的域名，`apple-app-site-association` 文件就放在这个域名对应的服务器上。

+ pathKey

  pathKey 就和前面 Intent 的 key 属性一样，只是这里的 pathKey 是客户端用来提取 path 信息的，以便知道调用的是 APP 的哪个页面。这个值也是需要你和 ios 童鞋协商定下来的。

### appstore

类型: `string`  
必填: ✅

APP 的 App Store 地址，例： `https://itunes.apple.com/cn/app/id1383186862`。

### yingyongbao

类型: `string`  
必填: ✅

APP 的应用宝地址，例：`'//a.app.qq.com/o/simple.jsp?pkgname=com.youku.shortvideo'`。

### fallback

类型: `string`  
必填: ✅

唤端失败后跳转的地址。

### logFunc

类型: `function`  
必填: ❎

埋点入口函数。运营同学可能会希望我们在唤端的时候做埋点，将你的埋点函数传递进来，不管唤端成功与否，它都会被执行。当然，你也可以将这个函数另作他用。

## Method

### open

唤端功能。接收一个对象作为参数，该对象支持以下属性：

+ path

  类型: `string`  

  需要打开的页面对应的值，URL Scheme 中的 path 部分，参照 [H5唤起APP指南](https://suanmei.github.io/2018/08/23/h5_call_app/) 一文中的解释。

+ param

  类型: `object`  

  打开 APP 某个页面，它需要接收的参数。

+ callback

  类型: `function`  

  自定义唤端失败回调函数。传递 `callback` 会覆盖 *callapp-lib* 库中默认的唤端失败处理逻辑。

### generateScheme

接收一个对象作为参数，该对象包含以下属性：

+ path
+ param

属性含义和 `open` 方法参数的属性一致。

返回 URL Scheme。如果你觉得 *callapp-lib* 的唤端处理方式不符合你的需求，但你又不想费心费力的自己去拼凑 URL Scheme，可以利用这个方法直接生成。

### generateIntent

生成 Intent 地址，接收参数同 `generateScheme` 方法参数。

### generateUniversalLink

生成 Universal Link，接收参数同 `generateScheme` 方法参数。
