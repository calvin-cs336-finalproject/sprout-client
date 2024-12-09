import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // For routing
import { TextField, Button, Typography, Box } from "@mui/material";
import { auth } from "../firebase.js"; // Import your configured Firebase instance
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { createUserWithBalance } from "../services/firestoreService.js";

const AuthPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleAuth = async () => {
    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Add user to Firestore with initial balance
        await createUserWithBalance(user.uid, user.email);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      navigate("/app");
    } catch (err) {
      console.error("Error during authentication:", err.message);
      setError(err.message);
    }
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center" mt={5}>
      <Typography variant="h4" gutterBottom>
        {isSignUp ? "Sign Up" : "Sign In"}
      </Typography>
      <TextField
        label="Email"
        variant="outlined"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ marginBottom: "1rem", width: "300px" }}
      />
      <TextField
        label="Password"
        variant="outlined"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ marginBottom: "1rem", width: "300px" }}
      />
      {error && (
        <Typography color="error" style={{ marginBottom: "1rem" }}>
          {error}
        </Typography>
      )}
      <Button variant="contained" onClick={handleAuth} style={{ marginBottom: "1rem" }}>
        {isSignUp ? "Sign Up" : "Sign In"}
      </Button>
      <Button
        onClick={() => setIsSignUp((prev) => !prev)}
      >
        {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
      </Button>
    </Box>
  );
}

export default AuthPage;
