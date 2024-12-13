import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TextField, Button, Typography, Box, Container } from "@mui/material";

import { auth } from "../firebase.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { createUserWithBalance } from "../services/firestoreService.js";

const AuthPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState(""); // New state for username
  const [isSignUp, setIsSignUp] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleAuth = async () => {
    try {
      if (isSignUp) {
        if (!username) {
          setError("Username is required for sign-up.");
          return;
        }

        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;

        // Add user to Firestore with initial balance and username
        await createUserWithBalance(user.uid, user.email, username);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      navigate("/app");
    } catch (err) {
      console.error("Error during authentication:", err.message);
      setError(err.message);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleAuth();
    }
  };

  return (
    <Container>
      <img
        className="logo"
        src="/SproutLogo.png"
        alt="Sprout Logo"
        style={{ display: "block", margin: "0 auto", maxWidth: "100px" }}
      />
      <Box display="flex" flexDirection="column" alignItems="center" mt={5}>
        <Typography variant="h4" gutterBottom>
          {isSignUp ? "Sign Up" : "Sign In"}
        </Typography>
        {isSignUp && ( // Only show username field for sign-up
          <TextField
            label="Username"
            variant="outlined"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ marginBottom: "1rem", width: "300px" }}
            onKeyDown={handleKeyPress}
          />
        )}
        <TextField
          label="Email"
          variant="outlined"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ marginBottom: "1rem", width: "300px" }}
          onKeyDown={handleKeyPress}
        />
        <TextField
          label="Password"
          variant="outlined"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ marginBottom: "1rem", width: "300px" }}
          onKeyDown={handleKeyPress}
        />
        {error && (
          <Typography color="error" style={{ marginBottom: "1rem" }}>
            {error}
          </Typography>
        )}
        <Button
          variant="contained"
          onClick={handleAuth}
          style={{ marginBottom: "1rem" }}
        >
          {isSignUp ? "Sign Up" : "Sign In"}
        </Button>
        <Button onClick={() => setIsSignUp((prev) => !prev)}>
          {isSignUp
            ? "Already have an account? Sign In"
            : "Don't have an account? Sign Up"}
        </Button>
      </Box>
    </Container>
  );
};

export default AuthPage;
