document.addEventListener('DOMContentLoaded', function() {
  const keywordsTextarea = document.getElementById('keywords');
  const filterModeSelect = document.getElementById('filter-mode');
  const saveButton = document.getElementById('save-btn');
  const statusDiv = document.getElementById('status');

  chrome.storage.sync.get(['detoxifyKeywords', 'filterMode'], function(result) {
    if (result.detoxifyKeywords) {
      keywordsTextarea.value = result.detoxifyKeywords.join('\n');
    }
    if (result.filterMode) {
      filterModeSelect.value = result.filterMode;
    }
  });

  saveButton.addEventListener('click', function() {
    const keywords = keywordsTextarea.value
      .split('\n')
      .map(keyword => keyword.trim())
      .filter(keyword => keyword !== '');

    const filterMode = filterModeSelect.value;

    chrome.storage.sync.set({
      detoxifyKeywords: keywords,
      filterMode: filterMode
    }, function() {
      statusDiv.textContent = 'Keywords and mode saved successfully!';
      setTimeout(() => { statusDiv.textContent = ''; }, 2000);

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