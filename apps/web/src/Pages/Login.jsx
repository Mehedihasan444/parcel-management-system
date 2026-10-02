import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { notify } from "../lib/notify";
import useAuth from "../Hooks/useAuth";
import SocialLogin from "../Components/SocialLogin/SocialLogin";
import AuthLayout from "../Components/Auth/AuthLayout";
import { AuthField, PasswordField } from "../Components/Auth/AuthFields";
import { FiMail } from "react-icons/fi";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [pending, setPending] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    const form = e.target;
    setPending(true);
    try {
      await login(form.email.value, form.password.value);
      notify.success("Welcome back — login successful");
      navigate(location?.state?.from || "/");
    } catch (error) {
      notify.error(error?.message || "Login failed");
    } finally {
      setPending(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to book, track and manage your parcels."
      docTitle="RapidParcelHub | Login"
    >
      <form onSubmit={handleLogin} className="space-y-4">
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
        <PasswordField name="password" placeholder="Your password" required autoComplete="current-password" />
        <button
          type="submit"
          disabled={pending}
          className="btn w-full border-0 bg-brand-500 font-semibold text-white hover:bg-brand-600 disabled:opacity-70"
        >
          {pending ? <span className="loading loading-spinner loading-sm" aria-hidden="true" /> : null}
          {pending ? "Logging in…" : "Log in"}
        </button>
      </form>
      <p className="mt-5 text-center text-sm text-base-content/65">
        New here?{" "}
        <Link to="/register" className="font-semibold text-brand-600 hover:underline">
          Create a new account
        </Link>
      </p>
      <div className="divider text-xs text-base-content/50">Or continue with</div>
      <SocialLogin />
    </AuthLayout>
  );
};

export default Login;
