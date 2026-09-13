import React from 'react'
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { AuthDialog } from "@/components/AuthDialog";

function LandingPage() {
    const [authOpen, setAuthOpen] = useState(false);
  return (
     <div className="flex min-h-screen flex-col items-center justify-center bg-canvas px-6 text-center">
      <h1 className="text-4xl font-semibold text-text-primary">
        Turn any video or PDF into a tutor
      </h1>
      <p className="mt-4 max-w-md text-text-secondary">
        Upload a lecture or document. Ask it questions. Generate a quiz from
        it. Learnify does the rest.
      </p>
      <Button className="mt-8" onClick={() => setAuthOpen(true)}>
        Get started
      </Button>

      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
    </div>
  )
}

export default LandingPage