const SearchIndexURL = 'https://developer.mozilla.org/en-US/search-index.json';
const CacheName = 'mdn';
let TimeoutId = 0;

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
    // debounce input
    clearTimeout(TimeoutId);
    TimeoutId = setTimeout(Omnibox.showSuggest, 200, text, suggest);
  }

  static showSuggest(text, suggest) {
    console.log(`input change: ${text}`)
    // fake result
    let results = [
      {content: "https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/omnibox",
      description: "<match>Array</match> <url>https://developer.mozilla.org/en-US/docs</url>"},
    ];
    suggest(results);
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

    const url = Omnibox.getResultURL(text);

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

  static getResultURL(input) {
    if(input.startsWith('https://developer.mozilla.org/')) {
      return input;
    } else {
      // MDN search template: https://developer.mozilla.org/search?q={searchTerms}
      const url = new URL('https://developer.mozilla.org/search');
      url.searchParams.append('q', input);
      return url.toString();
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
