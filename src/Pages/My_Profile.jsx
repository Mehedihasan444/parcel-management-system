import { useForm } from "react-hook-form";
import useAuth from "../Hooks/useAuth";
import useAxiosPublic from "../Hooks/useAxiosPublic";
import Swal from "sweetalert2";
import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "../Hooks/useAxiosSecure";

const image_hosting_key = import.meta.env.VITE_IMAGE_HOSTING_KEY;

const image_hosting_api = `https://api.imgbb.com/1/upload?key=${image_hosting_key}`;

const My_Profile = () => {
  const { user } = useAuth();
  const { register, handleSubmit, watch, reset } = useForm();
  const axiosSecure = useAxiosSecure();
  const axiosPublic = useAxiosPublic();

  // console.log(user)
  const { data: userInfo, refetch } = useQuery({
    queryKey: ["userInfo",user?.email],
    queryFn: async () => {
      const res = await axiosSecure.get(`/users/${user?.email}`);
      return res.data;
    },
  });
// console.log(userInfo)
  const onSubmit = async (data) => {
    // console.log(watch(data));
    if (data.image.length > 0) {
      // console.log("from >0",data);
      const imageFile = { image: data.image[0] };
      const res = await axiosPublic.post(image_hosting_api, imageFile, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log(res.data);
      if (res.data.success) {
        const info = {
          name: data.name,
          email: data.email,
          phone: data.phone,
          image: res.data.data.display_url,
        };
        // console.log(info)
        const userRes = await axiosSecure.put(
          `/users/updateProfile/${userInfo.email}`,
          info
        );
        console.log(userRes.data);
        if (userRes.data.modifiedCount > 0) {
          // reset();
          Swal.fire({
            position: "top-end",
            icon: "success",
            title: "Profile updated Successfully",
            showConfirmButton: false,
            timer: 1500,
          });
        } else {
          Swal.fire({
            position: "top-end",
            icon: "error",
            title: "Something went wrong",
            showConfirmButton: false,
            timer: 1500,
          });
        }
      }
    } else if (data.image.length === 0) {
      // console.log("from =0",data);

      const info = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        image: user.photoURL,
      };
      // console.log(info)
      const userRes = await axiosSecure.put(
        `/users/updateProfile/${userInfo.email}`,
        info
      );
      console.log(userRes.data);
      if (userRes.data.modifiedCount > 0) {
        // reset();
        Swal.fire({
          position: "top-end",
          icon: "success",
          title: "Profile updated Successfully",
          showConfirmButton: false,
          timer: 1500,
        });
      } else {
        Swal.fire({
          position: "top-end",
          icon: "error",
          title: "Something went wrong",
          showConfirmButton: false,
          timer: 1500,
        });
      }
    }
  };

  return (
    <div>
      <div className="max-w-lg mx-auto mt-8 p-6 bg-white rounded shadow-md">
        <h2 className="text-2xl font-semibold mb-4 text-center">My Profile</h2>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col justify-center items-center">
            <div className="mb-4">
              {/* <label htmlFor="profilePicture">Current Profile Picture:</label> */}
              <img
                src={userInfo?.image}
                alt="Current Profile"
                className="rounded-full h-20 w-20 object-cover mb-2"
              />
            </div>
          </div>
          <div className="flex justify-between gap-2 items-center mb-4">
            <label htmlFor="newProfilePicture" className="font-medium">
              Change Picture:{" "}
            </label>
            <input
              type="file"
              {...register("image")}
              id="image"
              name="image"
              //   accept="image/*"
              //   onChange={handleFileChange}
              className="form-input"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="name" className="font-medium">
              Name:{" "}
            </label>
            <input
              {...register("name")}
              type="text"
              id="name"
              name="name"
              defaultValue={userInfo?.name}
              className="form-input w-3/4"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="email" className="font-medium">
              Email:{" "}
            </label>
            <input
              {...register("email")}
              type="email"
              id="email"
              name="email"
              defaultValue={userInfo?.email}
              className="form-input w-3/4"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="phone" className="font-medium">
              Phone Number:{" "}
            </label>
            <input
              {...register("phone")}
              type="tel"
              id="phone"
              name="phone"
              defaultValue={userInfo?.phone}
              className="form-input"
            />
          </div>

          <div className="mb-4">
            <button
              type="submit"
              //    onClick={updateProfile}
              className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
            >
              Update Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default My_Profile;
