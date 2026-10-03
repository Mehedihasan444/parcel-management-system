import { FaGoogle } from "react-icons/fa";
import useAuth from "../../Hooks/useAuth";
import { useLocation, useNavigate } from "react-router-dom";
import { notify } from "../../lib/notify";

const SocialLogin = () => {
  const { googleLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleGoogleLogin = async () => {
    try {
      await googleLogin();
      // Full-page redirect to Google; OAuthCallback syncs the profile.
      navigate(location?.state?.from || "/dashboard/bookAParcel");
    } catch (error) {
      notify.error(error?.message || "Google sign-in failed");
    }
  };

  return (
    <div>
      <div className="flex gap-5 justify-center">
        <button type="button" aria-label="Continue with Google" onClick={handleGoogleLogin}>
          <FaGoogle className="text-4xl" />
        </button>
      </div>
      {/* <p className="mt-2 text-center text-xs text-base-content/50">
        Google sign-in only — more providers can be added via the API&apos;s socialProviders.
      </p> */}
    </div>
  );
};

export default SocialLogin;
