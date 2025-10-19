// src/lib/api/errorHandler.ts

export function handleApiError(error: unknown) {
  console.error('API Error:', error);

  // If the error is a JSON parse issue, return 400 status
  if (error instanceof SyntaxError)
    return { status: 400, message: "Invalid JSON in request body" };

  // If it's a normal error (network, database, etc), return 500 status and the error message
  if (error instanceof Error)
    return { status: 500, message: error.message };

  // If it's something else (an edge case), fallback to a generic server error message
  return { status: 500, message: "Unknown server error" };
}
