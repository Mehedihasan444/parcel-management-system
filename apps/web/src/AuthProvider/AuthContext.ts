import { createContext } from "react";
import type { User, UserCredential } from "firebase/auth";

/** Shape of the value provided by AuthProvider. */
export interface AuthInfo {
  user: User | null | undefined;
  loading: boolean;
  createUser: (email: string, password: string) => Promise<UserCredential>;
  login: (email: string, password: string) => Promise<UserCredential>;
  googleLogin: () => Promise<UserCredential>;
  logOut: () => Promise<void>;
  updateUserProfile: (name: string, photo: string) => Promise<void>;
}

/** Shared auth context — lives here (not in AuthProvider.jsx) so the
 *  provider file only exports a component (react-refresh rule). */
export const AuthContext = createContext<AuthInfo | null>(null);

export default AuthContext;
