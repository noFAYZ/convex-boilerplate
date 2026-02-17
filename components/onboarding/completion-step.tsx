"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

interface CompletionStepProps {
  organizationName: string;
}

export function CompletionStep({ organizationName }: CompletionStepProps) {
  return (
    <div className="space-y-6 text-center">
      <div className="space-y-4">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
          <span className="text-4xl">🎉</span>
        </div>

        <h1 className="text-3xl font-bold">You're All Set!</h1>
        <p className="text-muted-foreground text-lg max-w-md mx-auto">
          Your account and organization <strong>{organizationName}</strong> have
          been created successfully
        </p>
      </div>

      <div className="bg-muted/50 rounded-lg p-6 text-left max-w-md mx-auto mt-8">
        <h3 className="font-semibold mb-4">What's Next?</h3>
        <ul className="space-y-3">
          <li className="flex gap-3 items-start">
            <span className="text-primary">✓</span>
            <div>
              <p className="font-medium">Explore your dashboard</p>
              <p className="text-sm text-muted-foreground">
                Check out all the features available to you
              </p>
            </div>
          </li>
          <li className="flex gap-3 items-start">
            <span className="text-primary">✓</span>
            <div>
              <p className="font-medium">Invite team members</p>
              <p className="text-sm text-muted-foreground">
                Collaborate with your team
              </p>
            </div>
          </li>
          <li className="flex gap-3 items-start">
            <span className="text-primary">✓</span>
            <div>
              <p className="font-medium">Customize your workspace</p>
              <p className="text-sm text-muted-foreground">
                Make it your own with settings and preferences
              </p>
            </div>
          </li>
        </ul>
      </div>

      <Button asChild size="lg" className="mt-8">
        <Link href="/dashboard">Go to Dashboard</Link>
      </Button>
    </div>
  );
}
