import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "../../Hooks/useAxiosSecure";
import { useEffect } from "react";
import PropTypes from "prop-types";

const DeliveryCounter = ({ id }) => {
  const axiosSecure = useAxiosSecure();

  const { data: numberOfDelivery } = useQuery({
    queryKey: ["numberOfDelivery", id],
    queryFn: async () => {
      const res = await axiosSecure.get(`/deliveryMen/delivery/count/${id}`);
      return res.data;
    },
    enabled: Boolean(id),
  });

  useEffect(() => {
    if (!id || numberOfDelivery?.length === undefined) return;
    axiosSecure
      .patch(`/deliveryMen/parcel/delivered/${id}`, { parcelDelivered: numberOfDelivery?.length })
      .catch(() => {});
  }, [axiosSecure, id, numberOfDelivery?.length]);

  return (
    <div>
      <h1 className="text-center">{numberOfDelivery?.length ?? "—"}</h1>
    </div>
  );
};

DeliveryCounter.propTypes = {
  id: PropTypes.string,
};

export default DeliveryCounter;
