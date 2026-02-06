// Intercept direct navigation to YouTube Shorts, Gaming, and Playables URLs
// and redirect to the blocked page.
browser.webRequest.onBeforeRequest.addListener(
  (details) => {
    return { redirectUrl: browser.runtime.getURL("blocked.html") };
  },
  {
    urls: [
      "*://*.youtube.com/shorts/*",
      "*://*.youtube.com/gaming",
      "*://*.youtube.com/gaming/*",
      "*://*.youtube.com/playables",
      "*://*.youtube.com/playables/*"
    ],
    types: ["main_frame"]
  },
  ["blocking"]
);
