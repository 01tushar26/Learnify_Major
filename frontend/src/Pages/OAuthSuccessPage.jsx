// src/pages/OAuthSuccessPage.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function OAuthSuccessPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get("accessToken");

    if (accessToken) {
      localStorage.setItem("accessToken", accessToken);
    }

    navigate("/materials", { replace: true });
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-panel-border border-t-accent" />
    </div>
  );
}