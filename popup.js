document.addEventListener('DOMContentLoaded', function() {
  const keywordsTextarea = document.getElementById('keywords');
  const filterModeSelect = document.getElementById('filter-mode');
  const savebtn = document.getElementById('save-btn');
  const statusdiv = document.getElementById('status');

  chrome.storage.sync.get(['detoxifyKeywords', 'filterMode'], function(result) {
    if (result.detoxifyKeywords) {
      keywordsTextarea.value = result.detoxifyKeywords.join('\n');
    }
    if (result.filterMode) {
      filterModeSelect.value = result.filterMode;
    }
  });

  savebtn.addEventListener('click', function() {
    const keywords = keywordsTextarea.value
      .split('\n')
      .map(keyword => keyword.trim())
      .filter(keyword => keyword !== '');

    const filterMode = filterModeSelect.value;

    chrome.storage.sync.set({
      detoxifyKeywords: keywords,
      filterMode: filterMode
    }, function() {
      statusdiv.textContent = 'Keywords and mode saved successfully!';
      setTimeout(() => { statusdiv.textContent = ''; }, 2000);

      try {
        chrome.runtime.sendMessage({action: 'filterVideos'}, (response) => {
          if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
          }
        });
      } catch (err) {
        console.error('Error sending message:', err);
      }
    });
  });
});