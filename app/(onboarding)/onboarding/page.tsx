"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { OnboardingProgress } from "@/components/onboarding/onboarding-progress";
import { WelcomeStep } from "@/components/onboarding/welcome-step";
import { ProfileStep } from "@/components/onboarding/profile-step";
import { OrganizationStep } from "@/components/onboarding/organization-step";
import { CompletionStep } from "@/components/onboarding/completion-step";

const ONBOARDING_STEPS = [
  { title: "Welcome", description: "Get started" },
  { title: "Profile", description: "Your information" },
  { title: "Organization", description: "Create workspace" },
  { title: "Complete", description: "All done" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [organizationName, setOrganizationName] = useState("");

  const currentUser = useQuery(api.users.getCurrent);
  const onboardingStatus = useQuery(api.onboarding.getStatus);
  const completeProfile = useMutation(api.onboarding.completeProfile);
  const completeOnboarding = useMutation(api.onboarding.complete);

  // Redirect if already onboarded
  useEffect(() => {
    if (onboardingStatus?.hasCompletedOnboarding) {
      router.push("/dashboard");
    }
  }, [onboardingStatus, router]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (currentUser === null) {
      router.push("/login");
    }
  }, [currentUser, router]);

  const handleProfileSubmit = async (data: {
    name: string;
    image?: string;
  }) => {
    setIsLoading(true);
    try {
      await completeProfile(data);
      setCurrentStep(3);
    } catch (error) {
      console.error("Failed to update profile:", error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOrganizationSubmit = async (data: {
    organizationName: string;
    organizationSlug: string;
  }) => {
    setIsLoading(true);
    try {
      await completeOnboarding(data);
      setOrganizationName(data.organizationName);
      setCurrentStep(4);
    } catch (error) {
      console.error("Failed to create organization:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create organization";
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (currentUser === undefined || onboardingStatus === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Progress Indicator (hidden on welcome and completion steps) */}
        {currentStep !== 1 && currentStep !== 4 && (
          <OnboardingProgress
            currentStep={currentStep}
            totalSteps={ONBOARDING_STEPS.length}
            steps={ONBOARDING_STEPS}
          />
        )}

        {/* Step Content */}
        <div className="bg-card border rounded-lg p-8 shadow-sm">
          {currentStep === 1 && (
            <WelcomeStep
              onNext={() => setCurrentStep(2)}
              userName={currentUser?.name}
            />
          )}

          {currentStep === 2 && (
            <ProfileStep
              onNext={handleProfileSubmit}
              onBack={() => setCurrentStep(1)}
              initialName={currentUser?.name || ""}
              isLoading={isLoading}
            />
          )}

          {currentStep === 3 && (
            <OrganizationStep
              onNext={handleOrganizationSubmit}
              onBack={() => setCurrentStep(2)}
              isLoading={isLoading}
            />
          )}

          {currentStep === 4 && (
            <CompletionStep organizationName={organizationName} />
          )}
        </div>
      </div>
    </div>
  );
}
