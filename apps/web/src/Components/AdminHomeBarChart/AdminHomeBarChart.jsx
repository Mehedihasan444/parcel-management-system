import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "../../Hooks/useAxiosSecure";
import ChartCard from "../Charts/ChartCard";
import BarChart from "../Charts/BarChart";

function dayOf(booking) {
  return String(booking?.bookingDate || "").split("T")[0] || "unknown";
}

const AdminHomeBarChart = () => {
  const axiosSecure = useAxiosSecure();

  const { data: bookings = [] } = useQuery({
    queryKey: ["bookings"],
    queryFn: async () => {
      const res = await axiosSecure.get("/users/admin/bookings");
      return res.data;
    },
  });

  const data = useMemo(() => {
    const counts = new Map();
    for (const b of bookings) counts.set(dayOf(b), (counts.get(dayOf(b)) || 0) + 1);
    return [...counts.entries()]
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .slice(-14)
      .map(([label, value]) => ({ label, value }));
  }, [bookings]);

  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <ChartCard
      title="Bookings per day"
      subtitle="Last 14 active days"
      action={<span className="badge badge-outline">{total} total</span>}
    >
      {data.length ? (
        <BarChart data={data} />
      ) : (
        <p className="py-8 text-center text-sm text-base-content/50">No bookings yet.</p>
      )}
    </ChartCard>
  );
};

export default AdminHomeBarChart;
