import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FiCamera } from "react-icons/fi";
import useAuth from "../Hooks/useAuth";
import useAxiosSecure from "../Hooks/useAxiosSecure";
import useAxiosPublic from "../Hooks/useAxiosPublic";
import PageHeader from "../Components/UI/PageHeader";
import FormField, { inputClass } from "../Components/UI/FormField";
import DocumentTitle from "../Components/Seo/DocumentTitle";
import { notify } from "../lib/notify";
import { useForm } from "react-hook-form";

const AddressBook = () => {
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();
  const axiosPublic = useAxiosPublic();
  const { register, handleSubmit, watch, setValue } = useForm();
  const [pending, setPending] = useState(false);
  const [preview, setPreview] = useState(null);

  const { data: userInfo } = useQuery({
    queryKey: ["userInfo", user?.email],
    queryFn: async () => {
      const res = await axiosSecure.get(`/users/${user?.email}`);
      return res.data;
    },
    enabled: Boolean(user?.email),
  });

  useEffect(() => {
    if (userInfo?.name) setValue("name", userInfo.name);
    if (userInfo?.phone) setValue("phone", userInfo.phone);
  }, [userInfo?.name, userInfo?.phone, setValue]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data) => {
    setPending(true);
    try {
      let imageUrl = userInfo?.image;
      // eslint-disable-next-line react-hooks/incompatible-library
      const file = watch("image");
      if (file?.length > 0) {
        if (!import.meta.env.VITE_IMAGE_HOSTING_KEY) {
          notify.warning("Add VITE_IMAGE_HOSTING_KEY to upload a new photo — saving without it");
        } else {
          const imageFile = { image: file[0] };
          const res = await axiosPublic.post(
            `https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_IMAGE_HOSTING_KEY}`,
            imageFile,
            {
              headers: { "Content-Type": "multipart/form-data" },
            }
          );
          if (res.data.success) {
            imageUrl = res.data.data.display_url;
          } else {
            throw new Error("Image upload failed");
          }
        }
      }
      const info = { name: data.name, email: data.email, phone: data.phone, image: imageUrl };
      const res = await axiosSecure.put(`/users/updateProfile/${userInfo.email}`, info);
      if (res.data.modifiedCount > 0) {
        notify.success("Profile updated successfully");
      } else {
        notify.info("Nothing changed");
      }
    } catch {
      notify.error("Something went wrong");
    } finally {
      setPending(false);
    }
  };

  const src = preview || userInfo?.image || `https://i.pravatar.cc/150?u=${user?.email}`;

  return (
    <div>
      <DocumentTitle title="RapidParcelHub | My profile" />
      <PageHeader
        eyebrow="Account"
        title="Profile"
        description="Manage your personal details and profile picture."
      />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-md mx-auto">
        <div className="flex flex-col items-center">
          <label className="relative">
            <img
              src={src}
              alt="Profile picture"
              className="h-24 w-24 rounded-full object-cover border-4 border-base-200"
            />
            <label
              className="btn btn-ghost btn-circle absolute bottom-0 right-0 bg-base-100 shadow-lg"
              aria-label="Change profile picture"
            >
              <FiCamera className="text-base-content/70" />
              <input
                {...register("image")}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          </label>
        </div>

        <FormField label="Name" htmlFor="name">
          <input
            {...register("name")}
            id="name"
            defaultValue={userInfo?.name}
            className={inputClass}
            required
          />
        </FormField>

        <FormField label="Email" htmlFor="email">
          <input
            {...register("email")}
            id="email"
            type="email"
            defaultValue={userInfo?.email}
            className={inputClass}
            required
          />
        </FormField>

        <FormField label="Phone" htmlFor="phone">
          <input
            {...register("phone")}
            id="phone"
            type="tel"
            defaultValue={userInfo?.phone}
            className={inputClass}
            placeholder="+880 1XXX-XXXXXX"
          />
        </FormField>

        <button
          type="submit"
          disabled={pending}
          className="btn w-full border-0 bg-brand-500 font-semibold text-white hover:bg-brand-600 disabled:opacity-70"
        >
          {pending ? (
            <span className="loading loading-spinner loading-sm" aria-hidden="true" />
          ) : null}
          {pending ? "Saving…" : "Save changes"}
        </button>
      </form>
    </div>
  );
};

export default AddressBook;
