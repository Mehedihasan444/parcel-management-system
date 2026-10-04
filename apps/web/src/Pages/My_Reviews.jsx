import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import SectionTitle from "../Components/SectionTitle/SectionTitle";
import DocumentTitle from "../Components/Seo/DocumentTitle";
import useAuth from "../Hooks/useAuth";
import useAxiosSecure from "../Hooks/useAxiosSecure";
import { Rating } from "@smastrom/react-rating";
import EmptyState from "../Components/UI/EmptyState";
import Avatar from "../Components/UI/Avatar";
import Stat from "../Components/UI/Stat";
import { FiStar, FiMessageSquare, FiTrendingUp } from "react-icons/fi";

const My_Reviews = () => {
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();
  const { data: profile = {} } = useQuery({
    queryKey: ["riderProfile", user?.email],
    queryFn: async () => {
      const res = await axiosSecure.get(`/users/${user.email}`);
      return res.data;
    },
    enabled: Boolean(user?.email),
  });
  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["riderReviews", profile?._id],
    queryFn: async () => {
      const res = await axiosSecure.get(`/delivery/reviews/${profile._id}`);
      return res.data;
    },
    enabled: Boolean(profile?._id),
  });

  const summary = useMemo(() => {
    const rated = reviews.filter((r) => Number.isFinite(Number(r?.rating)));
    const avg = rated.length ? rated.reduce((s, r) => s + Number(r.rating), 0) / rated.length : 0;
    const five = rated.filter((r) => Number(r.rating) >= 4.5).length;
    return { avg, count: reviews.length, five };
  }, [reviews]);

  return (
    <div>
      <DocumentTitle title="RapidParcelHub | My reviews" />
      <SectionTitle heading="My Reviews" subHeading="User's Thought About You" />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <Stat
          icon={FiStar}
          value={summary.avg ? summary.avg.toFixed(1) : "—"}
          label="Average rating"
          sub={summary.count ? `Across ${summary.count} reviews` : undefined}
          tone="amber"
        />
        <Stat icon={FiMessageSquare} value={summary.count} label="Total reviews" tone="brand" />
        <Stat icon={FiTrendingUp} value={summary.five} label="4.5★ and above" tone="emerald" />
      </div>

      <div className="mt-5">
        {isLoading ? (
          <div className="grid gap-4" aria-hidden="true">
            {[0, 1].map((i) => (
              <div
                key={i}
                className="flex gap-4 rounded-3xl border border-base-200 bg-base-100 p-5"
              >
                <div className="skeleton h-12 w-12 shrink-0 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-4 w-1/3 rounded" />
                  <div className="skeleton h-4 w-2/3 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <EmptyState
            icon={FiStar}
            title="No reviews yet"
            body="Deliver parcels and customers will leave feedback here."
          />
        ) : (
          <div className="grid gap-4">
            {reviews?.map((review) => (
              <article
                key={review._id || review.id}
                className="flex gap-4 rounded-3xl border border-base-200 bg-base-100 p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <Avatar
                  src={review?.image}
                  name={review?.name}
                  className="h-12 w-12 shrink-0 rounded-full text-sm"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-bold">{review?.name}</h3>
                    <p className="text-xs text-base-content/55">{review?.reviewDate}</p>
                  </div>
                  <div className="mt-1.5">
                    <Rating style={{ maxWidth: 110 }} value={review?.rating} readOnly />
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-base-content/75">
                    {review.feedback}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default My_Reviews;
