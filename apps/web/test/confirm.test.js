import { describe, it, expect, afterEach } from "vitest";
import { confirmAction } from "../src/lib/confirm.js";

afterEach(() => {
  document.body.innerHTML = "";
});

function click(selector) {
  document.querySelector(selector).dispatchEvent(new MouseEvent("click", { bubbles: true }));
}

describe("confirmAction", () => {
  it("resolves true when the confirm button is clicked", async () => {
    const pending = confirmAction({ title: "Delete?", confirmLabel: "Yes, delete it!" });
    expect(document.querySelector("dialog.modal")).not.toBeNull();
    click("[data-confirm]");
    await expect(pending).resolves.toBe(true);
    expect(document.querySelector("dialog.modal")).toBeNull();
  });

  it("resolves false when cancelled", async () => {
    const pending = confirmAction({ title: "Delete?" });
    click("[data-cancel]");
    await expect(pending).resolves.toBe(false);
  });

  it("renders the title and message", () => {
    confirmAction({ title: "Cancel delivery?", message: "No undo." }).catch(() => {});
    expect(document.body.textContent).toContain("Cancel delivery?");
    expect(document.body.textContent).toContain("No undo.");
  });

  it("escapes html in caller-supplied strings", () => {
    confirmAction({ title: "<img src=x>", message: "<b>hi</b>" }).catch(() => {});
    expect(document.querySelector("img")).toBeNull();
    expect(document.body.textContent).toContain("<img src=x>");
  });
});
