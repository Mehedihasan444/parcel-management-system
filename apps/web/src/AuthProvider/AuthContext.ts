import { createContext } from "react";

/** App-facing user shape (Better Auth session user, trimmed). */
export interface AppUser {
  id: string;
  email: string;
  name: string;
  image?: string | null;
}

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
}

/** Shape of the value provided by AuthProvider. */
export interface AuthInfo {
  user: AppUser | null;
  loading: boolean;
  createUser: (input: CreateUserInput) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  googleLogin: () => Promise<void>;
  logOut: () => Promise<void>;
}

/** Shared auth context — lives here (not in AuthProvider) so the
 *  provider file only exports a component (react-refresh rule). */
export const AuthContext = createContext<AuthInfo | null>(null);

export default AuthContext;
