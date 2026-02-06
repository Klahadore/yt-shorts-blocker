// === YouTube Shorts & Games Blocker - Content Script ===
// Handles two responsibilities:
// 1. Detect SPA navigations to blocked pages and redirect.
// 2. Hide Shorts and Gaming sections from the homepage and search results.

const BLOCKED_PAGE_URL = browser.runtime.getURL("blocked.html");

// Paths that should be blocked.
const BLOCKED_PATHS = ["/shorts/", "/gaming", "/playables"];

// --- 1. SPA Navigation Blocking ---

function checkAndBlock() {
  const path = window.location.pathname;
  if (BLOCKED_PATHS.some((p) => path.startsWith(p))) {
    window.location.href = BLOCKED_PAGE_URL;
  }
}

// YouTube fires a custom event after SPA navigations complete.
document.addEventListener("yt-navigate-finish", checkAndBlock);

// Also check on initial load (in case content script loads on a blocked page
// that wasn't caught by the background webRequest listener).
checkAndBlock();

// --- 2. Hide Shorts & Gaming Shelves ---

// Selectors for Shorts and Gaming elements that should be hidden.
const HIDE_SELECTORS = [
  // Shorts shelf on homepage and search results
  "ytd-reel-shelf-renderer",
  // Alternative Shorts shelf variant
  "ytd-rich-shelf-renderer[is-shorts]",
  // Shorts tab in the sidebar/guide
  "ytd-guide-entry-renderer a[title='Shorts']",
  "ytd-mini-guide-entry-renderer a[title='Shorts']",
  // Gaming tab in the sidebar/guide
  "ytd-guide-entry-renderer a[title='Gaming']",
  "ytd-mini-guide-entry-renderer a[title='Gaming']",
  // Playables tab in the sidebar/guide
  "ytd-guide-entry-renderer a[title='Playables']",
  "ytd-mini-guide-entry-renderer a[title='Playables']",
  // Shorts chips/badges in navigation
  "yt-chip-cloud-chip-renderer:has(yt-formatted-string[title='Shorts'])",
  // Gaming chips/badges in navigation
  "yt-chip-cloud-chip-renderer:has(yt-formatted-string[title='Gaming'])",
  // Shorts in search results (inline shorts)
  "ytd-video-renderer:has(a[href*='/shorts/'])",
  // Shorts badge overlays
  "ytd-thumbnail-overlay-time-status-renderer[overlay-style='SHORTS']",
  // Gaming shelf on homepage
  "ytd-rich-shelf-renderer:has(a[href*='/gaming'])",
  // Playables shelf on homepage
  "ytd-rich-shelf-renderer:has(a[href*='/playables'])",
].join(", ");

// Containers to walk up to when hiding matched elements.
const CONTAINER_SELECTORS = [
  "ytd-reel-shelf-renderer",
  "ytd-rich-shelf-renderer",
  "ytd-guide-entry-renderer",
  "ytd-mini-guide-entry-renderer",
  "ytd-video-renderer",
  "yt-chip-cloud-chip-renderer",
].join(", ");

function hideBlockedElements() {
  const elements = document.querySelectorAll(HIDE_SELECTORS);
  for (const el of elements) {
    // Walk up to the nearest meaningful container to hide the full section.
    const target = el.closest(CONTAINER_SELECTORS) || el;
    target.style.display = "none";
  }
}

// Run once immediately.
hideBlockedElements();

// Use a MutationObserver to hide elements as YouTube dynamically loads content.
const observer = new MutationObserver(() => {
  hideBlockedElements();
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});

// Also re-check after SPA navigations.
document.addEventListener("yt-navigate-finish", hideBlockedElements);
