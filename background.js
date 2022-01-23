const SearchIndexURL = 'https://developer.mozilla.org/en-US/search-index.json';
const CacheName = 'mdn';
let TimeoutId = 0;// input debounce timer
let IndexPromise;// a promise resolve to index or null

class SearchIndex {
  static initIndexPromise() {
    return new Promise(async function (resolve) {
      let resp = await caches.match(SearchIndexURL);
      if (resp) {
        resolve(SearchIndex.buildIndex(await resp.json()));
      } else {
        // try to fetch data once
        let success = await SearchIndex.refreshJSON();
        if(success) {
          resp = await caches.match(SearchIndexURL);
          resolve(SearchIndex.buildIndex(await resp.json()));
        } else {
          resolve(null);
        }
      }
    });
  }

  static buildIndex(jsonData) {
    // TODO
    return jsonData;
  }

  static getIndex() {
    // There is always only one IndexPromise
    if (!IndexPromise) {
      IndexPromise = SearchIndex.initIndexPromise();
    }
    return IndexPromise;
  }

  /**
   * fetch MDN search index, save it to cache storage.
   */
  static async refreshJSON() {
    try {
      let resp = await fetch(SearchIndexURL);
      if (resp.ok) { // 200-299
        let cache = await caches.open(CacheName);
        await cache.put(SearchIndexURL, resp);
        return true;// success
      }
      // else: 304 not modified, or other server error like 404, 500
    } catch (e) { // network error
      console.error(e);
    }
    return false;// fail or no new data
  }
}

class Omnibox {
  static onInputStarted() {
    console.log('input start')
    SearchIndex.getIndex(); // pre-warm index
  }

  static onInputChanged(text, suggest) {
    // debounce input
    clearTimeout(TimeoutId);
    TimeoutId = setTimeout(Omnibox.showSuggest, 200, text, suggest);
  }

  static async showSuggest(text, suggest) {
    console.log(`input change: ${text}`)
    const index = await SearchIndex.getIndex();
    if(!index) {
      // TODO: show some tip
      return;
    }
    // TODO: search with index

    // fake results
    let results = [
      {
        content: "Array1",
        description: "<match>Array1</match> <url>https://developer.mozilla.org/en-US/docs</url>"
      },
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
      chrome.tabs.update({ url });
    } else {
      // disposition is "newForegroundTab" or "newBackgroundTab"
      chrome.tabs.create({
        url,
        active: disposition == "newForegroundTab"
      });
    }
  }

  static getResultURL(input) {
    if (input.startsWith('https://developer.mozilla.org/')) {
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
  // SearchIndex.refreshJSON();
  // TODO: setup timer to refresh periodically
}

chrome.omnibox.onInputStarted.addListener(Omnibox.onInputStarted);
chrome.omnibox.onInputChanged.addListener(Omnibox.onInputChanged);
chrome.omnibox.onInputEntered.addListener(Omnibox.onInputEntered);
chrome.runtime.onInstalled.addListener(onInstalled);
