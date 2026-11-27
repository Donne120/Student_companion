import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { watchForSuspension } from './lib/accountSuspended'
import './index.css'
import './styles/dark-theme.css'

watchForSuspension();

createRoot(document.getElementById("root")!).render(<App />);

// Fade out the loading screen (index.html) once the app has drawn its first
// screen. It stays at least 500 ms so a fast load doesn't flash it, and
// never adds waiting beyond that.
const splash = document.getElementById("sc-splash");
if (splash) {
  // The first open in a browser session plays the whole intro (the book's
  // pages flip and fold into the logo, then the welcome writes in: 3 s).
  // Later loads skip the book (index.html) and wait only 0.9 s.
  let firstVisit = true;
  try {
    firstVisit = !sessionStorage.getItem("sc_splash_seen");
    sessionStorage.setItem("sc_splash_seen", "1");
  } catch {
    /* storage unavailable: treat as a first visit */
  }
  const minimum = firstVisit ? 3000 : 900;
  requestAnimationFrame(() => {
    // performance.now() counts from when the page started opening.
    const wait = Math.max(0, minimum - performance.now());
    setTimeout(() => {
      splash.classList.add("sc-hide");
      document.documentElement.classList.remove("sc-loading");
      setTimeout(() => splash.remove(), 500);
    }, wait);
  });
}
