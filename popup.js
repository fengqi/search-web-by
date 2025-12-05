document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('settingsButton').addEventListener('click', function() {
    chrome.runtime.openOptionsPage();
  });
});