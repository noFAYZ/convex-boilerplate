/**
 * Parse error messages and return user-friendly messages
 */
export function parseError(error: unknown): {
  title: string;
  message: string;
} {
  let message = "";

  if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === "string") {
    message = error;
  } else {
    return {
      title: "Something went wrong",
      message: "An unexpected error occurred. Please try again.",
    };
  }

  // Normalize message for comparison (case-insensitive)
  const normalizedMessage = message.toLowerCase();

  // Parse Convex error messages
  if (normalizedMessage.includes("already invited")) {
    return {
      title: "Already Invited",
      message: "This user has already been invited to the organization.",
    };
  }

  if (normalizedMessage.includes("already a member")) {
    return {
      title: "Already a Member",
      message: "This user is already a member of the organization.",
    };
  }

  if (normalizedMessage.includes("cannot delete account while being the last owner")) {
    return {
      title: "Cannot Delete Account",
      message: "You are the last owner of an organization. Transfer ownership or delete the organization first.",
    };
  }

  if (normalizedMessage.includes("not found")) {
    return {
      title: "Not Found",
      message: "The requested item does not exist.",
    };
  }

  if (normalizedMessage.includes("unauthorized")) {
    return {
      title: "Not Authorized",
      message: "You don't have permission to perform this action.",
    };
  }

  if (normalizedMessage.includes("permission denied")) {
    return {
      title: "Permission Denied",
      message: "You don't have permission to perform this action.",
    };
  }

  if (normalizedMessage.includes("invalid")) {
    return {
      title: "Invalid Input",
      message: message,
    };
  }

  if (normalizedMessage.includes("already exists")) {
    return {
      title: "Already Exists",
      message: message.replace(/already exists/i, "already exists"),
    };
  }

  if (normalizedMessage.includes("password")) {
    return {
      title: "Password Error",
      message: message,
    };
  }

  if (normalizedMessage.includes("email")) {
    return {
      title: "Email Error",
      message: message,
    };
  }

  if (normalizedMessage.includes("slug")) {
    return {
      title: "Invalid Slug",
      message: message,
    };
  }

  if (normalizedMessage.includes("network") || normalizedMessage.includes("failed to fetch")) {
    return {
      title: "Network Error",
      message: "Connection failed. Please check your internet and try again.",
    };
  }

  // Generic error with original message
  return {
    title: "Error",
    message: message || "An error occurred",
  };
}

/**
 * Handle mutation errors and show appropriate toast
 */
import { toast } from "@/hooks/use-toast";

export function handleMutationError(
  error: unknown,
  defaultTitle: string = "Operation failed"
) {
  const { title, message } = parseError(error);

  // Debug logging (remove in production if needed)
  if (error instanceof Error) {
    console.debug("Error caught:", {
      original: error.message,
      title,
      message,
    });
  }

  toast.error(title, message);
}

/**
 * Handle mutation success
 */
export function handleMutationSuccess(
  message: string = "Operation completed successfully"
) {
  toast.success(message);
}
