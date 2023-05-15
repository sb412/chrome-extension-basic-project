import { getActiveTabURL } from "./utils.js";

// addNewBookmark takes two parameters: bookmarks and bookmark. 
// The bookmarks parameter represents a DOM element where new bookmarks will be appended to, and the bookmark parameter 
// represents an object that contains information about the bookmark being added.

// The function creates three new DOM elements using document.createElement: bookmarkTitleElement, controlsElement, 
// and newBookmarkElement. bookmarkTitleElement is a div element that will contain the title of the bookmark,
//  controlsElement is a div element that will contain the play and delete buttons for the bookmark, 
//  and newBookmarkElement is a div element that will contain both the bookmarkTitleElement and controlsElement.

// The desc property of the bookmark object is used to set the text content of bookmarkTitleElement, 
// and the className property is set to "bookmark-title". The className property of controlsElement 
// is set to "bookmark-controls".

// The setBookmarkAttributes function is called twice to add a "play" button and a "delete" button to controlsElement.

// The setAttribute() method sets a new value to an attribute. If the attribute does not exist, it is created first.

// newBookmarkElement is given an ID that includes the time property of the bookmark object, 
// a className of "bookmark", and an attribute of timestamp that is set to the time property of the bookmark object.

// Finally, bookmarkTitleElement and controlsElement are appended to newBookmarkElement, 
// and newBookmarkElement is appended to the bookmarks parameter, which is assumed to be a DOM element.

const addNewBookmark = (bookmarks, bookmark) => {
  const bookmarkTitleElement = document.createElement("div");
  const controlsElement = document.createElement("div");
  const newBookmarkElement = document.createElement("div");

  bookmarkTitleElement.textContent = bookmark.desc;
  bookmarkTitleElement.className = "bookmark-title";
  controlsElement.className = "bookmark-controls";

  setBookmarkAttributes("play", onPlay, controlsElement);
  setBookmarkAttributes("delete", onDelete, controlsElement);

  newBookmarkElement.id = "bookmark-" + bookmark.time;
  newBookmarkElement.className = "bookmark";
  newBookmarkElement.setAttribute("timestamp", bookmark.time);

  newBookmarkElement.appendChild(bookmarkTitleElement);
  newBookmarkElement.appendChild(controlsElement);
  bookmarks.appendChild(newBookmarkElement);
};

const viewBookmarks = (currentBookmarks=[]) => {
  // reference of element with id bookmarks
  const bookmarksElement = document.getElementById("bookmarks");
  bookmarksElement.innerHTML = "";

  if (currentBookmarks.length > 0) {
    for (let i = 0; i < currentBookmarks.length; i++) {
      const bookmark = currentBookmarks[i];
      addNewBookmark(bookmarksElement, bookmark);
    }
  } else {
    bookmarksElement.innerHTML = '<i class="row">No bookmarks to show</i>';
  }

  return;
};

//async event listener function
//get the timestamp attribute of parent element that fired this event
//and then sends msg to the content script of active tab using chrome ext API chrome.tabs.sendMessage method

const onPlay = async e => {
  const bookmarkTime = e.target.parentNode.parentNode.getAttribute("timestamp");
  const activeTab = await getActiveTabURL();

  chrome.tabs.sendMessage(activeTab.id, {
    type: "PLAY",
    value: bookmarkTime,
  });
};

const onDelete = async e => {
  const activeTab = await getActiveTabURL();
  const bookmarkTime = e.target.parentNode.parentNode.getAttribute("timestamp");
  const bookmarkElementToDelete = document.getElementById(
    "bookmark-" + bookmarkTime
  );

  bookmarkElementToDelete.parentNode.removeChild(bookmarkElementToDelete);

  chrome.tabs.sendMessage(activeTab.id, {
    type: "DELETE",
    value: bookmarkTime,
  }, viewBookmarks);
};


const setBookmarkAttributes =  (src, eventListener, controlParentElement) => {
  const controlElement = document.createElement("img");

  controlElement.src = "assets/" + src + ".png";
  controlElement.title = src;
  controlElement.addEventListener("click", eventListener);
  controlParentElement.appendChild(controlElement);
};

// Listen for the DOMContentLoaded event, which is fired when the initial HTML document has been completely loaded and parsed.
// Call the getActiveTabURL function asynchronously to retrieve the URL of the active tab in the current window.
// Extract the query parameters from the active tab's URL using the split method and URLSearchParams constructor.
// Retrieve the value of the v parameter from the query parameters using the get method.
// Check if the active tab's URL contains "youtube.com/watch" and the v parameter is present.
// If the above conditions are true, retrieve any bookmarks data for the current video from the chrome.storage.sync storage using chrome.storage.sync.get method.
// Parse the retrieved bookmarks data into an array and display them on the page using the viewBookmarks function.
// If the active tab's URL does not contain "youtube.com/watch" or the v parameter is not present, display an error message on the page.

document.addEventListener("DOMContentLoaded", async () => {
  const activeTab = await getActiveTabURL();
  const queryParameters = activeTab.url.split("?")[1];
  const urlParameters = new URLSearchParams(queryParameters);

  const currentVideo = urlParameters.get("v");

  if (activeTab.url.includes("youtube.com/watch") && currentVideo) {
    chrome.storage.sync.get([currentVideo], (data) => {
      const currentVideoBookmarks = data[currentVideo] ? JSON.parse(data[currentVideo]) : [];

      viewBookmarks(currentVideoBookmarks);
    });
  } else {
    const container = document.getElementsByClassName("container")[0];

    container.innerHTML = '<div class="title">This is not a youtube video page.</div>';
  }
});