(function() {
  function safeLog(message) {
    try {
      console.log('[YouTube Feed Detoxify]', message);
    } catch {}
  }

  function filterVideos() {
    try {
      chrome.storage.sync.get(['detoxifyKeywords', 'filterMode'], function(result) {
        const keywords = result.detoxifyKeywords || [];
        const filterMode = result.filterMode || 'hide';
        
        if (keywords.length === 0) return;

        const videoSelectors = [
          'ytd-rich-item-renderer',
          'ytd-video-renderer',
          'ytd-grid-video-renderer'
        ];

        videoSelectors.forEach(selector => {
          const videoElements = document.querySelectorAll(selector);
          
          videoElements.forEach(videoElement => {
            const titleElements = [
              videoElement.querySelector('#video-title'),
              videoElement.querySelector('.title'),
              videoElement.querySelector('a[title]')
            ];

            const titleElement = titleElements.find(el => el);
            
            if (!titleElement) return;

            const title = titleElement.textContent.toLowerCase();

            const matchesKeywords = keywords.some(keyword => 
              title.includes(keyword.toLowerCase())
            );

            if (filterMode === 'hide') {
              if (matchesKeywords) {
                videoElement.style.display = 'none';
                videoElement.setAttribute('hidden', 'true');
              } else {
                videoElement.style.display = '';
                videoElement.removeAttribute('hidden');
              }
            } else if (filterMode === 'show') {
              if (matchesKeywords) {
                videoElement.style.display = '';
                videoElement.removeAttribute('hidden');
              } else {
                videoElement.style.display = 'none';
                videoElement.setAttribute('hidden', 'true');
              }
            }
          });
        });
      });
    } catch (err) {
      console.error('Error in filterVideos:', err);
    }
  }

  function initializeFilter() {
    filterVideos();

    const observer = new MutationObserver(() => {
      clearTimeout(window.filterTimeout);
      window.filterTimeout = setTimeout(filterVideos, 1000);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    chrome.runtime.onMessage.addListener((request) => {
      if (request.action === 'reload') {
        filterVideos();
      }
    });
  }

  if (document.readyState === 'complete') {
    initializeFilter();
  } else {
    window.addEventListener('load', initializeFilter);
  }
})();