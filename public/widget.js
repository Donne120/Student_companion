/*
 * Student Companion mini chat for partner websites.
 *
 *   <script src="https://chat.studentcompanionai.rw/widget.js" defer
 *           data-label="Ask Student Companion"></script>
 *
 * Adds a round button at the bottom right. Clicking it opens a small window
 * with the chat (the /embed page). Students sign in inside the window with
 * their university email, exactly as on the full app.
 *
 * Optional attributes: data-label (button tooltip and window title),
 * data-color (button colour, default gold), data-position ("left" or "right"),
 * data-context (a word or two about this part of the site, e.g. "admissions",
 * which the assistant uses as a hint).
 *
 * The window is told which page it was opened from (address and title), so
 * "this" or "here" in a question means that page.
 *
 * The partner site must be on the chat site's allowed list (vercel.json,
 * frame-ancestors on /embed), or the browser will refuse to show the window.
 */
(function () {
  if (window.__scWidgetLoaded) return;
  window.__scWidgetLoaded = true;

  var script = document.currentScript;
  var base = (function () {
    try { return new URL(script.src).origin; } catch (e) { return "https://chat.studentcompanionai.rw"; }
  })();
  var label = (script && script.getAttribute("data-label")) || "Ask Student Companion";
  var color = (script && script.getAttribute("data-color")) || "#D4AF37";
  var side = (script && script.getAttribute("data-position")) === "left" ? "left" : "right";
  var context = ((script && script.getAttribute("data-context")) || "").slice(0, 60);

  var css =
    ".scw-btn{position:fixed;bottom:20px;" + side + ":20px;z-index:2147483000;width:60px;height:60px;border-radius:50%;border:0;" +
    "background:" + color + ";color:#1C1B19;box-shadow:0 6px 24px rgba(0,0,0,.18);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:transform .15s}" +
    ".scw-btn:hover{transform:scale(1.05)}.scw-btn:focus-visible{outline:3px solid #1C1B19;outline-offset:3px}" +
    ".scw-btn svg{width:28px;height:28px}" +
    ".scw-panel{position:fixed;bottom:92px;" + side + ":20px;z-index:2147483000;width:400px;height:640px;max-height:calc(100vh - 112px);" +
    "background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 12px 48px rgba(0,0,0,.22);border:1px solid #E5E3DE;display:none}" +
    ".scw-panel.scw-open{display:block}.scw-panel iframe{width:100%;height:100%;border:0;display:block}" +
    // Phones: the window fills the screen and the button becomes a small
    // close button at the top, so it is always possible to get out.
    "@media (max-width:520px){.scw-panel{inset:0;width:100%;height:100%;max-height:none;border-radius:0;border:0}" +
    ".scw-panel.scw-open~.scw-btn{top:8px;bottom:auto;" + side + ":8px;width:40px;height:40px;box-shadow:0 2px 8px rgba(0,0,0,.2)}" +
    ".scw-panel.scw-open~.scw-btn svg{width:20px;height:20px}}";

  var style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  var chatIcon =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
  var closeIcon =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">' +
    '<path d="M18 6 6 18M6 6l12 12"/></svg>';

  var panel = document.createElement("div");
  panel.className = "scw-panel";
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-label", label);

  var btn = document.createElement("button");
  btn.type = "button";
  btn.className = "scw-btn";
  btn.setAttribute("aria-label", label);
  btn.setAttribute("aria-expanded", "false");
  btn.title = label;
  btn.innerHTML = chatIcon;

  var frame = null;
  // Tell the chat which page it is on (sent only to the chat site itself).
  function sendPage() {
    if (!frame || !frame.contentWindow) return;
    frame.contentWindow.postMessage(
      { type: "sc-widget:page", url: location.href, title: document.title, context: context },
      base
    );
  }
  function open() {
    if (!frame) {
      // Loaded on first open only, so the partner page stays fast.
      frame = document.createElement("iframe");
      frame.src = base + "/embed";
      frame.title = label;
      frame.allow = "microphone; clipboard-write";
      frame.addEventListener("load", sendPage);
      panel.appendChild(frame);
    } else {
      sendPage(); // the page may have changed since (single-page sites)
    }
    panel.classList.add("scw-open");
    btn.innerHTML = closeIcon;
    btn.setAttribute("aria-expanded", "true");
  }
  function close() {
    panel.classList.remove("scw-open");
    btn.innerHTML = chatIcon;
    btn.setAttribute("aria-expanded", "false");
    btn.focus();
  }
  btn.addEventListener("click", function () {
    panel.classList.contains("scw-open") ? close() : open();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && panel.classList.contains("scw-open")) close();
  });
  // The window's own close button (on phones the window covers the screen).
  window.addEventListener("message", function (e) {
    if (e.origin !== base || !e.data) return;
    if (e.data.type === "sc-widget:close") close();
    if (e.data.type === "sc-widget:ready") sendPage();
  });

  function mount() {
    document.body.appendChild(panel);
    document.body.appendChild(btn);
  }
  if (document.body) mount();
  else document.addEventListener("DOMContentLoaded", mount);
})();
