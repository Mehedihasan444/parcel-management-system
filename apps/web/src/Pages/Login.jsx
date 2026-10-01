import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import useAuth from "../Hooks/useAuth";
import loginImg from "../assets/authentication2.png";
import SocialLogin from "../Components/SocialLogin/SocialLogin";
import DocumentTitle from "../Components/Seo/DocumentTitle";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const handleLogin = (e) => {
    e.preventDefault();

    const form = e.target;
    const email = form.email.value;
    const password = form.password.value;

    login(email, password)
      .then((userCredential) => {
        Swal.fire({
          position: "top-end",
          icon: "success",
          title: "Login Success",
          showConfirmButton: false,
          timer: 1500,
        });

        navigate(location?.state || "/");
        const user = userCredential.user;
        console.log(user);
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        Swal.fire({
          position: "top-end",
          icon: "error",
          title: `${errorMessage}`,
          showConfirmButton: false,
          timer: 1500,
        });
        console.log("error code:", errorCode, "errorMessage :", errorMessage);
      });
  };

  return (
    <div className="flex justify-between gap-10 items-center h-screen max-w-6xl mx-auto">
      <DocumentTitle title="RapidParcelHub | Login" />
      <div className="flex-1">
        <img src={loginImg} alt="" className="" />
      </div>
      <div className="shadow-md p-10 flex-1">
        <h1 className="text-center font-bold text-2xl">Please Login </h1>
        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label" htmlFor="exampleInputEmail1">
              Email address
            </label>
            <input
              type="email"
              name="email"
              className="form-control border p-3  w-full"
              placeholder="Enter email"
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label" htmlFor="exampleInputPassword1">
              Password
            </label>
            <input
              type="password"
              name="password"
              className="form-control border p-3  w-full"
              placeholder="Password"
              required
            />
          </div>

          <button type="submit" className="btn bg-[#D1A054] text-white w-full ">
            Login
          </button>
        </form>
        <h3 className="text-[#D1A054] font-medium text-center mt-2">
          New here? <a href="/register">Create a New Account</a>
        </h3>
        <p className="text-center mb-3">Or sign in with </p>
        <SocialLogin></SocialLogin>
      </div>
    </div>
  );
};

export default Login;
