let searchBox = null;
let selectedText = '';

// 检查文本是否包含网址
function containsUrl(text) {
  // 去除首尾空格
  text = text.trim();
  
  // 检查是否包含典型的网址模式
  const urlPatterns = [
    /https?:\/\/[^\s]+/i,           // http:// 或 https:// 开头的网址
    /www\.[^\s]+\.[^\s]+/i,         // www. 开头的网址
    /[^\s]+\.(com|org|net|edu|gov|mil|int|cn|uk|de|fr|jp|au|ca|ru|info|biz|io)[^\s]*/i  // 包含常见顶级域名的文本
  ];
  
  return urlPatterns.some(pattern => pattern.test(text));
}

// 检查是否为邮箱地址
function isEmail(text) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(text.trim());
}

// 检查是否为纯数字
function isPureNumber(text) {
  const numberPattern = /^\d+$/;
  return numberPattern.test(text.trim());
}

// 检查是否应该显示搜索框
function shouldShowSearchBox(text) {
  // 空文本不显示
  if (!text || text.trim().length === 0) {
    return false;
  }
  
  // 单个字符不显示
  if (text.trim().length <= 1) {
    return false;
  }
  
  // 包含网址不显示
  if (containsUrl(text)) {
    return false;
  }
  
  // 邮箱地址不显示
  if (isEmail(text)) {
    return false;
  }
  
  // 纯数字不显示
  if (isPureNumber(text)) {
    return false;
  }
  
  // 包含过多特殊符号的文本不显示
  const specialCharCount = (text.match(/[!@#$%^&*(),.?":{}|<>]/g) || []).length;
  if (specialCharCount > Math.floor(text.length / 3)) {
    return false;
  }
  
  return true;
}

// 创建搜索框元素
function createSearchBox() {
  if (searchBox) {
    document.body.removeChild(searchBox);
  }

  searchBox = document.createElement('div');
  searchBox.id = 'text-search-assistant-box';
  searchBox.className = 'text-search-assistant-box';
  
  // 加载配置并创建图标
  chrome.storage.sync.get({
    enabledSites: ['jd', 'taobao', 'xianyu', 'google'],
    ignoredUrls: []
  }, function(items) {
    const ignored = items.ignoredUrls.some(url => 
      window.location.href.includes(url));
    
    if (ignored) return;
    
    createIcons(searchBox, items.enabledSites);
  });

  document.body.appendChild(searchBox);
}

// 根据启用的站点创建图标
function createIcons(container, enabledSites) {
  const sites = {
    'jd': {
      name: '京东',
      url: 'https://search.jd.com/Search?keyword=',
      icon: chrome.runtime.getURL('icons/jd.png')
    },
    'taobao': {
      name: '淘宝',
      url: 'https://s.taobao.com/search?q=',
      icon: chrome.runtime.getURL('icons/taobao.png')
    },
    'xianyu': {
      name: '闲鱼',
      url: 'https://s.2.taobao.com/list/list.htm?keyword=',
      icon: chrome.runtime.getURL('icons/xianyu.png')
    },
    'google': {
      name: 'Google',
      url: 'https://www.google.com/search?q=',
      icon: chrome.runtime.getURL('icons/google.png')
    }
  };

  enabledSites.forEach(site => {
    if (sites[site]) {
      const icon = document.createElement('img');
      icon.src = sites[site].icon;
      icon.title = `在${sites[site].name}中搜索`;
      icon.className = 'text-search-assistant-icon';
      icon.dataset.url = sites[site].url;
      
      icon.addEventListener('error', function() {
        // 如果图标加载失败，使用emoji作为备选方案
        icon.style.display = 'none';
        const emoji = document.createElement('span');
        emoji.className = 'text-search-assistant-emoji';
        emoji.textContent = getEmojiForSite(site);
        emoji.title = `在${sites[site].name}中搜索`;
        emoji.dataset.url = sites[site].url;
        emoji.addEventListener('click', () => {
          window.open(sites[site].url + encodeURIComponent(selectedText), '_blank');
        });
        container.appendChild(emoji);
      });
      
      icon.addEventListener('click', () => {
        window.open(sites[site].url + encodeURIComponent(selectedText), '_blank');
      });
      
      container.appendChild(icon);
    }
  });
}

// 为不同网站返回对应的emoji
function getEmojiForSite(site) {
  switch(site) {
    case 'jd':
      return '🐶'; // 京东 - 狗狗
    case 'taobao':
      return '🎁'; // 淘宝 - 礼物
    case 'xianyu':
      return '🐠'; // 闲鱼 - 鱼
    case 'google':
      return '🔍'; // Google - 搜索
    default:
      return '🛒'; // 默认购物车
  }
}

// 显示搜索框
function showSearchBox(x, y) {
  if (!searchBox) return;
  
  searchBox.style.display = 'flex';
  
  // 计算文本选择的位置
  const rect = {
    left: x,
    top: y,
    width: 0,
    height: 0
  };
  
  // 判断应该横向还是纵向排列
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  
  // 如果右边空间足够，横向排列
  if (windowWidth - rect.left > 150) {
    searchBox.className = 'text-search-assistant-box horizontal';
    searchBox.style.left = (rect.left + 10) + 'px';
    searchBox.style.top = (rect.top - 25) + 'px';
  } 
  // 否则纵向排列
  else {
    searchBox.className = 'text-search-assistant-box vertical';
    searchBox.style.left = (rect.left + 10) + 'px';
    searchBox.style.top = (rect.top - 25) + 'px';
  }
}

// 隐藏搜索框
function hideSearchBox() {
  if (searchBox) {
    searchBox.style.display = 'none';
  }
}

// 监听鼠标释放事件（文本选择完成）
document.addEventListener('mouseup', function(e) {
  setTimeout(() => {
    const selection = window.getSelection();
    if (shouldShowSearchBox(selection.toString())) {
      selectedText = selection.toString().trim();
      createSearchBox();
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      showSearchBox(rect.right, rect.top);
    } else {
      hideSearchBox();
    }
  }, 10);
});

// 点击其他地方隐藏搜索框
document.addEventListener('mousedown', function(e) {
  if (searchBox && !searchBox.contains(e.target)) {
    hideSearchBox();
  }
});

// 监听窗口大小变化
window.addEventListener('resize', function() {
  hideSearchBox();
});