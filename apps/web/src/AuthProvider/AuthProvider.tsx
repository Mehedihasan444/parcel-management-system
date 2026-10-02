import { useMemo } from "react";
import type { ReactNode } from "react";
import { AuthContext } from "./AuthContext";
import type { AppUser, AuthInfo, CreateUserInput } from "./AuthContext";
import { authClient } from "../lib/auth-client";
import useAxiosPublic from "../Hooks/useAxiosPublic";

type SessionUser = {
  id: string;
  email: string;
  name: string;
  image?: string | null;
};

const toAppUser = (u: SessionUser | null | undefined): AppUser | null =>
  u ? { id: u.id, email: u.email, name: u.name, image: u.image ?? null } : null;

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { data: session, isPending } = authClient.useSession();
  const axiosPublic = useAxiosPublic();
  const user = useMemo(() => toAppUser(session?.user ?? null), [session]);

  const ensureAppProfile = async (profile: AppUser) => {
    // Idempotent: the API reports "user already exists" for returning users.
    // image may be null (email signups have no photo); the schema only
    // accepts string|undefined, so omit it rather than sending null.
    await axiosPublic.post("/users", {
      name: profile.name,
      email: profile.email,
      image: profile.image ?? undefined,
      role: "user",
    });
  };

  const createUser = async ({ name, email, password }: CreateUserInput) => {
    const res = await authClient.signUp.email({ name, email, password });
    if (res.error) throw new Error(res.error.message || "Registration failed");
    await ensureAppProfile(toAppUser(res.data?.user) ?? { id: "", email, name, image: null });
  };

  const login = async (email: string, password: string) => {
    const res = await authClient.signIn.email({ email, password });
    if (res.error) throw new Error(res.error.message || "Login failed");
    // The Bearer token is stored by the auth client's global onSuccess.
  };

  const googleLogin = async () => {
    // Full-page redirect through Google; OAuthCallback syncs the profile.
    const res = await authClient.signIn.social({
      provider: "google",
      callbackURL: "/oauth/callback",
    });
    if (res?.error) throw new Error(res.error.message || "Google sign-in failed");
  };

  const logOut = async () => {
    await authClient.signOut();
    localStorage.removeItem("access-token");
  };

  const authInfo: AuthInfo = { user, loading: isPending, createUser, login, googleLogin, logOut };
  return <AuthContext.Provider value={authInfo}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
