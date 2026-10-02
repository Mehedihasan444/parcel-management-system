import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../Hooks/useAuth";
import useAxiosPublic from "../Hooks/useAxiosPublic";
import Loading from "../Components/Shared/Loading";
import DocumentTitle from "../Components/Seo/DocumentTitle";

/**
 * Landing page for Google OAuth returns. Better Auth redirects here after the
 * provider round-trip; this screen creates the app profile row (idempotent)
 * and forwards into the dashboard. Email flows never visit this page.
 */
const OAuthCallback = () => {
  const { user, loading } = useAuth();
  const axiosPublic = useAxiosPublic();
  const navigate = useNavigate();
  const synced = useRef(false);

  useEffect(() => {
    if (loading || synced.current) return;
    if (!user) {
      navigate("/login");
      return;
    }
    synced.current = true;
    axiosPublic
      .post("/users", {
        name: user.name,
        email: user.email,
        image: user.image ?? undefined,
        role: "user",
      })
      .catch(() => {
        // The profile write is best-effort here; admins can repair later.
      })
      .finally(() => navigate("/dashboard/bookAParcel"));
  }, [user, loading, axiosPublic, navigate]);

  return (
    <div className="grid min-h-screen place-items-center">
      <DocumentTitle title="RapidParcelHub | Signing you in" />
      <Loading label="Finishing Google sign-in…" />
    </div>
  );
};

export default OAuthCallback;
