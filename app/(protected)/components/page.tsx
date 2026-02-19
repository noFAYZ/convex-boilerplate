"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Loading, LoadingSpinner } from "@/components/ui/loading";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  AlertCircleIcon,
  Check,
  CheckCircle,
  InformationCircleIcon,
} from "@hugeicons/core-free-icons";
import { CheckCheck } from "lucide-react";

export default function ComponentsPage() {
  const [progress, setProgress] = useState(45);
  const [dialogOpen, setDialogOpen] = useState(false);

  const showSuccessToast = () => {
    toast.success("Success!", "Operation completed successfully");
  };

  const showErrorToast = () => {
    toast.error("Error", "Something went wrong");
  };

  const showInfoToast = () => {
    toast.info("Info", "Here is some information");
  };

  const showLoadingToast = () => {
    const toastId = toast.loading("Loading...", "Please wait");
    setTimeout(() => {
      toast.dismiss(toastId);
      toast.success("Done!", "Loading completed");
    }, 3000);
  };

  const showProgressToast = () => {
    const toastId = toast.loading("Uploading...", `0%`);
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 30;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        toast.dismiss(toastId);
        toast.success("Upload complete!", "File uploaded successfully");
      } else {
        toast.progress(toastId, Math.min(progress, 100), `Uploading... ${Math.round(Math.min(progress, 100))}%`);
      }
    }, 500);
  };

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Component Showcase</h1>
        <p className="text-muted-foreground mt-2">
          Explore all available components in the design system
        </p>
      </div>

      {/* Buttons */}
      <Card>
        <CardHeader>
          <CardTitle>Buttons</CardTitle>
          <CardDescription>Various button styles and sizes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <p className="text-sm font-semibold text-muted-foreground">Variants</p>
            <div className="flex flex-wrap gap-2">
              <Button variant="default">Default</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="link">Link</Button>
              <Button variant="delete">Delete</Button>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <p className="text-sm font-semibold text-muted-foreground">Sizes</p>
            <div className="flex flex-wrap gap-2">
              <Button size="xs">XS</Button>
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
              <Button size="xl">XL</Button>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <p className="text-sm font-semibold text-muted-foreground">States</p>
            <div className="flex flex-wrap gap-2">
              <Button>Normal</Button>
              <Button disabled>Disabled</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Badges */}
      <Card>
        <CardHeader>
          <CardTitle>Badges</CardTitle>
          <CardDescription>Status and label badges</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <p className="text-sm font-semibold text-muted-foreground">
              Variants
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="default">Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="destructive">Destructive</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="ghost">Ghost</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="info">Info</Badge>
              <Badge variant="neutral">Neutral</Badge>
              <Badge variant="pending">Pending</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Alerts</CardTitle>
          <CardDescription>Alert components for important messages</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <HugeiconsIcon
              icon={InformationCircleIcon}
              className="h-4 w-4"
            />
            <AlertTitle>Heads up!</AlertTitle>
            <AlertDescription>
              You can add components to your app using the code snippets below.
            </AlertDescription>
          </Alert>

          <Alert variant="destructive">
            <HugeiconsIcon
              icon={AlertCircleIcon}
              className="h-4 w-4"
            />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Your session has expired. Please log in again.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Cards */}
      <Card>
        <CardHeader>
          <CardTitle>Cards</CardTitle>
          <CardDescription>Container component for grouping content</CardDescription>
        </CardHeader>
        <CardContent>
          <Card className="p-4">
            <p className="text-sm">
              This is a nested card demonstrating how cards can be composed
              together.
            </p>
          </Card>
        </CardContent>
      </Card>

      {/* Forms */}
      <Card>
        <CardHeader>
          <CardTitle>Form Elements</CardTitle>
          <CardDescription>Input, select, and textarea components</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="input">Input</Label>
            <Input
              id="input"
              placeholder="Type something..."
              defaultValue="Sample input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="textarea">Textarea</Label>
            <Textarea
              id="textarea"
              placeholder="Enter some text..."
              defaultValue="Sample textarea content"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="select">Select</Label>
            <Select defaultValue="option1">
              <SelectTrigger id="select">
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="option1">Option 1</SelectItem>
                <SelectItem value="option2">Option 2</SelectItem>
                <SelectItem value="option3">Option 3</SelectItem>
                <SelectItem value="option4">Option 4</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Progress</CardTitle>
          <CardDescription>Progress bar component</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label>Progress: {progress}%</Label>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  setProgress((p) => (p + 10 > 100 ? 0 : p + 10))
                }
              >
                Increase
              </Button>
            </div>
            <Progress value={progress} />
          </div>

          <Separator />

          <div className="space-y-3">
            <p className="text-sm font-semibold text-muted-foreground">Examples</p>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-muted-foreground mb-1">25%</p>
                <Progress value={25} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">50%</p>
                <Progress value={50} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">100%</p>
                <Progress value={100} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading */}
      <Card>
        <CardHeader>
          <CardTitle>Loading States</CardTitle>
          <CardDescription>Loading spinner and full-page loading component</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <p className="text-sm font-semibold text-muted-foreground">Spinner Sizes</p>
            <div className="flex gap-8">
              <div className="flex flex-col items-center gap-2">
                <LoadingSpinner size="sm" />
                <p className="text-xs text-muted-foreground">Small</p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <LoadingSpinner size="md" />
                <p className="text-xs text-muted-foreground">Medium</p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <LoadingSpinner size="lg" />
                <p className="text-xs text-muted-foreground">Large</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialog */}
      <Card>
        <CardHeader>
          <CardTitle>Dialog</CardTitle>
          <CardDescription>Modal dialog component</CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger>Open Dialog</DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Dialog Title</DialogTitle>
                <DialogDescription>
                  This is a dialog description. You can add any content here.
                </DialogDescription>
              </DialogHeader>
              <p className="text-sm text-muted-foreground">
                Dialog content goes here. It will be centered on the screen with
                a backdrop overlay.
              </p>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setDialogOpen(false)}>Confirm</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Toasts */}
      <Card>
        <CardHeader>
          <CardTitle>Toasts</CardTitle>
          <CardDescription>
            Toast notifications with different types and progress tracking
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Button size="sm" onClick={showSuccessToast}>
              Success Toast
            </Button>
            <Button size="sm" onClick={showErrorToast} variant="destructive">
              Error Toast
            </Button>
            <Button size="sm" onClick={showInfoToast} variant="secondary">
              Info Toast
            </Button>
            <Button size="sm" onClick={showLoadingToast} variant="outline">
              Loading Toast
            </Button>
            <Button size="sm" onClick={showProgressToast} variant="outline">
              Progress Toast
            </Button>
          </div>

          <Separator />

          <div className="space-y-3">
            <p className="text-sm font-semibold text-muted-foreground">
              Toast Features
            </p>
            <ul className="text-sm space-y-2 text-muted-foreground">
              <li className="flex gap-2">
            
                <CheckCheck className="h-4 w-4 flex-shrink-0 mt-0.5 text-green-600" />
              </li>
              <li className="flex gap-2">
                <CheckCheck className="h-4 w-4 flex-shrink-0 mt-0.5 text-green-600" />
                <span>Progress tracking with visual progress bar</span>
              </li>
              <li className="flex gap-2">
                <CheckCheck className="h-4 w-4 flex-shrink-0 mt-0.5 text-green-600" />
                <span>Auto-dismiss on completion</span>
              </li>
              <li className="flex gap-2">
                <CheckCheck className="h-4 w-4 flex-shrink-0 mt-0.5 text-green-600" />
                <span>Dismissable toasts with close button</span>
              </li>
              <li className="flex gap-2">
                <CheckCheck className="h-4 w-4 flex-shrink-0 mt-0.5 text-green-600" />
                <span>No status borders for clean appearance</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Separator */}
      <Card>
        <CardHeader>
          <CardTitle>Separator</CardTitle>
          <CardDescription>Divider component</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm">Content before separator</p>
          <Separator />
          <p className="text-sm">Content after separator</p>
        </CardContent>
      </Card>
    </div>
  );
}
