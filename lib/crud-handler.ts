/**
 * CRUD Error Handling Pattern for the app
 *
 * This file provides a consistent pattern for handling all CRUD operations
 * with automatic error and success toasting.
 */

import { toast } from "@/hooks/use-toast";
import { parseError } from "./error-handler";

export type CRUDOperation = "create" | "read" | "update" | "delete" | "join" | "leave";

interface CRUDHandlerOptions {
  operation: CRUDOperation;
  entityType: string;
  showSuccess?: boolean;
  customSuccessMessage?: string;
  customErrorTitle?: string;
}

/**
 * Execute a CRUD operation with automatic error and success handling
 *
 * @example
 * const handleCreateUser = async () => {
 *   await executeCRUD(
 *     () => createUser({ name, email }),
 *     {
 *       operation: "create",
 *       entityType: "User",
 *       customSuccessMessage: "User created successfully!"
 *     }
 *   );
 * };
 */
export async function executeCRUD<T>(
  operation: () => Promise<T>,
  options: CRUDHandlerOptions
): Promise<T | null> {
  const {
    operation: op,
    entityType,
    showSuccess = true,
    customSuccessMessage,
    customErrorTitle,
  } = options;

  try {
    const result = await operation();

    if (showSuccess) {
      const defaultMessage = getSuccessMessage(op, entityType);
      const message = customSuccessMessage || defaultMessage;
      toast.success(message);
    }

    return result;
  } catch (error) {
    const { title, message } = parseError(error);
    const finalTitle = customErrorTitle || title;
    toast.error(finalTitle, message);
    console.error(`${op.toUpperCase()} ${entityType} failed:`, error);
    return null;
  }
}

/**
 * Handle try-catch pattern for CRUD operations
 *
 * @example
 * const handleUpdate = tryExecuteCRUD(
 *   async () => {
 *     await updateUser({ id, name });
 *     handleMutationSuccess("User updated");
 *   },
 *   "update",
 *   "User"
 * );
 */
export async function tryExecuteCRUD(
  operation: () => Promise<void>,
  operationType: CRUDOperation,
  entityType: string
): Promise<boolean> {
  try {
    await operation();
    return true;
  } catch (error) {
    const { title, message } = parseError(error);
    toast.error(title, message);
    console.error(`${operationType.toUpperCase()} ${entityType} failed:`, error);
    return false;
  }
}

function getSuccessMessage(operation: CRUDOperation, entityType: string): string {
  const messages: Record<CRUDOperation, string> = {
    create: `${entityType} created successfully`,
    read: `${entityType} loaded successfully`,
    update: `${entityType} updated successfully`,
    delete: `${entityType} deleted successfully`,
    join: `Joined ${entityType} successfully`,
    leave: `Left ${entityType} successfully`,
  };

  return messages[operation];
}

/**
 * Hook-friendly wrapper for mutations with error handling
 *
 * @example
 * const handleRemoveMember = useCallback(
 *   wrapMutation(
 *     (memberId) => removeMember({ memberId }),
 *     { operation: "delete", entityType: "Member" }
 *   ),
 *   [removeMember]
 * );
 */
export function wrapMutation<T, Args>(
  mutationFn: (args: Args) => Promise<T>,
  options: CRUDHandlerOptions
): (args: Args) => Promise<T | null> {
  return async (args: Args) => {
    return executeCRUD(() => mutationFn(args), options);
  };
}
