"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { handleMutationError, handleMutationSuccess } from "@/lib/error-handler";

interface VerificationDialogProps {
  email: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function VerificationDialog({ email, open, onOpenChange, onSuccess }: VerificationDialogProps) {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const verifyEmail = useMutation(api.emailVerification.verifyEmail);

  // Auto-focus first input when dialog opens
  useEffect(() => {
    if (open) {
      setCode(["", "", "", "", "", ""]);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [open]);

  const handleInputChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newCode = pastedText.split("").concat(Array(6 - pastedText.length).fill(""));
    setCode(newCode as string[]);
    if (pastedText.length === 6) {
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerify = useCallback(async () => {
    const fullCode = code.join("");
    if (fullCode.length !== 6) return;

    setIsLoading(true);
    try {
      await verifyEmail({ email, code: fullCode });
      handleMutationSuccess("Email verified successfully! 🎉");
      setCode(["", "", "", "", "", ""]);
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      handleMutationError(err);
      setCode(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  }, [code, email, verifyEmail, onOpenChange, onSuccess]);

  const fullCode = code.join("");
  const isComplete = fullCode.length === 6;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Verify your email</DialogTitle>
          <DialogDescription>
            Enter the 6-digit code we sent to<br/>
            <span className="font-medium text-foreground">{email}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Code Input Boxes */}
          <div className="flex gap-2 justify-center">
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleInputChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                disabled={isLoading}
                className="w-12 h-12 sm:w-12 sm:h-12 text-center text-xl font-bold rounded-lg border-1 border-border/50 bg-background focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/20 transition-colors disabled:opacity-50"
                aria-label={`Digit ${index + 1}`}
              />
            ))}
          </div>

          {/* Verify Button */}
          <Button
            onClick={handleVerify}
            disabled={!isComplete || isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? "Verifying..." : "Verify Email"}
          </Button>

          {/* Resend Link */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Didn't receive the code?{" "}
              <Button
                variant="link"
                size="sm"
                className="h-auto p-0"
                disabled={isLoading}
                onClick={() => {
                  // User can close and click "Send verification code" again
                  onOpenChange(false);
                }}
              >
                Resend
              </Button>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
