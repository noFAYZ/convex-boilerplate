import { cn } from "@/lib/utils";

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
  steps: { title: string; description: string }[];
}

export function OnboardingProgress({
  currentStep,
  totalSteps,
  steps,
}: OnboardingProgressProps) {
  return (
    <div className="w-full">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">
            Step {currentStep} of {totalSteps}
          </span>
          <span className="text-sm font-medium">
            {Math.round((currentStep / totalSteps) * 100)}%
          </span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Step Indicators */}
      <div className="flex justify-between mb-8">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;

          return (
            <div
              key={index}
              className={cn(
                "flex flex-col items-center flex-1",
                index !== steps.length - 1 && "relative"
              )}
            >
              {/* Connector Line */}
              {index !== steps.length - 1 && (
                <div
                  className={cn(
                    "absolute top-4 left-1/2 w-full h-0.5 -z-10",
                    isCompleted ? "bg-primary" : "bg-muted"
                  )}
                />
              )}

              {/* Step Circle */}
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mb-2 transition-colors",
                  isCompleted &&
                    "bg-primary text-primary-foreground",
                  isCurrent &&
                    "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2",
                  !isCompleted &&
                    !isCurrent &&
                    "bg-muted text-muted-foreground"
                )}
              >
                {isCompleted ? "✓" : stepNumber}
              </div>

              {/* Step Title */}
              <div className="text-center">
                <p
                  className={cn(
                    "text-xs font-medium",
                    isCurrent ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {step.title}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
