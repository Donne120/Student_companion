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
  requestAnimationFrame(() => {
    // performance.now() counts from when the page started opening.
    const wait = Math.max(0, 500 - performance.now());
    setTimeout(() => {
      splash.classList.add("sc-hide");
      document.documentElement.classList.remove("sc-loading");
      setTimeout(() => splash.remove(), 500);
    }, wait);
  });
}
