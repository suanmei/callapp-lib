# callapp-lib

`callapp-lib` is an H5 solution for invoking apps that can meet most of the scenarios for launching client applications. It also provides extension interfaces to help you implement some customized features.

If you're interested in learning about the principles of app invocation, or if you encounter unfamiliar terms while reading the documentation below, you can visit this blog post [H5 Call App Guide](https://suanmei.github.io/2018/08/23/h5_call_app/).

If you have good ideas or encounter any bugs while using `callapp-lib`, just submit an Issue, and the author will follow up promptly.

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

`callapp-lib` also supports loading via the script tag. You can use the **CDN file (the address is provided in the example below)**, or you can download `dist/index.umd.js` to your project. `index.umd.js` will expose a global variable `CallApp`, which is consistent with the CallApp imported using `commonjs` mentioned above, and the usage is also the same.

```html
<!-- Download the latest uncompressed version promptly. Js -->
<script src="https://unpkg.com/callapp-lib"></script>

or

<!-- Download a specific version, in this case, 3.1.2, which may download faster than the above since the above URL may involve a 302 redirect. -->
<script src="https://unpkg.com/callapp-lib@3.1.2/dist/index.umd.js"></script>
```

In `callapp-lib`, what is passed out is a class, which you need to instantiate before you can call methods on the instance object.

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

## 答疑

