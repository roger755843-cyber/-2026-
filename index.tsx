
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const mountApp = () => {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    // 如果還是找不到，嘗試在下一幀再試一次（處理極端情況）
    console.warn("Root element not found, retrying...");
    setTimeout(mountApp, 10);
    return;
  }

  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log("[系統] React 應用掛載成功");
  } catch (error) {
    console.error("[系統] 掛載失敗:", error);
  }
};

// 確保在 DOM 解析完成後才執行
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountApp);
} else {
  mountApp();
}
