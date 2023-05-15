(() => {
    let youtubeLeftControls, youtubePlayer;
    let currentVideo = "";
    let currentVideoBookmarks = [];
  

  // The function retrieves data from Chrome's sync storage API using the chrome.storage.sync.get() method. 
  // The data is retrieved based on the value of the currentVideo variable, which is presumably a key for the data stored 
  // in sync storage.

  // The callback function passed to chrome.storage.sync.get() checks whether the obj[currentVideo] value exists, 
  // and if so, it parses it from a stringified JSON object using JSON.parse(). 
  // The parsed object is then resolved as the value of the Promise. If obj[currentVideo] does not exist, 
  // an empty array is resolved as the value of the Promise.

    const fetchBookmarks = () => {
      return new Promise((resolve) => {
        chrome.storage.sync.get([currentVideo], (obj) => {
          resolve(obj[currentVideo] ? JSON.parse(obj[currentVideo]) : []);
        });
      });
    };
  
    const addNewBookmarkEventHandler = async () => {
      const currentTime = youtubePlayer.currentTime;
      const newBookmark = {
        time: currentTime,
        desc: "Bookmark at " + getTime(currentTime),
      };
  
      currentVideoBookmarks = await fetchBookmarks();
  
      chrome.storage.sync.set({
        [currentVideo]: JSON.stringify([...currentVideoBookmarks, newBookmark].sort((a, b) => a.time - b.time))
      });
    };
  
    // create a bookmark and attach an event listener to it
    const newVideoLoaded = async () => {
      const bookmarkBtnExists = document.getElementsByClassName("bookmark-btn")[0];
  
      currentVideoBookmarks = await fetchBookmarks();
  
      if (!bookmarkBtnExists) {
        const bookmarkBtn = document.createElement("img");
  
        bookmarkBtn.src = chrome.runtime.getURL("assets/bookmark.png");
        bookmarkBtn.className = "ytp-button " + "bookmark-btn";
        bookmarkBtn.title = "Click to bookmark current timestamp";
  
        youtubeLeftControls = document.getElementsByClassName("ytp-left-controls")[0];
        youtubePlayer = document.getElementsByClassName('video-stream')[0];
  
        youtubeLeftControls.appendChild(bookmarkBtn);
        bookmarkBtn.addEventListener("click", addNewBookmarkEventHandler);
      }
    };
  
    chrome.runtime.onMessage.addListener((obj, sender, response) => {
      const { type, value, videoId } = obj;
  
      if (type === "NEW") {
        currentVideo = videoId;
        newVideoLoaded();
      } else if (type === "PLAY") {
        youtubePlayer.currentTime = value;
      } else if ( type === "DELETE") {
        currentVideoBookmarks = currentVideoBookmarks.filter((b) => b.time != value);
        chrome.storage.sync.set({ [currentVideo]: JSON.stringify(currentVideoBookmarks) });
  
        response(currentVideoBookmarks);
      }
    });
  
    newVideoLoaded();
  })();
  
  //Formatting time in hours : mins : secs 

  const getTime = t => {
    var date = new Date(0);
    date.setSeconds(t);
  
    return date.toISOString().substr(11, 8);
  };