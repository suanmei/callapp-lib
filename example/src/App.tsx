import React from 'react';
import CallApp from 'callapp-lib';
import './App.css';

const option = {
  scheme: {
    protocol: 'ykshortvideo',
  },
  outChain: {
    protocol: 'ykshortvideo',
    path: 'temporary',
    key: 'url',
  },
  intent: {
    package: 'com.youku.shortvideo',
    scheme: 'ykshortvideo',
  },
  universal: {
    host: 'flash-link.youku.com',
    pathKey: 'action',
  },
  appstore: 'https://itunes.apple.com/cn/app/id1383186862',
  yingyongbao: '//a.app.qq.com/o/simple.jsp?pkgname=com.youku.shortvideo',
  fallback: 'https://dianliu.youku.com/service/download',
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
