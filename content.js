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

        const vidsele = [
          'ytd-rich-item-renderer',
          'ytd-video-renderer',
          'ytd-grid-video-renderer'
        ];

        vidsele.forEach(selector => {
          const videlems = document.querySelectorAll(selector);
          
          videlems.forEach(videlem => {
            const titleelems = [
              videlem.querySelector('#video-title'),
              videlem.querySelector('.title'),
              videlem.querySelector('a[title]')
            ];

            const titlee = titleelems.find(el => el);
            
            if (!titlee) return;

            const title = titlee.textContent.toLowerCase();

            const matches = keywords.some(keyword => 
              title.includes(keyword.toLowerCase())
            );

            if (filterMode === 'hide') {
              if (matches) {
                videlem.style.display = 'none';
                videlem.setAttribute('hidden', 'true');
              } else {
                videlem.style.display = '';
                videlem.removeAttribute('hidden');
              }
            } else if (filterMode === 'show') {
              if (matches) {
                videlem.style.display = '';
                videlem.removeAttribute('hidden');
              } else {
                videlem.style.display = 'none';
                videlem.setAttribute('hidden', 'true');
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