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
  // into the logo, then "Welcome to Student Companion AI" writes in (done
  // at about 5.2 s) and stays about 1.6 s so it can be read: 6.8 s in all.
  const minimum = 6800;
  const hide = () => {
    if (!splash.isConnected) return;
    splash.classList.add("sc-hide");
    document.documentElement.classList.remove("sc-loading");
    setTimeout(() => splash.remove(), 600);
  };
  requestAnimationFrame(() => {
    // performance.now() counts from when the page started opening.
    const wait = Math.max(0, minimum - performance.now());
    setTimeout(hide, wait);
  });
}
