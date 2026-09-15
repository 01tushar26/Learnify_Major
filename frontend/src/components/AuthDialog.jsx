import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";


function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.56 2.7-3.87 2.7-6.62Z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.95v2.33A9 9 0 0 0 9 18Z"/>
      <path fill="#FBBC05" d="M3.95 10.7A5.4 5.4 0 0 1 3.66 9c0-.59.1-1.17.29-1.7V4.97H.95A9 9 0 0 0 0 9c0 1.45.35 2.83.95 4.03l3-2.33Z"/>
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.58-2.58C13.46.89 11.42 0 9 0A9 9 0 0 0 .95 4.97l3 2.33C4.66 5.17 6.65 3.58 9 3.58Z"/>
    </svg>
  );
}

function AuthDialog({ open, onOpenChange }) {
    const handleGoogleLogin = () => {
    window.location.href = "http://localhost:8080/api/v1/oauth2/authorization/google";
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="text-center">
        <DialogTitle className="text-xl font-semibold text-accent">
          Sign in to Learnify
        </DialogTitle>
        <DialogDescription className="mt-2 text-sm text-text-secondary">
          Upload a lecture or PDF, then chat with it or generate a quiz — all
          tied to your account.
        </DialogDescription>

        <p className="mt-6 text-xs text-text-muted">
          We only use your Google account to identify you. Your materials
          stay private to your account.
        </p>

        <Button
          variant="primary"
          className="mt-6 w-full bg-white text-[#1f1f1f] hover:bg-white/90"
          onClick={handleGoogleLogin}
        >
          <GoogleIcon />
          Continue with Google
        </Button>
      </DialogContent>
    </Dialog>
  )
}

export default AuthDialog ;