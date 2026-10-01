import { toast } from "sonner";

/**
 * Premium notification facade over `sonner`.
 * Every call site previously used imperative Swal.fire toasts;
 * this keeps the same one-liner ergonomics with a modern stacked UI.
 */
export const notify = {
  success: (message, opts) => toast.success(message, opts),
  error: (message, opts) => toast.error(message, opts),
  warning: (message, opts) => toast.warning(message, opts),
  info: (message, opts) => toast(message, opts),
  promise: (promise, messages, opts) => toast.promise(promise, messages, opts),
};

export default notify;
