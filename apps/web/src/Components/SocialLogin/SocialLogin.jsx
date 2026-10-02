import { FaGoogle } from "react-icons/fa";
import useAuth from "../../Hooks/useAuth";
import { useLocation, useNavigate } from "react-router-dom";
// import useAxiosPublic from "../../Hooks/useAxiosPublic";
import { notify } from "../../lib/notify";
import useAxiosPublic from "../../Hooks/useAxiosPublic";

const SocialLogin = () => {
  const { googleLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const axiosPublic = useAxiosPublic();

  const handleGoogleLogin = () => {
    googleLogin()
      .then((result) => {
        // console.log("from social", result);

        const userInfo = {
          name: result.user.displayName,
          email: result.user.email,
          image: result.user.photoURL,
          role: "user",
        };
        axiosPublic.post("/users", userInfo).then((res) => {
          console.log(res.data);
          if (res.data.insertedId) {
            notify.success("Your account is registered successfully");
          }
          navigate(location?.state?.from || "/");
        });
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <div>
      <div className="flex gap-5 justify-center">
        <button type="button" aria-label="Continue with Google" onClick={handleGoogleLogin}>
          <FaGoogle className="text-4xl" />
        </button>
      </div>
      <p className="mt-2 text-center text-xs text-base-content/50">
        Google sign-in only — connect Facebook/GitHub OAuth in Firebase to add more.
      </p>
    </div>
  );
};

export default SocialLogin;
