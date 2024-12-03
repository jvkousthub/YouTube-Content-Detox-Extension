chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({
    detoxifyKeywords: [],
    filterMode: 'hide'
  });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'filterVideos') {
    try {
      chrome.tabs.query({url: '*://www.youtube.com/*'}, (tabs) => {
        tabs.forEach(tab => {
          try {
            chrome.tabs.sendMessage(tab.id, {action: 'reload'});
          } catch (err) {
            console.error('Error sending message to tab:', err);
          }
        });
      });
    } catch (err) {
      console.error('Error in filterVideos handler:', err);
    }
  }

  return true;
});