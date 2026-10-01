import { useEffect, useMemo, useState } from "react";
import { Rating } from "@smastrom/react-rating";
import { FiTruck } from "react-icons/fi";
import useAxiosSecure from "../../Hooks/useAxiosSecure";
import SectionTitle from "../../Components/SectionTitle/SectionTitle";

const TheTopDeliveryMen = () => {
  const axiosSecure = useAxiosSecure();
  const [data, setData] = useState([]);

  useEffect(() => {
    let cancelled = false;
    axiosSecure
      .get("/users/admin")
      .then((res) => {
        if (!cancelled) setData(res.data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [axiosSecure]);

  const deliveryMen = useMemo(() => {
    const sorted = [...data].sort((a, b) => {
      const ratingA = a.avgRating || 0;
      const ratingB = b.avgRating || 0;
      const deliveredA = a.parcelDelivered || 0;
      const deliveredB = b.parcelDelivered || 0;
      return ratingB - ratingA || deliveredB - deliveredA;
    });
    return sorted.filter((d) => d.role === "deliveryMen").slice(0, 5);
  }, [data]);

  if (!deliveryMen.length) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
      <SectionTitle heading="Riders customers love" subHeading="Top delivery partners" />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
        {deliveryMen?.map((card) => (
          <article
            key={card?._id || card?.email}
            className="group overflow-hidden rounded-3xl border border-base-200 bg-base-100 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="relative h-44 overflow-hidden bg-base-200">
              <img
                src={card?.image || `https://i.pravatar.cc/300?u=${card?.email}`}
                alt={`${card?.name || "Delivery partner"} profile photo`}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <span className="badge absolute left-3 top-3 border-0 bg-base-100/90 text-xs font-semibold">
                <FiTruck className="mr-1" aria-hidden="true" />
                {card?.parcelDelivered || 0} delivered
              </span>
            </div>
            <div className="p-5 text-center">
              <h3 className="font-display truncate text-base font-bold">{card?.name}</h3>
              <div className="mt-2 flex justify-center">
                <Rating style={{ maxWidth: 130 }} value={card?.avgRating || 0} readOnly />
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default TheTopDeliveryMen;
