// 默认设置
const DEFAULT_SETTINGS = {
  enabledSites: ['jd', 'taobao', 'xianyu', 'google'],
  ignoredUrls: []
};

// 页面加载完成后恢复设置
document.addEventListener('DOMContentLoaded', function() {
  // 恢复启用的站点设置
  chrome.storage.sync.get(DEFAULT_SETTINGS, function(items) {
    // 设置启用的站点
    items.enabledSites.forEach(function(site) {
      const checkbox = document.getElementById(site);
      if (checkbox) {
        checkbox.checked = true;
      }
    });
    
    // 设置忽略的网址
    const container = document.getElementById('ignoredUrlsContainer');
    items.ignoredUrls.forEach(function(url, index) {
      addIgnoredUrlInput(url, index);
    });
  });
});

// 保存设置
document.getElementById('save').addEventListener('click', function() {
  // 获取启用的站点
  const enabledSites = [];
  document.querySelectorAll('input[name="sites"]:checked').forEach(function(checkbox) {
    enabledSites.push(checkbox.value);
  });
  
  // 获取忽略的网址
  const ignoredUrls = [];
  document.querySelectorAll('.ignored-url-input').forEach(function(input) {
    if (input.value.trim()) {
      ignoredUrls.push(input.value.trim());
    }
  });
  
  // 保存到存储
  chrome.storage.sync.set({
    enabledSites: enabledSites,
    ignoredUrls: ignoredUrls
  }, function() {
    // 显示状态信息
    const status = document.getElementById('status');
    status.textContent = '设置已保存';
    setTimeout(function() {
      status.textContent = '';
    }, 2000);
  });
});

// 添加忽略网址输入框
document.getElementById('addUrl').addEventListener('click', function() {
  const container = document.getElementById('ignoredUrlsContainer');
  const index = container.children.length;
  addIgnoredUrlInput('', index);
});

// 创建忽略网址输入框
function addIgnoredUrlInput(value, index) {
  const container = document.getElementById('ignoredUrlsContainer');
  
  const div = document.createElement('div');
  div.className = 'ignored-url';
  
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'ignored-url-input';
  input.placeholder = '例如：example.com';
  input.value = value;
  
  const button = document.createElement('button');
  button.textContent = '删除';
  button.addEventListener('click', function() {
    container.removeChild(div);
  });
  
  div.appendChild(input);
  div.appendChild(button);
  container.appendChild(div);
}