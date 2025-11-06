import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { auth, db } from "./integrations/firebase/client";
import "./utils/manualNotificationTest"; // Make test function available globally
import "./utils/updateUserRole"; // Make user role update function available globally
import "./utils/updateUserToSeniorManagement"; // Make update user to senior management function available globally
import "./utils/assignSeniorManagementToTeam"; // Make assign senior management to team function available globally
import "./utils/createSeniorManagementTeam"; // Make create senior management team function available globally

// Make Firebase available globally for debugging
(window as any).auth = auth;
(window as any).db = db;

createRoot(document.getElementById("root")!).render(<App />);
