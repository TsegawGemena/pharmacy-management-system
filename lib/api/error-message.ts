import { ApiError } from "@/lib/api/client";

const GENERIC_ADD_PRODUCT_ERROR =
  "Unable to add product. Please check the product information and try again.";

/** Map API failures to user-facing product-creation messages. */
export function productCreationErrorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status >= 500) {
      return GENERIC_ADD_PRODUCT_ERROR;
    }
    if (err.message && err.message !== "Internal server error") {
      return err.message;
    }
    return GENERIC_ADD_PRODUCT_ERROR;
  }
  if (err instanceof Error && err.message) {
    return err.message;
  }
  return GENERIC_ADD_PRODUCT_ERROR;
}
