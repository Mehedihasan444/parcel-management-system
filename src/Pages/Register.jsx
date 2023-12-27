import loginImg from '../assets/authentication2.png'
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
// import useAxiosPublic from "../Hooks/useAxiosPublic";
import useAuth from "../Hooks/useAuth";
import SocialLogin from '../Components/SocialLogin/SocialLogin';
import useAxiosPublic from '../Hooks/useAxiosPublic';
const Register = () => {
    const navigate = useNavigate();
    const { createUser, updateUserProfile } = useAuth();
    const axiosPublic = useAxiosPublic();



    const handleSignUp = (e) => {
      e.preventDefault();
      const form = e.target;
      const name = form.name.value;
      const email = form.email.value;
      const password = form.password.value;
     // console.log(name, email, password);
  
      const photo =
        "https://www.libarts.colostate.edu/wp-content/uploads/2018/02/userphoto.png";
  
      createUser(email, password)
        .then((result) => {
          // Signed in
          const user = result.user;
          console.log(user);
         
          updateUserProfile(name, photo)
            .then((res) => {
              console.log("user profile info updated",res);
              // navigate("/");
              const userInfo = {
                name,
                email,
                image: photo,
                role:'user'
              };
              axiosPublic.post("/users", userInfo).then((res) => {
                console.log(res.data);
                if (res.data.insertedId) {
                  Swal.fire({
                    position: "top-end",
                    icon: "success",
                    title: "Your account is registered successfully",
                    showConfirmButton: false,
                    timer: 1500,
                  });
                  navigate("/");
                }
              });
            })
            .catch((error) => {
              console.log(error);
            });
        })
        .catch((error) => {
          const errorMessage = error.message;
          console.log("errorMessage :", errorMessage);
        });
    };
  
    return (
      <div className="flex flex-row-reverse justify-between gap-10 items-center h-screen max-w-6xl mx-auto">
        <div className="flex-1">
          <img src={loginImg} alt="" className="" />
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
