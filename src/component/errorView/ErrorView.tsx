
import React from 'react'
// import * as Sentry from '@sentry/browser';
// import ipcRender from '../../ipcRender';

export class ErrorBoundary extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    // Sentry.init({dsn: "https://4a599367d6fd454c96b0769a78defbcd@sentry.io/5011945"});
}
  state = { hasError: '' };
  static getDerivedStateFromError(error: any) {
    return { hasError: error.toString() };
  }
  componentDidCatch(error: any, info: any) {
    // ipcRender.ipcRenderer && ipcRender.ipcRenderer.send('force-close', error)
  }
  render() {
    return this.state.hasError ? (
      <div style={{ marginTop: '24px', textAlign: 'center' }}>
        <span>警告! 界面渲染出了点问题:<br />{this.state.hasError}</span>
      </div>
    ) : this.props.children;
  }
}
ErrorBoundary.getDerivedStateFromError = (error) => ({ hasError: error.toString() });