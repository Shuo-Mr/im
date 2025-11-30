
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import AppRouter from './router/AppRouter';
import './index.less';
import './index/global_mobile.less';
import './appearance-theme.less';
import 'antd/dist/antd.css';


import *  as serviceWorker from './registerServiceWorker';
import { ErrorBoundary } from './component/errorView/ErrorView';
// import 'react-devtools'
import * as mobx from 'mobx';





// mobx.configure({  enforceActions: "strict" ,
mobx.configure({
  computedRequiresReaction: true,
  isolateGlobalState: true,
  disableErrorBoundaries: true
})
function renderDevTool() {

  // if (process.env.NODE_ENV !== "production") {


  //   const DevTools = require("mobx-react-devtools").default;

  //   return <DevTools />;

  // } else {
  //   return null
  // }

}


ReactDOM.render(
  <ErrorBoundary>
    <AppRouter />
    {renderDevTool()}
  </ErrorBoundary>
  ,
  document.getElementById('root') as HTMLElement
);
// registerServiceWorker();
serviceWorker.unregister();

