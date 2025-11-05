// RetryManager.ts
class RetryManager {
  private retryStore: Map<string, { count: number; isRetry: boolean }>;

  constructor() {
    this.retryStore = new Map();
  }

  // 生成请求的唯一标识
  generateRequestId(config: any): string {
    const { method = 'get', url = '', params = {}, data = {} } = config;
    try {
      const u = new URL(url)
      return `${method}-${u.pathname}-${JSON.stringify(params)}-${JSON.stringify(data)}`;
    } catch {
      return `${method}-${url}-${JSON.stringify(params)}-${JSON.stringify(data)}`;
    }
  }

  // 初始化请求记录
  initializeRequest(requestId: string): void {
    this.retryStore.set(requestId, { count: 0, isRetry: false });
  }

  // 标记为重试请求并增加计数
  markAsRetry(requestId: string): void {
    const current = this.retryStore.get(requestId);
    if (current) {
      current.count += 1;
      current.isRetry = true;
      this.retryStore.set(requestId, current);
    }
  }

  // 获取当前重试状态
  getRetryState(requestId: string): { count: number; isRetry: boolean } | undefined {
    return this.retryStore.get(requestId);
  }

  // 清理请求记录
  clearRequest(requestId: string): void {
    this.retryStore.delete(requestId);
  }

  // 判断是否应该重试
  shouldRetry(error: any): boolean {
    const { config, code, response } = error;

    if (!config.retry) return false;

    // 只在网络错误或服务器错误时重试
    return !response ||
      code === 'ECONNABORTED' ||
      code === 'NETWORK_ERROR' ||
      (response.status >= 500 && response.status < 600);
  }
}

export default RetryManager