A summary of frequently asked questions has been compiled here. If these Q&As do not resolve your doubts[here](https://www.yuque.com/egm961/nmf9nm/llbg79), join the DingTalk group and ask your questions according to the provided question template.

<img src="https://gw.alicdn.com/imgextra/i2/O1CN01lVbsJe1aFuAlli9Lw_!!6000000003301-2-tps-979-1280.png" width="160" />

## Options

During the instantiation process, an `options` object must be passed to the class. The properties of the options object need to strictly follow the format below.

For all non-mandatory fields, if you do not need to pass a value, do not include that property at all, rather than passing an empty string or an empty object, as callapp-lib does not strictly check for such cases.

### scheme

type: `object`  
required: ✅

The fields are required for configuring the URL Scheme.

- protocol

  type: `string`  
  required: ✅

The scheme field within the URL Scheme is the identifier for the app protocol, which represents the app you wish to open.

- host

  type: `string`  
  required: ❎

The host field within a URL Scheme.

- port

  type: `string` | `number`  
  required: ❎

The port field within a URL Scheme.

### protocol

In version 2.0.0 of callapp-lib, the original protocol has been removed and incorporated into the newly added scheme property.

### outChain

type: `object`  
required: ❎

External links. Some features of our app may be integrated into another app. To differentiate their protocols, an intermediate transparent page is added to distribute the routing. The URL Scheme of this intermediate page is considered an external link for us. Of course, this concept of external links also applies to Intents.

example：`youku://ykshortvideo?url=xxx`

- In version 2.0.0 of the library, the property name has been corrected from `protocal` to `protocol`. The original protocal was a spelling error.

  The scheme field in the URL Scheme, within your app, corresponds to the same value as the protocol property mentioned above. When opening a link in another app, you should pass the scheme identifier specific to that app.

- path

  The path field in the URL Scheme represents a specific feature page (functionality) within the app. In this context, the path refers to the corresponding intermediary page within the app that the URL Scheme is directing to.

- key

  Since it's just an intermediary page, it naturally needs to open the actual page we want to access. Therefore, we need to pass the URL Scheme of the page we want to open to it. Just like how the frontend extracts values from the query string in a URL, the client app also retrieves information from the URL Scheme. As for what the parameter key should be named, that's something everyone needs to agree upon. In the example above, url is just a sample name.

### intent

type: `object`  
required: ❎

The native Android Google Chrome browser requires the passing of an Intent URI in order to trigger the launch of an app.

It supports the following five attributes, where scheme is the same as the above-mentioned protocol, and the other four are related to APK information. Among them, package and scheme are mandatory:

- package
- action
- category
- component
- scheme

### universal

type: `object`  
required: ❎

If your iOS engineers have not configured the app to support Universal Links, you don't need to pass it; the `callap-lib` will use the URL Scheme as a fallback.

- host

  Your Universal Link's domain name, the `apple-app-site-association` file is located on the server corresponding to this domain name.

- pathKey

  Starting from version `3.5.0`, the `pathKey` is no longer a required field. Whether pathKey is filled in or not represents two different ways of constructing a Universal Link. It is not recommended to use `pathKey` because the Universal Link created with it does not conform to the URL design philosophy.

  - Without using `pathKey`: The client will extract the path information from the URL itself, rather than from the query string.

    Universal Link Concatenation Rules:

    ```js
    // queryString is auto transfrom in callapp-lib use open.param
    const universalLink = `https://${host}/${open.path}?${queryString}`;
    ```

  - Using pathKey: The pathKey is similar to the key property of the previous Intent, but here the pathKey is used by the client to extract the path information in order to know which page of the APP is being called. This value also needs to be negotiated and agreed upon with your iOS colleagues.
  
    Universal Link Concatenation Rules:

    ```js
    const universalLink = `https://${host}?${pathKey}=${open.path}&${queryString}`;
    ```

### appstore

type: `string`  
required: ✅

The App Store address of the APP, for example: `https://itunes.apple.com/cn/app/id1383186862`.

### yingyongbao

type: `string`  
required: ❎

The address of the APP on Tencent's MyApp，example：`'//a.app.qq.com/o/simple.jsp?pkgname=com.youku.shortvideo'`. If it is not filled in, Android WeChat will directly jump to the fallback.

### isSupportWeibo

type: `boolean`  
required: ❎
default: false

Does it support Weibo? By default, it does not support.

### timeout

type: `number`  
required: ❎  
default: 2000

The time to wait for the app to be launched (in milliseconds); if it times out, it is considered a launch failure.

### fallback

type: `string`  
required: ✅

The URL to redirect to after a failed attempt to launch the app.

### logFunc

type: `function`  
required: ❎

```js
(status: 'pending' | 'failure') => void;
```

The tracking entry function. Operational colleagues may hope that we perform tracking when invoking the app. Pass your tracking function into this, and it will be executed regardless of whether the app launch is successful or not. Of course, you can also use this function for other purposes.

This callback function will be executed twice: the first time when the open method is triggered, and the second time when the app launch fails. It has one parameter, status, which can take two values: `pending` and `failure`, representing the function trigger and the app launch failure, respectively.

### buildScheme

type: `function`  
required: ❎

The URL scheme custom concatenation function. The built-in buildScheme function concatenates according to the URI standard. If your app has special requirements for the URL scheme, you can customize this function. This function has two parameters: `(config, options)`, where config is the object you pass when calling the open method, and options is the object you pass when initializing `callapp-lib`.

## Method

### open

The app launch feature. It accepts an object as a parameter, which supports the following properties:

- path

  type: `string`
  required: ✅

  The value corresponding to the page you want to open, which is the path part of the URL Scheme. Refer to the explanation in the article[ H5 Call Up APP Guide](https://suanmei.github.io/2018/08/23/h5_call_app/).

  If you just want to open the app without navigating to a specific page, you can pass an empty string `''` for the path.

- param

  type: `object`  
  required: ❎

  The parameters required by the app to open a specific page.

- callback
  required: ❎

  type: `function`

  The custom callback function for handling app launch failures. Passing a callback will override the default app launch failure handling logic in the callapp-lib library.

### generateScheme

It accepts an object as a parameter, which contains the following properties:

- path
- param

The properties have the same meanings as the attributes of the `open` method parameters.

Returns the URL Scheme. If you feel that the app launching process of callapp-lib does not meet your requirements, but you do not want to go through the trouble of piecing together the URL Scheme yourself, you can use this method to generate it directly.

### generateIntent

Generates an Intent URL, accepting parameters the same as the `generateScheme` method.

### generateUniversalLink

Generates a Universal Link, accepting parameters the same as the `generateScheme` method.

## 打赏

If this happens to solve your problem, if you're in a good mood, if you have some spare resources, you can reward the author with a cup of coffee, love you~

<img src="https://gw.alicdn.com/imgextra/i3/O1CN01Mqk09Q1HOAWBMvUt2_!!6000000000747-0-tps-1152-1152.jpg" width="240" />
