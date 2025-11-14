"use client";

const normalize = (s: string) => s.trim().replace(/\s+/g, " ").toLowerCase();

import { useEffect, useRef, useState } from "react";
import { Camera, Upload } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import Toast from "@/components/Toast";

export function ReportIssueForm() {
  const [formData, setFormData] = useState({
    road_name: "",
    area: "",
    issues: [],
    description: "",
    image: null as File | null,
    video: null as File | null,
  });

  const [roadOptions, setRoadOptions] = useState<string[]>([]);
  const [areaOptions, setAreaOptions] = useState<Array<{ id: number; area: string }>>([]);
  const [locations, setLocations] = useState<Array<{ id: number; road_name: string; area: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [selectedLocId, setSelectedLocId] = useState<number | null>(null);

  // Webcam modal state
  const [cameraOpen, setCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    async function fetchLocations() {
      const { data, error } = await supabase
        .from("locations")
        .select("id, road_name, area");
      if (error) {
        console.error("Error fetching locations:", error);
        return;
      }

      const rows = (data || []) as Array<{ id: number; road_name: string; area: string }>;
      setLocations(rows);
      const roads: string[] = [...new Set(rows.map((item) => item.road_name))];
      const areas: Array<{ id: number; area: string }> = rows.map((r) => ({ id: r.id, area: r.area }));

      setRoadOptions(roads);
      setAreaOptions(areas);
      // If a road/area were already chosen (e.g., from prior state), re-evaluate selectedLocId
      if (formData.road_name && formData.area) {
        const loc = rows.find(
          (r) => normalize(r.road_name) === normalize(formData.road_name) && normalize(r.area) === normalize(formData.area)
        );
        setSelectedLocId(loc ? loc.id : null);
      }
    }

    fetchLocations();
  }, []);

  const issueOptions = ["Potholes", "Cracks"];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "road_name") {
      // When road changes, reset area and filter area options to only those for the selected road
      const filteredAreas = locations
        .filter((r) => normalize(r.road_name) === normalize(value))
        .map((r) => ({ id: r.id, area: r.area }));
      // De-duplicate by area label
      const seen = new Set<string>();
      const uniqueAreas = filteredAreas.filter((a) => {
        const key = normalize(a.area);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      setAreaOptions(uniqueAreas);
      // If only one area matches, auto-select it and compute loc id
      if (uniqueAreas.length === 1) {
        const auto = uniqueAreas[0];
        setFormData({ ...formData, road_name: value, area: auto.area });
        setSelectedLocId(auto.id);
      } else {
        setFormData({ ...formData, road_name: value, area: "" });
        setSelectedLocId(null);
      }
      return;
    }
    if (name === "area") {
      // Here, value is the loc_id string from the select
      const idNum = Number(value);
      setSelectedLocId(Number.isNaN(idNum) ? null : idNum);
      const opt = areaOptions.find((a) => a.id === idNum);
      if (opt) {
        setFormData({ ...formData, area: opt.area });
      }
      return;
    }
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
    setFormData({ ...formData, [e.target.name]: file });
  };

  const toggleIssue = (issue: string) => {
    setFormData((prev: any) => {
      const updated = prev.issues.includes(issue)
        ? prev.issues.filter((i: string) => i !== issue)
        : [...prev.issues, issue];
      return { ...prev, issues: updated };
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.road_name || !formData.area) {
      setToast({ type: "error", message: "Please select a road and area" });
      return;
    }
    setLoading(true);
    try {
      // Use selectedLocId derived from the area selection
      let locIdToUse = selectedLocId;
      if (!locIdToUse) {
        // Fallback: try server lookup with ilike to tolerate minor formatting differences
        const { data: loc, error: locErr } = await supabase
          .from("locations")
          .select("id")
          .ilike("road_name", formData.road_name)
          .ilike("area", formData.area)
          .maybeSingle();
        if (locErr) {
          console.error("Location lookup error:", locErr);
        }
        if (loc && loc.id) {
          locIdToUse = loc.id as number;
          setSelectedLocId(locIdToUse);
        }
      }
      if (!locIdToUse) {
        setToast({ type: "error", message: "Selected location not found. Please choose a valid Road and Area." });
        setLoading(false);
        return;
      }

      const fd = new FormData();
      fd.append("loc_id", String(locIdToUse));
      fd.append("description", formData.description || "");
      fd.append("issues", JSON.stringify((formData as any).issues || []));
      if (formData.image) fd.append("image", formData.image);
      if (formData.video) fd.append("video", formData.video);

      const res = await fetch("/api/road-reports", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) {
        setToast({ type: "error", message: json?.error || "Failed to submit report" });
        setLoading(false);
        return;
      }

      setToast({ type: "success", message: "Report submitted successfully" });
      // Optional reset
      setFormData({ road_name: "", area: "", issues: [], description: "", image: null, video: null });
    } catch (err) {
      console.error(err);
      setToast({ type: "error", message: "Unexpected error while submitting" });
    }
    setLoading(false);
  };

  // Webcam controls
  const openCamera = async () => {
    try {
      setCameraOpen(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480, facingMode: "environment" } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream as any;
        await videoRef.current.play();
      }
    } catch (e) {
      console.error("Camera error", e);
      setToast({ type: "error", message: "Unable to access camera" });
      setCameraOpen(false);
    }
  };

  const closeCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((t) => t.stop());
    }
    setCameraOpen(false);
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    const width = 640;
    const height = 480;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, width, height);
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `capture-${Date.now()}.png`, { type: "image/png" });
        setFormData((prev: any) => ({ ...prev, image: file }));
        setToast({ type: "success", message: "Photo captured" });
      }
      closeCamera();
    }, "image/png");
  };

  return (
    <>
    <form className="space-y-6" onSubmit={handleSubmit}>
      {toast && (
        <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />
      )}
      {/* ROAD DROPDOWN */}
      <div>
        <label className="block font-semibold mb-1 text-gray-800">
          Road Name
        </label>
        <select
          name="road_name"
          onChange={handleChange}
          disabled={loading}
          className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 bg-white text-gray-800"
          value={formData.road_name}
        >
          <option value="">Select Road</option>
          {roadOptions.map((road: string, i: number) => (
            <option key={i} value={road}>
              {road}
            </option>
          ))}
        </select>
      </div>

      {/* AREA DROPDOWN */}
      <div>
        <label className="block font-semibold mb-1 text-gray-800">Area</label>
        <select
          name="area"
          onChange={handleChange}
          disabled={loading}
          className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 bg-white text-gray-800"
          value={selectedLocId ?? ""}
        >
          <option value="">Select Area</option>
          {areaOptions.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.area}
            </option>
          ))}
        </select>
      </div>

      {/* ISSUES CHECKBOX */}
      <div>
        <label className="block font-semibold mb-2 text-gray-800">
          Issues Found
        </label>
        <div className="grid grid-cols-2 gap-3">
          {issueOptions.map((issue, i) => (
            <label key={i} className="flex items-center gap-2 text-gray-800">
              <input
                type="checkbox"
                checked={(formData as any).issues.includes(issue)}
                onChange={() => toggleIssue(issue)}
                disabled={loading}
              />
              {issue}
            </label>
          ))}
        </div>
      </div>

      {/* DESCRIPTION */}
      <div>
        <label className="block font-semibold mb-1 text-gray-800">
          Description
        </label>
        <textarea
          name="description"
          rows={4}
          onChange={handleChange}
          disabled={loading}
          className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 bg-white text-gray-800"
          placeholder="Describe the road issue..."
        />
      </div>

      {/* IMAGE UPLOAD + CAMERA */}
      <div>
        <label className="block font-semibold mb-2 text-gray-800">
          Upload Image
        </label>

        <div className="flex gap-3">
          {/* Choose from file */}
          <label className="flex-1 cursor-pointer border border-gray-300 rounded-lg p-3 text-center hover:bg-gray-50">
            <Upload className="mx-auto mb-1 text-gray-800" />
            <span className="font-medium text-gray-800">Upload Image</span>
            <input
              type="file"
              accept="image/*"
              name="image"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          {/* Capture with Camera */}
          <button
            type="button"
            onClick={openCamera}
            className="flex-1 border border-blue-400 rounded-lg p-3 text-center hover:bg-blue-50"
            disabled={loading}
          >
            <Camera className="mx-auto mb-1 text-blue-600" />
            <span className="font-medium text-blue-600">Open Camera</span>
          </button>
        </div>
      </div>

      {/* VIDEO UPLOAD */}
      <div>
        <label className="block font-semibold mb-2 text-gray-800">
          Upload Video
        </label>
        <label className="cursor-pointer border border-gray-300 rounded-lg p-3 text-center hover:bg-gray-50 block">
          <Upload className="mx-auto mb-1 text-gray-800" />
          <span className="font-medium text-gray-800">Upload Video</span>
          <input
            type="file"
            accept="video/*"
            name="video"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      </div>

      {/* SUBMIT BUTTON */}
      <button
        type="submit"
        className={`w-full bg-blue-600 text-white font-semibold py-3 rounded-lg transition ${
          loading ? "opacity-70 cursor-not-allowed" : "hover:bg-blue-700"
        }`}
        disabled={loading}
        aria-busy={loading}
      >
        {loading ? "Submitting..." : "Submit Report"}
      </button>
    </form>

    {/* Webcam Modal */}
    {cameraOpen && (
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow w-full max-w-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-gray-900">Camera</h4>
            <button onClick={closeCamera} className="text-gray-600 hover:text-gray-900">✕</button>
          </div>
          <div className="relative w-full flex flex-col items-center gap-3">
            <video ref={videoRef} className="w-full max-h-[480px] bg-black rounded" />
            <canvas ref={canvasRef} className="hidden" />
            <div className="flex gap-3">
              <button onClick={capturePhoto} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Capture</button>
              <button onClick={closeCamera} className="bg-gray-200 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-300">Close</button>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
}

export default function ReportIssuePage() {
  return (
    <div className="min-h-screen bg-gray-100 flex justify-center p-6">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-2xl border border-gray-200">
        <h1 className="text-3xl font-bold text-blue-600 mb-6 text-center">
          Report Road Issue
        </h1>

        <ReportIssueForm />
      </div>
    </div>
  );
}
