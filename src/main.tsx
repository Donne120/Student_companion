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
  // Every page load plays the whole intro: the book's pages flip and fold
  // into the logo, then the welcome writes in (4.8 s). A tap or click
  // skips it; the app is already drawn underneath.
  const minimum = 4800;
  const hide = () => {
    if (!splash.isConnected) return;
    splash.classList.add("sc-hide");
    document.documentElement.classList.remove("sc-loading");
    setTimeout(() => splash.remove(), 600);
  };
  splash.addEventListener("click", hide);
  requestAnimationFrame(() => {
    // performance.now() counts from when the page started opening.
    const wait = Math.max(0, minimum - performance.now());
    setTimeout(hide, wait);
  });
}
