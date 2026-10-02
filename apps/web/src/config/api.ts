/**
 * Runtime configuration for the web client.
 *
 * Every value is read from a Vite environment variable (prefix `VITE_`) so the
 * same build can target a local API or a deployed one without code changes.
 * See apps/web/.env.example.
 */

// Single source of truth for the API base URL. Both axios instances import it,
// so the endpoint is configured in exactly one place.
export const API_BASE_URL: string =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";

export default { API_BASE_URL };
