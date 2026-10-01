import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "../../Hooks/useAxiosSecure";
import ChartCard from "../Charts/ChartCard";
import TrendLine from "../Charts/TrendLine";

const AdminHomeLineChart = () => {
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
    for (const b of bookings) {
      const day = String(b?.bookingDate || "").split("T")[0] || "unknown";
      counts.set(day, (counts.get(day) || 0) + 1);
    }
    const days = [...counts.entries()].sort(([a], [b]) => (a < b ? -1 : 1)).slice(-14);
    let acc = 0;
    return days.map(([label, value]) => ({ label, value: (acc += value) }));
  }, [bookings]);

  return (
    <ChartCard title="Cumulative bookings" subtitle="Running total, last 14 active days">
      {data.length ? (
        <TrendLine data={data} />
      ) : (
        <p className="py-8 text-center text-sm text-base-content/50">No bookings yet.</p>
      )}
    </ChartCard>
  );
};

export default AdminHomeLineChart;
