import React, { useState } from "react";
import Chart from "react-apexcharts";
import useAxiosSecure from "../../Hooks/useAxiosSecure";
import { useQuery } from "@tanstack/react-query";

const AdminHomeBarChart = () => {
  const axiosSecure = useAxiosSecure();
  let date = [];

  const { data: bookings = [] } = useQuery({
    queryKey: ["bookings"],
    queryFn: async () => {
      const res = await axiosSecure.get("/users/admin/bookings");
      return res.data;
    },
  });
  //.split("T")[0]
  bookings.map((booking) => {
    date.push(booking.bookingDate.split("T")[0]); // Corrected split method
  });
  const uniqueDatesSet = new Set(date);
  const uniqueDatesArray = [...uniqueDatesSet];
  //   console.log(uniqueDatesArray);
  let c = 0;
  let bookingCount = [];
  for (let i = 0; i < uniqueDatesArray.length; i++) {
    for (let j = 0; j < bookings.length; j++) {
      if (uniqueDatesArray[i] === bookings[j].bookingDate.split("T")[0]) {
        c++;
      }
    }
    // bookingCount.push({ [uniqueDatesArray[i]]: c });
    bookingCount.push(c);
    c = 0;
  }
  console.log(bookingCount);
  const [chartData, setChartData] = useState({
    options: {
      chart: {
        id: "basic-bar",
      },
      xaxis: {
        categories: uniqueDatesArray,
      },
    },
    series: [
      {
        name: "series-1",
        data: bookingCount,
      },
    ],
  });

  return (
    <div className="app">
      <div className="row">
        <div className="mixed-chart">
          <Chart
            options={chartData.options}
            series={chartData.series}
            type="bar"
            width="500"
          />
        </div>
      </div>
    </div>
  );
};

export default AdminHomeBarChart;
