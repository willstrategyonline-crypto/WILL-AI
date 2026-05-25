"use client";

import { useState } from "react";
import { LoginScreen } from "@/components/login-screen";
import { RegisterScreen } from "@/components/register-screen";
import { ChatScreen } from "@/components/chat-screen";
import { AdminScreen } from "@/components/admin-screen";

type Screen = "login" | "register" | "chat" | "admin";

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("login");
  const [isAdmin, setIsAdmin] = useState(false);
  const [isUnlimited, setIsUnlimited] = useState(false);

  const handleLogin = (adminLogin: boolean) => {
    setIsAdmin(adminLogin);
    // For demo purposes, set unlimited for admin users
    setIsUnlimited(adminLogin);
    setCurrentScreen("chat");
  };

  const handleLogout = () => {
    setCurrentScreen("login");
    setIsAdmin(false);
    setIsUnlimited(false);
  };

  const handleAdminClick = () => {
    setCurrentScreen("admin");
  };

  const handleBackFromAdmin = () => {
    setCurrentScreen("chat");
  };

  const handleGoToRegister = () => {
    setCurrentScreen("register");
  };

  const handleRegister = () => {
    // After registration, user needs admin approval
    // For now, go back to login with a message
    setCurrentScreen("login");
  };

  const handleBackToLogin = () => {
    setCurrentScreen("login");
  };

  return (
    <>
      {currentScreen === "login" && (
        <LoginScreen onLogin={handleLogin} onGoToRegister={handleGoToRegister} />
      )}
      {currentScreen === "register" && (
        <RegisterScreen onRegister={handleRegister} onBackToLogin={handleBackToLogin} />
      )}
      {currentScreen === "chat" && (
        <ChatScreen 
          onLogout={handleLogout} 
          onAdminClick={isAdmin ? handleAdminClick : undefined}
          isAdmin={isAdmin}
          isUnlimited={isUnlimited}
        />
      )}
      {currentScreen === "admin" && (
        <AdminScreen onBack={handleBackFromAdmin} />
      )}
    </>
  );
}
