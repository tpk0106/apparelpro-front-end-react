// utils/errorHandler.ts
import axios from "axios";
import { toast } from "react-toastify";

export const handleApiError = (error: unknown): void => {
  // DEVELOPMENT LOG: Open your browser inspect panel to read this object tree!
  console.dir(error);

  let errorMessage = "An unexpected error occurred. Please try again.";

  if (axios.isAxiosError(error)) {
    // If response is undefined, the request never reached your endpoint code
    if (!error.response) {
      errorMessage = `Network Connection Error: ${error.message}`;
    } else {
      const serverResponse = error.response.data;

      if (typeof serverResponse === "string") {
        errorMessage = serverResponse;
      } else if (
        serverResponse &&
        typeof serverResponse === "object" &&
        "message" in serverResponse
      ) {
        errorMessage = (serverResponse as { message: string }).message;
      } else if (error.message) {
        errorMessage = error.message;
      }
    }
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  toast.error(errorMessage, {
    position: "top-right",
    autoClose: 5000,
  });
};
