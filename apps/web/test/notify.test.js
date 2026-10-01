import { describe, it, expect, vi } from "vitest";

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    promise: vi.fn(),
  },
}));

const { notify } = await import("../src/lib/notify.js");
const { toast } = await import("sonner");

describe("notify", () => {
  it("forwards success, error and warning to sonner", () => {
    notify.success("Saved");
    notify.error("Broken");
    notify.warning("Careful");
    expect(toast.success).toHaveBeenCalledWith("Saved", undefined);
    expect(toast.error).toHaveBeenCalledWith("Broken", undefined);
    expect(toast.warning).toHaveBeenCalledWith("Careful", undefined);
  });
});
