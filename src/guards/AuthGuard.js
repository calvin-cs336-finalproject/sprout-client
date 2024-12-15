// This is a simple guard that checks if the user is authenticated.
// If the user is not authenticated, it will redirect them to the login page.

// Imports from react
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

// Imports from firebase
import { auth } from "../firebase.js";
import { onAuthStateChanged } from "firebase/auth";

// Our authentication guard component
const AuthGuard = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // useEffect hook to check the authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // If the user is loading, show a loading message
  if (loading) {
    return <div>Loading...</div>;
  }

  // If the user is not authenticated, redirect them to the login page to add security
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default AuthGuard;