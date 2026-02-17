"use client";

import { ReactNode, useMemo } from "react";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ConvexAuthProvider } from "@convex-dev/auth/react";

function SetupScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-2xl w-full space-y-6 text-center">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">⚡ Convex Not Running</h1>
          <p className="text-muted-foreground text-lg">
            The Convex backend server needs to be started
          </p>
        </div>

        <div className="bg-muted/50 rounded-lg p-6 text-left space-y-4">
          <div className="space-y-2">
            <h2 className="font-semibold text-lg">📍 You're Here</h2>
            <p className="text-sm text-muted-foreground">
              Convex is configured, but the dev server isn't running.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="font-semibold text-lg">✅ Solution</h2>
            <p className="text-sm text-muted-foreground">
              Open a new terminal and run:
            </p>
            <pre className="bg-background p-3 rounded border overflow-x-auto">
              <code className="text-primary font-semibold">npx convex dev</code>
            </pre>
            <p className="text-sm text-muted-foreground">
              Keep that terminal running, then refresh this page.
            </p>
          </div>

          <div className="pt-4 border-t space-y-2">
            <p className="text-sm font-medium">💡 Two terminals needed:</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>Terminal 1: <code className="bg-background px-2 py-1 rounded">npx convex dev</code></li>
              <li>Terminal 2: <code className="bg-background px-2 py-1 rounded">npm run dev</code> (this one)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

  // Show setup instructions if Convex is not configured
  if (!convexUrl) {
    return <SetupScreen />;
  }

  // Memoize the Convex client to prevent recreation on every render
  const convex = useMemo(() => new ConvexReactClient(convexUrl), [convexUrl]);

  return (

      <ConvexAuthProvider  client={convex}>
        {children}
      </ConvexAuthProvider>
 
  );
}
