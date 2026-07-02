import React from "react";
import type { AppError } from "../auth/axiosClient"; // Path to your client file

interface ValidationErrorDisplayProps {
  error: AppError | null | undefined;
  /** Optional: Specify a field name to only show errors for that specific field */
  fieldName?: string;
}

export const ValidationErrorDisplay: React.FC<ValidationErrorDisplayProps> = ({
  error,
  fieldName,
}) => {
  if (!error) return null;

  // Case A: Show errors for a single, specific input field
  if (fieldName) {
    const fieldErrors = error.errors?.[fieldName];
    if (!fieldErrors || fieldErrors.length === 0) return null;

    return (
      <div className="text-sm text-red-600 mt-1 font-medium">
        {fieldErrors.map((msg, index) => (
          <p key={index}>{msg}</p>
        ))}
      </div>
    );
  }

  // Case B: Show a summary list of all validation errors at the top/bottom of a form
  if (error.errors && Object.keys(error.errors).length > 0) {
    return (
      <div className="p-4 mb-4 bg-red-50 border border-red-200 rounded-md">
        <h4 className="text-sm font-semibold text-red-800 mb-2">
          Please correct the following errors:
        </h4>
        <ul className="list-disc pl-5 space-y-1 text-sm text-red-700">
          {Object.entries(error.errors).map(([field, messages]) =>
            messages.map((msg, idx) => (
              <li key={`${field}-${idx}`}>
                <span className="font-semibold capitalize">{field}</span>: {msg}
              </li>
            )),
          )}
        </ul>
      </div>
    );
  }

  // Fallback: If there are no dictionary errors, just display the main message string
  return (
    <div className="p-3 mb-4 bg-red-50 border border-red-200 rounded text-sm text-red-700 font-medium">
      {error.message}
    </div>
  );
};
