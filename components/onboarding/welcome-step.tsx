"use client";

import { Button } from "@/components/ui/button";

interface WelcomeStepProps {
  onNext: () => void;
  userName?: string;
}

export function WelcomeStep({ onNext, userName }: WelcomeStepProps) {
  return (
    <div className="space-y-6 text-center">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">
          Welcome{userName ? `, ${userName}` : ""}! 👋
        </h1>
        <p className="text-muted-foreground text-lg">
          Let's get your account set up in just a few steps
        </p>
      </div>

      <div className="grid gap-4 text-left max-w-md mx-auto mt-8">
        <div className="flex gap-3 items-start">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-primary">👤</span>
          </div>
          <div>
            <h3 className="font-medium">Complete your profile</h3>
            <p className="text-sm text-muted-foreground">
              Tell us a bit about yourself
            </p>
          </div>
        </div>

        <div className="flex gap-3 items-start">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-primary">🏢</span>
          </div>
          <div>
            <h3 className="font-medium">Create your organization</h3>
            <p className="text-sm text-muted-foreground">
              Set up your workspace
            </p>
          </div>
        </div>

        <div className="flex gap-3 items-start">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-primary">🚀</span>
          </div>
          <div>
            <h3 className="font-medium">Start building</h3>
            <p className="text-sm text-muted-foreground">
              You'll be ready to go in under a minute
            </p>
          </div>
        </div>
      </div>

      <Button onClick={onNext} size="lg" className="mt-8">
        Get Started
      </Button>
    </div>
  );
}
