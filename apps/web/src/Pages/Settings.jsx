import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  FiBell,
  FiCreditCard,
  FiLock,
  FiMail,
  FiMapPin,
  FiShield,
  FiUser,
} from "react-icons/fi";
import useAxiosSecure from "../Hooks/useAxiosSecure";
import useAuth from "../Hooks/useAuth";
import { notify } from "../lib/notify";
import PageHeader from "../Components/UI/PageHeader";
import DocumentTitle from "../Components/Seo/DocumentTitle";
import Avatar from "../Components/UI/Avatar";

const Settings = () => {
  const axiosSecure = useAxiosSecure();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");

  const { data: userData } = useQuery({
    queryKey: ["settingsUser", user?.email],
    queryFn: async () => {
      const res = await axiosSecure.get(`/users/${user?.email}`);
      return res.data;
    },
    enabled: Boolean(user?.email),
  });

  const [profile, setProfile] = useState({
    name: userData?.name || user?.name || "",
    phone: userData?.phone || "",
    address: userData?.address || "",
  });

  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
  });

  const [password, setPassword] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const handleProfileSave = async (e) => {
    e.preventDefault();
    try {
      await axiosSecure.put(`/users/updateProfile/${user?.email}`, profile);
      notify.success("Profile updated successfully");
    } catch {
      notify.error("Failed to update profile");
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (password.new !== password.confirm) {
      notify.error("New passwords don't match");
      return;
    }
    try {
      await axiosSecure.put(`/users/updateProfile/${user?.email}`, {
        password: password.new,
      });
      notify.success("Password changed successfully");
      setPassword({ current: "", new: "", confirm: "" });
    } catch {
      notify.error("Failed to change password");
    }
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: FiUser },
    { id: "notifications", label: "Notifications", icon: FiBell },
    { id: "security", label: "Security", icon: FiShield },
  ];

  return (
    <div>
      <DocumentTitle title="RapidParcelHub | Settings" />
      <PageHeader
        eyebrow="Settings"
        title="Account Settings"
        description="Manage your profile, notifications, and security preferences."
      />

      <div className="mt-6 flex flex-col gap-6 lg:flex-row">
        <div className="lg:w-64">
          <div className="rounded-3xl border border-base-200 bg-base-100 p-4 shadow-sm">
            <div className="flex items-center gap-3 px-2 py-3">
              <Avatar
                src={user?.image}
                name={user?.name}
                email={user?.email}
                className="h-12 w-12 rounded-full text-lg"
              />
              <div>
                <p className="font-semibold">{user?.name || "User"}</p>
                <p className="text-xs text-base-content/50">{user?.email}</p>
              </div>
            </div>
            <div className="divider my-2" />
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? "bg-brand-500 text-white"
                      : "text-base-content/70 hover:bg-base-200"
                  }`}
                >
                  <tab.icon className="text-base" aria-hidden="true" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        <div className="flex-1">
          {activeTab === "profile" && (
            <form
              onSubmit={handleProfileSave}
              className="rounded-3xl border border-base-200 bg-base-100 p-6 shadow-sm"
            >
              <h3 className="font-display text-lg font-bold">Profile Information</h3>
              <div className="mt-4 space-y-4">
                <div>
                  <label className="label">
                    <span className="label-text font-medium">Full Name</span>
                  </label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="input input-bordered w-full"
                    required
                  />
                </div>
                <div>
                  <label className="label">
                    <span className="label-text font-medium">Phone</span>
                  </label>
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="input input-bordered w-full"
                  />
                </div>
                <div>
                  <label className="label">
                    <span className="label-text font-medium">Address</span>
                  </label>
                  <textarea
                    value={profile.address}
                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                    className="textarea textarea-bordered w-full"
                    rows={3}
                  />
                </div>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          )}

          {activeTab === "notifications" && (
            <div className="rounded-3xl border border-base-200 bg-base-100 p-6 shadow-sm">
              <h3 className="font-display text-lg font-bold">Notification Preferences</h3>
              <div className="mt-4 space-y-4">
                {[
                  { key: "email", label: "Email Notifications", desc: "Receive booking updates via email" },
                  { key: "sms", label: "SMS Notifications", desc: "Get SMS alerts for delivery status" },
                  { key: "push", label: "Push Notifications", desc: "Browser push notifications" },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between rounded-2xl border border-base-200 p-4"
                  >
                    <div>
                      <p className="font-medium">{item.label}</p>
                      <p className="text-xs text-base-content/50">{item.desc}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications[item.key]}
                      onChange={(e) =>
                        setNotifications({ ...notifications, [item.key]: e.target.checked })
                      }
                      className="toggle toggle-primary"
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => notify.success("Notification preferences saved")}
                  className="btn btn-primary"
                >
                  Save Preferences
                </button>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <form
              onSubmit={handlePasswordChange}
              className="rounded-3xl border border-base-200 bg-base-100 p-6 shadow-sm"
            >
              <h3 className="font-display text-lg font-bold">Change Password</h3>
              <div className="mt-4 space-y-4">
                <div>
                  <label className="label">
                    <span className="label-text font-medium">Current Password</span>
                  </label>
                  <input
                    type="password"
                    value={password.current}
                    onChange={(e) => setPassword({ ...password, current: e.target.value })}
                    className="input input-bordered w-full"
                    required
                  />
                </div>
                <div>
                  <label className="label">
                    <span className="label-text font-medium">New Password</span>
                  </label>
                  <input
                    type="password"
                    value={password.new}
                    onChange={(e) => setPassword({ ...password, new: e.target.value })}
                    className="input input-bordered w-full"
                    required
                    minLength={6}
                  />
                </div>
                <div>
                  <label className="label">
                    <span className="label-text font-medium">Confirm New Password</span>
                  </label>
                  <input
                    type="password"
                    value={password.confirm}
                    onChange={(e) => setPassword({ ...password, confirm: e.target.value })}
                    className="input input-bordered w-full"
                    required
                    minLength={6}
                  />
                </div>
                <button type="submit" className="btn btn-primary">
                  Update Password
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
