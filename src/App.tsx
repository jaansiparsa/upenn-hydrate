import { AuthProvider, useAuth } from "./contexts/AuthContext";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import React, { useState } from "react";

import { AuthForm } from "./components/AuthForm";
import { ConfigurationError } from "./components/ConfigurationError";
import { Dashboard } from "./components/Dashboard";
import { FountainDetail } from "./components/FountainDetail";
import { UserProfile } from "./components/UserProfile";
import { FrontPage } from "./components/FrontPage";
import { supabaseConfig } from "./config/supabase";

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");

  // Check if Supabase is configured
  const isConfigured =
    supabaseConfig.url &&
    supabaseConfig.url !== "your_supabase_project_url" &&
    supabaseConfig.anonKey &&
    supabaseConfig.anonKey !== "your_supabase_anon_key";

  if (!isConfigured) {
    return <ConfigurationError />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

<<<<<<< HEAD
=======
  if (user) {
    return (
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/fountain/:id" element={<FountainDetail />} />
        <Route path="/user/:id" element={<UserProfile />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

>>>>>>> main
  return (
    <Routes>
      <Route path="/" element={<FrontPage />} />
      <Route 
        path="/login" 
        element={
          user ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <AuthForm
              mode={authMode}
              onToggleMode={() =>
                setAuthMode(authMode === "signin" ? "signup" : "signin")
              }
            />
          )
        } 
      />
      <Route 
        path="/dashboard" 
        element={
          user ? <Dashboard /> : <Navigate to="/login" replace />
        } 
      />
      <Route 
        path="/fountain/:id" 
        element={
          user ? <FountainDetail /> : <Navigate to="/login" replace />
        } 
      />
      <Route 
        path="/user/:id" 
        element={
          user ? <UserProfile /> : <Navigate to="/login" replace />
        } 
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
