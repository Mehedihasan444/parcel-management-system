import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { notify } from "../lib/notify";
import useAuth from "../Hooks/useAuth";
import SocialLogin from "../Components/SocialLogin/SocialLogin";
import AuthLayout from "../Components/Auth/AuthLayout";
import { AuthField, PasswordField } from "../Components/Auth/AuthFields";
import { FiMail, FiUser } from "react-icons/fi";

const Register = () => {
  const navigate = useNavigate();
  const { createUser } = useAuth();
  const [pending, setPending] = useState(false);

  const handleSignUp = async (e) => {
    e.preventDefault();
    const form = e.target;
    setPending(true);
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
    } finally {
      setPending(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Free forever to start — book your first parcel in a minute."
      docTitle="RapidParcelHub | Register"
    >
      <form onSubmit={handleSignUp} className="space-y-4">
        <AuthField
          id="name"
          name="name"
          label="Full name"
          icon={FiUser}
          type="text"
          placeholder="Jane Doe"
          required
          autoComplete="name"
        />
        <AuthField
          id="email"
          name="email"
          label="Email address"
          icon={FiMail}
          type="email"
          placeholder="you@example.com"
          required
          autoComplete="email"
        />
        <PasswordField
          name="password"
          placeholder="Min 8 characters"
          minLength={8}
          required
          autoComplete="new-password"
        />
        <button
          type="submit"
          disabled={pending}
          className="btn w-full border-0 bg-brand-500 font-semibold text-white hover:bg-brand-600 disabled:opacity-70"
        >
          {pending ? <span className="loading loading-spinner loading-sm" aria-hidden="true" /> : null}
          {pending ? "Creating account…" : "Sign up"}
        </button>
      </form>
      <p className="mt-5 text-center text-sm text-base-content/65">
        Already registered?{" "}
        <Link to="/login" className="font-semibold text-brand-600 hover:underline">
          Go to login
        </Link>
      </p>
      <div className="divider text-xs text-base-content/50">Or sign up with</div>
      <SocialLogin />
    </AuthLayout>
  );
};

export default Register;
