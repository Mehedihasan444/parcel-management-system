import { useState } from "react";
import { FiDownload, FiUpload, FiCheckCircle, FiAlertTriangle } from "react-icons/fi";
import useAxiosSecure from "../Hooks/useAxiosSecure";
import PageHeader from "../Components/UI/PageHeader";
import DocumentTitle from "../Components/Seo/DocumentTitle";

const SAMPLE_CSV = `name,email,phone,parcelType,weight,receiverName,receiverPhone,deliveryAddressLatitude,deliveryAddressLongitude,requestedDeliveryDate
John Doe,john@example.com,+8801712345678,Documents,1.5,Jane Smith,+8801812345678,23.8103,90.4125,2026-10-15
Jane Smith,jane@example.com,+8801912345678,Electronics,2.0,Bob Wilson,+8801512345678,23.7465,90.3763,2026-10-16`;

const REQUIRED_FIELDS = [
  "name",
  "email",
  "phone",
  "parcelType",
  "weight",
  "receiverName",
  "receiverPhone",
  "deliveryAddressLatitude",
  "deliveryAddressLongitude",
  "requestedDeliveryDate",
];

const BulkShipping = () => {
  const axiosSecure = useAxiosSecure();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [result, setResult] = useState(null);
  const [pending, setPending] = useState(false);

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.name.endsWith(".csv")) {
      alert("Please select a CSV file");
      return;
    }
    setFile(f);
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      // Parse preview (first 5 rows)
      const lines = content.trim().split("\n");
      const headers = lines[0].split(",").map((h) => h.trim());
      const previewRows = lines.slice(1, 6).map((line) => {
        const values = line.split(",").map((v) => v.trim());
        return Object.fromEntries(headers.map((h, i) => [h, values[i]]));
      });
      setPreview(previewRows);
    };
    reader.readAsText(f);
  };

  const handleDownloadTemplate = () => {
    const blob = new Blob([SAMPLE_CSV], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "bulk-shipping-template.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a CSV file first");
      return;
    }
    setPending(true);
    setResult(null);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await axiosSecure.post("/bulk-shipping/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult({ success: true, ...res.data });
    } catch (error) {
      const data = error.response?.data;
      if (data?.errors) {
        setResult({ success: false, errors: data.errors, validCount: data.validCount });
      } else {
        setResult({ success: false, error: data?.message || "Upload failed" });
      }
    } finally {
      setPending(false);
    }
  };

  const renderResult = () => {
    if (!result) return null;
    if (result.success) {
      return (
        <div className="rounded-3xl border border-emerald-500/25 bg-emerald-500/5 p-5 mb-5">
          <div className="flex items-center gap-3">
            <FiCheckCircle className="text-emerald-500 text-2xl" />
            <div>
              <p className="font-semibold text-emerald-700">Upload Successful</p>
              <p className="text-sm text-emerald-600">{result.message}</p>
              {result.created !== undefined && (
                <p className="text-sm text-emerald-600">
                  Created: {result.created} | Failed: {result.failed || 0}
                </p>
              )}
            </div>
          </div>
          {result.errors?.length > 0 && (
            <details className="mt-3">
              <summary className="cursor-pointer text-sm text-emerald-600">
                Errors ({result.errors.length})
              </summary>
              <ul className="mt-2 text-sm text-emerald-600 space-y-1">
                {result.errors.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </details>
          )}
        </div>
      );
    }
    return (
      <div className="rounded-3xl border border-rose-500/25 bg-rose-500/5 p-5 mb-5">
        <div className="flex items-center gap-3">
          <FiAlertTriangle className="text-rose-500 text-2xl" />
          <div>
            <p className="font-semibold text-rose-700">Upload Failed</p>
            <p className="text-sm text-rose-600">{result.error || "Unknown error"}</p>
            {result.errors?.length > 0 && (
              <details className="mt-3">
                <summary className="cursor-pointer text-sm text-rose-600">
                  Validation Errors ({result.errors.length})
                </summary>
                <ul className="mt-2 text-sm text-rose-600 space-y-1">
                  {result.errors.map((e, i) => (
                    <li key={i}>{e}</li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <DocumentTitle title="RapidParcelHub | Bulk Shipping" />
      <PageHeader
        eyebrow="Partner Tools"
        title="Bulk Shipping"
        description="Upload CSV files to create multiple shipments at once. Download the template, fill in your data, and upload."
      />

      <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
        {/* Sidebar */}
        <aside className="lg:sticky lg:top-20">
          <div className="rounded-3xl border border-base-200 bg-base-100 p-5 shadow-sm">
            <h3 className="font-display text-lg font-bold mb-4">Quick Actions</h3>
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="btn btn-outline w-full justify-start gap-2 mb-3"
            >
              <FiDownload aria-hidden="true" /> Download Template
            </button>
            <div className="p-3 rounded-xl bg-base-200/50 text-sm text-base-content/70">
              <p className="font-semibold mb-2">CSV Format</p>
              <ul className="space-y-1">
                {REQUIRED_FIELDS.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-brand-500" />
                    <code className="font-mono text-xs">{f}</code>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-5 rounded-3xl border border-base-200 bg-base-100 p-5 shadow-sm">
            <h3 className="font-display text-base font-bold mb-3">Upload Status</h3>
            {file ? (
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-semibold">{file.name}</span>
                </p>
                <p className="text-xs text-base-content/50">{(file.size / 1024).toFixed(1)} KB</p>
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    setPreview([]);
                  }}
                  className="btn btn-ghost btn-sm w-full"
                >
                  Remove
                </button>
              </div>
            ) : (
              <p className="text-sm text-base-content/50">No file selected</p>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <div>
          <PageHeader
            eyebrow="Partner Tools"
            title="Bulk Shipping"
            description="Upload CSV files to create multiple shipments at once. Download the template, fill in your data, and upload."
          />

          <div className="rounded-3xl border border-base-200 bg-base-100 p-5 shadow-sm">
            <h3 className="font-display text-base font-bold mb-3">Download Template</h3>
            <p className="text-sm text-base-content/60 mb-4">
              Download the CSV template, fill in your shipment data, and upload it below. The
              template includes all required fields and sample data.
            </p>
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="btn btn-primary gap-2"
            >
              <FiDownload aria-hidden="true" /> Download CSV Template
            </button>
          </div>

          <div className="mt-5 rounded-3xl border border-base-200 bg-base-100 p-5 shadow-sm">
            <h3 className="font-display text-base font-bold mb-3">Upload CSV File</h3>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="file-input file-input-bordered w-full mb-4"
              disabled={pending}
            />
            {file && (
              <div className="mb-4 p-3 rounded-xl bg-base-200/50">
                <p className="font-semibold">{file.name}</p>
                <p className="text-xs text-base-content/50">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            )}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleUpload}
                disabled={pending || !file}
                className="btn btn-primary"
              >
                {pending ? (
                  <>
                    <span className="loading loading-spinner loading-sm mr-2" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <FiUpload className="mr-2" />
                    Upload & Create Shipments
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setPreview([]);
                }}
                disabled={!file || pending}
                className="btn btn-ghost"
              >
                <FiAlertTriangle className="mr-2" />
                Clear
              </button>
            </div>
          </div>

          {preview.length > 0 && (
            <div className="mt-5">
              <h4 className="font-semibold mb-2">Preview (first 5 rows)</h4>
              <div className="overflow-x-auto rounded-3xl border border-base-200 bg-base-100 shadow-sm">
                <table className="table w-full">
                  <thead>
                    <tr className="bg-base-200/50 text-xs uppercase tracking-wider text-base-content/60">
                      {REQUIRED_FIELDS.map((f) => (
                        <th key={f}>{f}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row, i) => (
                      <tr key={i} className="hover">
                        {REQUIRED_FIELDS.map((f) => (
                          <td key={f} className="text-sm">
                            {row[f] || "—"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {renderResult()}
        </div>
      </div>
    </div>
  );
};

export default BulkShipping;
