import { toast } from "sonner";

type ToastOpts = NonNullable<Parameters<typeof toast.success>[1]>;
type PromiseMessages = { loading: string; success: string; error: string };

/**
 * Premium notification facade over `sonner`.
 * Every call site previously used imperative Swal.fire toasts;
 * this keeps the same one-liner ergonomics with a modern stacked UI.
 */
export const notify = {
  success: (message: string, opts?: ToastOpts) => toast.success(message, opts),
  error: (message: string, opts?: ToastOpts) => toast.error(message, opts),
  warning: (message: string, opts?: ToastOpts) => toast.warning(message, opts),
  info: (message: string, opts?: ToastOpts) => toast(message, opts),
  promise: <T>(promise: Promise<T>, messages: PromiseMessages, opts?: ToastOpts): Promise<T> => {
    toast.promise(promise, { ...messages, ...opts });
    return promise;
  },
};

export default notify;
