import { FaFacebook, FaGithub, FaGoogle } from "react-icons/fa";
import useAuth from "../../Hooks/useAuth";
import { useLocation, useNavigate } from "react-router-dom";
// import useAxiosPublic from "../../Hooks/useAxiosPublic";
import Swal from "sweetalert2";

const SocialLogin = () => {
  const { googleLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  // const axiosPublic = useAxiosPublic()

  const handleGoogleLogin = () => {
    googleLogin()
      .then((result) => {
        console.log("from social", result);

        // const userInfo = {
        //     name:result.user.displayName,
        //     email:result.user.email,
        //   };
        //   axiosPublic.post("/users", userInfo).then((res) => {
        //     console.log(res.data);
        //     if (res.data.insertedId) {
        Swal.fire({
          position: "top-end",
          icon: "success",
          title: "Your account is registered successfully",
          showConfirmButton: false,
          timer: 1500,
        });

        //     }
        navigate(location?.state || "/");
        //   });
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <div>
      <div className="flex gap-5 justify-center">
        <button>
          <FaFacebook className="text-4xl " type="" />
        </button>
        <button>
          <FaGoogle
            onClick={handleGoogleLogin}
            className="text-4xl "
            type=""
          ></FaGoogle>
        </button>
        <button>
          <FaGithub className="text-4xl " type=""></FaGithub>
        </button>
      </div>
    </div>
  );
};

export default SocialLogin;
