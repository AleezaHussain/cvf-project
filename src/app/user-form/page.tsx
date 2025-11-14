"use client";

import { useEffect, useState } from "react";
import { Camera, Upload } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function ReportIssuePage() {
  const [formData, setFormData] = useState({
    road_name: "",
    area: "",
    issues: [],
    description: "",
    image: null,
    video: null,
  });

  const [roadOptions, setRoadOptions] = useState([]);
  const [areaOptions, setAreaOptions] = useState([]);

  useEffect(() => {
    async function fetchLocations() {
      const { data, error } = await supabase
        .from("locations")
        .select("id, road_name, area");
      if (error) {
        console.error("Error fetching locations:", error);
        return;
      }

      const roads = [...new Set(data.map((item) => item.road_name))];
      const areas = [...new Set(data.map((item) => item.area))];

      setRoadOptions(roads);
      setAreaOptions(areas);
    }

    fetchLocations();
  }, []);

  const issueOptions = ["Potholes", "Cracks"];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.files[0] });
  };

  const toggleIssue = (issue) => {
    setFormData((prev) => {
      const updated = prev.issues.includes(issue)
        ? prev.issues.filter((i) => i !== issue)
        : [...prev.issues, issue];
      return { ...prev, issues: updated };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
    alert("Form submitted! Check console.");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center p-6">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-2xl border border-gray-200">
        <h1 className="text-3xl font-bold text-blue-600 mb-6 text-center">
          Report Road Issue
        </h1>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* ROAD DROPDOWN */}
          <div>
            <label className="block font-semibold mb-1 text-gray-800">
              Road Name
            </label>
            <select
              name="road_name"
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 bg-white text-gray-800"
            >
              <option value="">Select Road</option>
              {roadOptions.map((road, i) => (
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
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 bg-white text-gray-800"
            >
              <option value="">Select Area</option>
              {areaOptions.map((area, i) => (
                <option key={i} value={area}>
                  {area}
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
                    checked={formData.issues.includes(issue)}
                    onChange={() => toggleIssue(issue)}
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
              <label className="flex-1 cursor-pointer border border-blue-400 rounded-lg p-3 text-center hover:bg-blue-50">
                <Camera className="mx-auto mb-1 text-blue-600" />
                <span className="font-medium text-blue-600">Camera</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  name="image"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
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
            className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Submit Report
          </button>
        </form>
      </div>
    </div>
  );
}
