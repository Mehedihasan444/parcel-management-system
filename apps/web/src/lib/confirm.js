/**
 * Promise-based confirm dialog rendered into a native <dialog> element.
 * Replaces Swal.fire({ showCancelButton: true }) confirms with a
 * dependency-free daisyUI modal that resolves true/false.
 *
 * Usage: if (await confirmAction({ title, message, confirmLabel })) { ... }
 */
export function confirmAction({
  title = "Are you sure?",
  message = "You won't be able to revert this!",
  confirmLabel = "Yes, continue",
  cancelLabel = "Cancel",
  tone = "warning",
} = {}) {
  return new Promise((resolve) => {
    const dialog = document.createElement("dialog");
    dialog.className = "modal";
    dialog.innerHTML = `
      <div class="modal-box">
        <div class="flex items-start gap-3">
          <span class="grid h-10 w-10 shrink-0 place-items-center rounded-xl ${
            tone === "danger" ? "bg-error/10 text-error" : "bg-warning/15 text-warning"
          } text-xl" aria-hidden="true">!</span>
          <div class="min-w-0">
            <h3 class="font-display text-lg font-bold">${escapeHtml(title)}</h3>
            <p class="mt-1 text-sm text-base-content/70">${escapeHtml(message)}</p>
          </div>
        </div>
        <div class="modal-action">
          <button type="button" class="btn btn-ghost" data-cancel>${escapeHtml(cancelLabel)}</button>
          <button type="button" class="btn btn-error text-white" data-confirm>${escapeHtml(confirmLabel)}</button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop"><button>close</button></form>
    `;

    const cleanup = (value) => {
      dialog.close();
      dialog.remove();
      resolve(value);
    };

    dialog.querySelector("[data-confirm]").addEventListener("click", () => cleanup(true));
    dialog.querySelector("[data-cancel]").addEventListener("click", () => cleanup(false));
    dialog.addEventListener("cancel", () => cleanup(false));
    dialog.querySelector(".modal-backdrop button").addEventListener("click", () => cleanup(false));

    document.body.appendChild(dialog);
    dialog.showModal();
  });
}

function escapeHtml(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => {
    switch (c) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      default:
        return "&#39;";
    }
  });
}

export default confirmAction;
