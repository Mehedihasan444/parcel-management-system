import { useState } from "react";
import { useForm } from "react-hook-form";
import { FiClock, FiMail, FiMapPin, FiPhone } from "react-icons/fi";
import { notify } from "../lib/notify";
import PageHeader from "../Components/UI/PageHeader";
import FormField, { inputClass } from "../Components/UI/FormField";
import DocumentTitle from "../Components/Seo/DocumentTitle";

const CARDS = [
  {
    icon: FiMail,
    title: "Email",
    body: "support@rapidparcelhub.com",
    hint: "Replies within one business day",
  },
  {
    icon: FiPhone,
    title: "Phone",
    body: "+880 1700-000000",
    hint: "Sat–Thu, 9am–6pm (GMT+6)",
  },
  {
    icon: FiMapPin,
    title: "Hub",
    body: "House 12, Road 5, Gulshan, Dhaka",
    hint: "Drop-offs accepted 9am–8pm",
  },
  {
    icon: FiClock,
    title: "Emergency",
    body: "Live chat in dashboard",
    hint: "Riders on road 24/7",
  },
];

function Contact() {
  const { register, handleSubmit, reset } = useForm();
  const [pending, setPending] = useState(false);

  const onSubmit = async (data) => {
    setPending(true);
    try {
      await new Promise((r) => setTimeout(r, 600));
      reset();
      notify.success(`Thanks ${data.name || "there"} — we received your message`);
    } catch {
      notify.error("Something went wrong");
    } finally {
      setPending(false);
    }
  };

  return (
    <div>
      <DocumentTitle title="RapidParcelHub | Contact" />
      <PageHeader
        eyebrow="Support"
        title="Contact us"
        description="Questions about a shipment, a payment, or becoming a rider? Send a message — we answer within one business day."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {CARDS.map(({ icon: Icon, title, body, hint }) => (
          <div key={title} className="rounded-3xl border border-base-200 bg-base-100 p-5 shadow-sm">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-brand-500/10 text-brand-600">
              <Icon aria-hidden="true" />
            </span>
            <p className="mt-3 text-sm font-semibold uppercase tracking-wider text-base-content/55">
              {title}
            </p>
            <p className="mt-1 font-semibold">{body}</p>
            <p className="mt-1 text-sm text-base-content/60">{hint}</p>
          </div>
        ))}
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mx-auto mt-6 max-w-2xl rounded-3xl border border-base-200 bg-base-100 p-6 shadow-sm sm:p-8"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Name" htmlFor="name">
            <input
              {...register("name")}
              id="name"
              type="text"
              placeholder="Jane Doe"
              className={inputClass}
              required
            />
          </FormField>
          <FormField label="Email" htmlFor="email">
            <input
              {...register("email")}
              id="email"
              type="email"
              placeholder="you@example.com"
              className={inputClass}
              required
            />
          </FormField>
        </div>
        <FormField label="Subject" htmlFor="subject" className="mt-4">
          <input
            {...register("subject")}
            id="subject"
            type="text"
            placeholder="Where is my parcel RPH-8421?"
            className={inputClass}
            required
          />
        </FormField>
        <FormField label="Message" htmlFor="message" className="mt-4">
          <textarea
            {...register("message")}
            id="message"
            rows={5}
            placeholder="Tell us the tracking ID and what you need…"
            className={`${inputClass} min-h-28`}
            required
          />
        </FormField>
        <button
          type="submit"
          disabled={pending}
          className="btn mt-6 w-full border-0 bg-brand-500 font-semibold text-white hover:bg-brand-600 disabled:opacity-70 sm:w-auto sm:px-12"
        >
          {pending ? (
            <span className="loading loading-spinner loading-sm" aria-hidden="true" />
          ) : null}
          {pending ? "Sending…" : "Send message"}
        </button>
      </form>
    </div>
  );
}

export default Contact;
