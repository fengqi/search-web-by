// 监听扩展安装事件
chrome.runtime.onInstalled.addListener(function() {
  // 设置默认配置
  chrome.storage.sync.set({
    enabledSites: ['jd', 'taobao', 'xianyu', 'google'],
    ignoredUrls: []
  });
  
  console.log('Text Search Assistant installed and default settings applied.');
});

// 监听扩展启动事件
chrome.runtime.onStartup.addListener(function() {
  console.log('Text Search Assistant started.');
});