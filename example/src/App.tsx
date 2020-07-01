import React from 'react';
import CallApp from 'callapp-lib';
import './App.css';

const option = {
  scheme: {
    protocol: 'youku',
  },
  intent: {
    package: 'com.youku.phone',
    scheme: 'youku',
  },
  universal: {
    host: 'acz-jump.youku.com/wow/ykpage/act/ulink',
    pathKey: 'action',
  },
  appstore: 'https://itunes.apple.com/cn/app/id336141475',
  yingyongbao: '//a.app.qq.com/o/simple.jsp?pkgname=com.youku.phone',
  fallback: 'https://hudong.vip.youku.com/act/download.html',
  timeout: 2000,
};

const lib = new CallApp(option);

function App() {
  return (
    <div className="App">
      <button
        onClick={() => {
          lib.open({ path: '' });
        }}
      >
        点击唤端
      </button>
    </div>
  );
}

export default App;
