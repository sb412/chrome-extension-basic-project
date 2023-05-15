// The code is defining an asynchronous function called getActiveTabURL() that uses the Chrome API 
// to retrieve information about the currently active tab in the currently focused Chrome window.


export async function getActiveTabURL() {
    const tabs = await chrome.tabs.query({
        currentWindow: true,
        active: true
    });
   
    return tabs[0];
}