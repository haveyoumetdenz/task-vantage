import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { auth, db } from "./integrations/firebase/client";
import "./utils/manualNotificationTest"; // Make test function available globally

// Make Firebase available globally for debugging
(window as any).auth = auth;
(window as any).db = db;

createRoot(document.getElementById("root")!).render(<App />);
