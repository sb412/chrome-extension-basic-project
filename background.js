// an event listener using the chrome.tabs.onUpdated API in a Google Chrome extension.

// When a tab is updated, the event listener checks if the tab's URL contains the string "youtube.com/watch". 
//If it does, the code extracts the query parameters from the URL using tab.url.split("?")[1] and new URLSearchParams(),
// and then sends a message to the content script of the tab using chrome.tabs.sendMessage().

// The message contains a type of "NEW" and the video ID extracted from the URL parameters using urlParameters.get("v").



chrome.tabs.onUpdated.addListener((tabId, tab) => {
    if (tab.url && tab.url.includes("youtube.com/watch")) {
      const queryParameters = tab.url.split("?")[1];
      const urlParameters = new URLSearchParams(queryParameters);
  
      chrome.tabs.sendMessage(tabId, {
        type: "NEW",
        videoId: urlParameters.get("v"),
      });
    }
  });