chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "toggleRecording") {
    chrome.storage.local.get("recognizing", (data) => {
      chrome.storage.local.set({ recognizing: !data.recognizing });
    });
  }
});