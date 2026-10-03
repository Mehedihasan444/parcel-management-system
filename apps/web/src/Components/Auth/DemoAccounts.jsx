import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiShield, FiTruck, FiUser } from "react-icons/fi";
import useAuth from "../../Hooks/useAuth";
import { notify } from "../../lib/notify";

/**
 * One-click demo logins (admin / rider / customer) so every workspace can be
 * explored without hunting for credentials. Accounts are seeded by
 * `npm run seed:demo --workspace=@parcel/api` and documented in
 * apps/web/README.md.
 */
const DEMOS = [
  {
    role: "Admin",
    email: "admin@g.com",
    password: "admin@g.com",
    target: "/dashboard/adminHome",
    icon: FiShield,
  },
  {
    role: "Rider",
    email: "delivery@g.com",
    password: "delivery@g.com",
    target: "/dashboard/myDeliveryList",
    icon: FiTruck,
  },
  {
    role: "Customer",
    email: "customer@g.com",
    password: "customer@g.com",
    target: "/dashboard/bookAParcel",
    icon: FiUser,
  },
];

const DemoAccounts = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [pending, setPending] = useState(null);

  const handleDemo = async (demo) => {
    setPending(demo.role);
    try {
      await login(demo.email, demo.password);
      notify.success(`Signed in as ${demo.role} — welcome back`);
      navigate(demo.target);
    } catch (error) {
      notify.error(error?.message || `${demo.role} demo login failed`);
    } finally {
      setPending(null);
    }
  };

  return (
    <div>
      <div className="divider text-xs text-base-content/50">Or explore with a demo account</div>
      <div className="grid gap-2">
        {DEMOS.map((demo) => {
          const Icon = demo.icon;
          return (
            <button
              key={demo.role}
              type="button"
              disabled={pending !== null}
              onClick={() => handleDemo(demo)}
              className="btn btn-outline w-full justify-start gap-3 font-medium"
            >
              {pending === demo.role ? (
                <span className="loading loading-spinner loading-sm" aria-hidden="true" />
              ) : (
                <Icon className="text-base text-brand-600 dark:text-brand-300" aria-hidden="true" />
              )}
              <span className="text-left">
                <span className="block text-sm font-semibold">Continue as {demo.role}</span>
                <span className="block font-mono text-xs font-normal text-base-content/55">
                  {demo.email} · goes to {demo.target.replace("/dashboard/", "")}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DemoAccounts;
