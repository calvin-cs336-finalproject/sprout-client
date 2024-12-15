// Imports from react
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// Imports from our components folder
import AuthPage from "./pages/AuthPage.js";
import MainApp from "./pages/MainPage.js";
import AuthGuard from "./guards/AuthGuard.js";

// Our main app component
function App() {
  return (
    // Router component to handle routing from pages
    <Router className="router">
      <Routes>
        <Route path="/login" element={<AuthPage />} />
        {/* AuthGuard component to protect the main app */}
        <Route path="/app" element={<AuthGuard><MainApp/></AuthGuard>} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
