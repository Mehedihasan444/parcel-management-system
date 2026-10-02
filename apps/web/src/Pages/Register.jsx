import loginImg from "../assets/authentication2.webp";
import { useNavigate } from "react-router-dom";
import { notify } from "../lib/notify";
import useAuth from "../Hooks/useAuth";
import SocialLogin from "../Components/SocialLogin/SocialLogin";
import DocumentTitle from "../Components/Seo/DocumentTitle";

const Register = () => {
  const navigate = useNavigate();
  const { createUser } = useAuth();

  const handleSignUp = async (e) => {
    e.preventDefault();
    const form = e.target;
    try {
      await createUser({
        name: form.name.value,
        email: form.email.value,
        password: form.password.value,
      });
      notify.success("Your account is registered successfully");
      navigate("/");
    } catch (error) {
      notify.error(error?.message || "Registration failed");
    }
  };

  return (
    <div className="flex flex-row-reverse justify-between gap-10 items-center h-screen max-w-6xl mx-auto">
      <DocumentTitle title="RapidParcelHub | Register" />
      <div className="flex-1">
        <img
          src={loginImg}
          alt="Parcel delivery illustration"
          loading="lazy"
          decoding="async"
          width="596"
          height="419"
        />
      </div>
      <div className="shadow-md p-10 flex-1">
        <h1 className="text-center font-bold text-2xl">Sign Up </h1>
        <form onSubmit={handleSignUp}>
          <div className="mb-3">
            <label className="form-label" htmlFor="exampleInputEmail1">
              Name
            </label>
            <input
              type="text"
              name="name"
              className="form-control border p-3  w-full"
              placeholder="Enter your Name"
              required
            />
          </div>
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
              placeholder="Password (min 8 characters)"
              minLength={8}
              required
            />
          </div>

          <button type="submit" className="btn bg-[#D1A054] text-white w-full ">
            Sign Up
          </button>
        </form>
        <h3 className="text-[#D1A054] font-medium text-center mt-2">
          Already registered? <a href="/login"> Go to login</a>
        </h3>
        <p className="text-center mb-3">Or sign up with </p>

        <SocialLogin></SocialLogin>
      </div>
    </div>
  );
};

export default Register;
