import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./pages/AuthPage.js";
import MainApp from "./pages/MainPage.js";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<AuthPage/>} />
        <Route path="/app" element={<MainApp/>} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
