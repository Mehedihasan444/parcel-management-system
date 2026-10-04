import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { FiBox, FiCheckCircle, FiCreditCard, FiUsers } from "react-icons/fi";
import AdminHomeBarChart from "../Components/AdminHomeBarChart/AdminHomeBarChart";
import AdminHomeLineChart from "../Components/AdminHomeLineChart/AdminHomeLineChart";
import SectionTitle from "../Components/SectionTitle/SectionTitle";
import DocumentTitle from "../Components/Seo/DocumentTitle";
import Stat from "../Components/UI/Stat";
import useAxiosSecure from "../Hooks/useAxiosSecure";

const AdminHome = () => {
  const axiosSecure = useAxiosSecure();

  const { data: bookings = [] } = useQuery({
    queryKey: ["adminHomeBookings"],
    queryFn: async () => {
      const res = await axiosSecure.get("/users/admin/bookings");
      return res.data;
    },
  });
  const { data: users = [] } = useQuery({
    queryKey: ["adminHomeUsers"],
    queryFn: async () => {
      const res = await axiosSecure.get("/users/admin");
      return res.data;
    },
  });

  const kpis = useMemo(() => {
    const delivered = bookings.filter((b) => b?.status === "delivered").length;
    const revenue = bookings.reduce((s, b) => s + (Number(b?.price) || 0), 0);
    const rate = bookings.length ? Math.round((delivered / bookings.length) * 100) : 0;
    return [
      {
        icon: FiBox,
        value: bookings.length,
        label: "Total parcels",
        sub: `${bookings.length - delivered} still moving`,
        tone: "brand",
      },
      {
        icon: FiCheckCircle,
        value: `${rate}%`,
        label: "Delivered rate",
        sub: `${delivered} delivered`,
        tone: "emerald",
      },
      {
        icon: FiCreditCard,
        value: `৳${revenue}`,
        label: "Gross volume",
        sub: "Sum of parcel prices",
        tone: "sky",
      },
      {
        icon: FiUsers,
        value: users.length,
        label: "Registered users",
        sub: `${users.filter((u) => u?.role === "deliveryMen").length} riders`,
        tone: "violet",
      },
    ];
  }, [bookings, users]);

  return (
    <div>
      <DocumentTitle title="RapidParcelHub | Admin overview" />
      <SectionTitle heading="Network overview" subHeading="Live operations" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map((k) => (
          <Stat
            key={k.label}
            icon={k.icon}
            value={k.value}
            label={k.label}
            sub={k.sub}
            tone={k.tone}
          />
        ))}
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <AdminHomeBarChart />
        <AdminHomeLineChart />
      </div>
    </div>
  );
};

export default AdminHome;
