import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { watchForSuspension } from './lib/accountSuspended'
import './index.css'
import './styles/dark-theme.css'

watchForSuspension();

createRoot(document.getElementById("root")!).render(<App />);
