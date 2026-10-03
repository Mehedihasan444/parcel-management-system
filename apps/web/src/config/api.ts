/**
 * Runtime configuration for the web client.
 *
 * Every value is read from a Vite environment variable (prefix `VITE_`) so the
 * same build can target a local API or a deployed one without code changes.
 * See apps/web/.env.example.
 */

// Single source of truth for the API base URL. Both axios instances import it,
// so the endpoint is configured in exactly one place.
// Defaults to the same-origin `/api/v1` so a single-domain Vercel deployment
// works with no extra config; override with VITE_API_BASE_URL for local dev
// (http://localhost:5000/api/v1) or a split frontend/backend deployment.
export const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL || "/api/v1";

export default { API_BASE_URL };
