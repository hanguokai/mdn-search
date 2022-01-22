const SearchIndexURL = 'https://developer.mozilla.org/en-US/search-index.json';
const CacheName = 'mdn';

class SearchIndex {
  static async refresh() {
    try {
      let resp = await fetch(SearchIndexURL);
      if (resp.ok) {
        let cache = await caches.open(CacheName);
        await cache.put(SearchIndexURL, resp);
        return true;// success
      }
      // else: 304 not modified, or other error
    } catch (e) {
      console.error(e);
    }
    return false;// fail
  }

  static async getJSON() {
    let resp = await caches.match(SearchIndexURL);
    if (resp) {
      return await resp.json();
    } else {

    }
  }
}

class Omnibox {
  static onInputStarted() {
    console.log('input start')
  }
  static onInputChanged(text, suggest) {
    console.log(`input change: ${text}`)
  }

  /**
   * user input enter/cmd+enter, search text
   */
  static onInputEntered(text, disposition) {
    // console.log(`input enter: ${text}`)
    text = text.trim();
    if (!text) {
      return;
    }

    // MDN search template: https://developer.mozilla.org/search?q={searchTerms}
    const search = new URL('https://developer.mozilla.org/search');
    search.searchParams.append('q', text);
    const url = search.toString();

    if (disposition == "currentTab") {
      chrome.tabs.update({url});
    } else {
      // disposition is "newForegroundTab" or "newBackgroundTab"
      chrome.tabs.create({
        url,
        active: disposition == "newForegroundTab"
      });
    }
  }
}

function onInstalled() {
  // first install or update
  // SearchIndex.refresh();
  // TODO: setup timer to refresh periodically
}

chrome.omnibox.onInputStarted.addListener(Omnibox.onInputStarted);
chrome.omnibox.onInputChanged.addListener(Omnibox.onInputChanged);
chrome.omnibox.onInputEntered.addListener(Omnibox.onInputEntered);
chrome.runtime.onInstalled.addListener(onInstalled);
