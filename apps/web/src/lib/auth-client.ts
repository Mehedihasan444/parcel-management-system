import { createAuthClient } from "better-auth/react";
import { API_BASE_URL } from "../config/api";

// The API base URL carries the /api/v1 suffix; the auth client needs the bare
// origin because it appends /api/auth/* itself.
const API_ORIGIN = new URL(API_BASE_URL).origin;

export const authClient = createAuthClient({
  baseURL: API_ORIGIN,
  fetchOptions: {
    // Bearer sessions: capture the session token every auth response carries
    // and keep it where axiosSecure already looks (localStorage access-token).
    onSuccess: (ctx) => {
      const token = ctx.response.headers.get("set-auth-token");
      if (token) localStorage.setItem("access-token", token);
    },
  },
});

export default authClient;
