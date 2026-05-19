"use client";

import { useEffect, useState } from "react";
import API from "../services/api";

export default function AdminPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [backendStatus, setBackendStatus] = useState("checking");

  useEffect(() => {
    const checkBackend = async () => {
      try {
        await API.get("/health", { timeout: 5000 });
        setBackendStatus("online");
        console.log("✓ Backend health check passed");
      } catch (error) {
        console.debug("Backend health check not available:", error.message);
        setBackendStatus("checking");
      }
    };

    checkBackend();
    const interval = setInterval(checkBackend, 30000);
    return () => clearInterval(interval);
  }, []);

  const submitFeed = async (e) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      alert("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      setStatusMessage("Connecting to server...");

      const response = await API.post(
        "/feed",
        { title, description },
        { timeout: 60000 }
      );

      console.log("Feed Added:", response.data);
      setStatusMessage("Feed added successfully!");
      alert("Feed Added Successfully!");

      setTitle("");
      setDescription("");
      setStatusMessage("");
    } catch (error) {
      console.error("Error details:", error);

      let errorMsg = "Unknown error";

      if (error.code === "ECONNABORTED") {
        errorMsg = "Request timeout — backend may be slow to respond. Please try again.";
      } else if (error.response) {
        errorMsg = `Server error: ${error.response.status} — ${
          error.response.data?.message || error.response.statusText
        }`;
      } else if (error.request) {
        errorMsg = "No response from server — check if backend is running.";
      } else {
        errorMsg = error.message;
      }

      console.error("Final error:", errorMsg);
      setStatusMessage(errorMsg);
      alert(`Failed: ${errorMsg}`);
    } finally {
      setLoading(false);
      setTimeout(() => setStatusMessage(""), 5000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-start sm:items-center justify-center px-4 sm:px-6 py-6 sm:py-10 md:py-12">

      <div className="w-full max-w-sm sm:max-w-lg md:max-w-xl bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6 md:p-8">

        {/* Header */}
        <div className="mb-5 sm:mb-6 md:mb-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
            Admin Feed
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Publish a new feed entry to the timeline.
          </p>
        </div>

        <form onSubmit={submitFeed} className="flex flex-col gap-3 sm:gap-4">

          {/* Title input */}
          <div className="flex flex-col gap-1 sm:gap-1.5">
            <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
              Title
            </label>
            <input
              type="text"
              placeholder="Enter a title…"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          {/* Description textarea */}
          <div className="flex flex-col gap-1 sm:gap-1.5">
            <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
              Description
            </label>
            <textarea
              placeholder="Write a description…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full border border-gray-200 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
            />
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className={`
              w-full py-2.5 sm:py-3 px-4 rounded-lg text-sm font-medium text-white transition-all duration-200
              ${loading
                ? "bg-gray-400 cursor-wait"
                : "bg-gray-900 hover:bg-gray-700 active:scale-[0.98]"
              }
            `}
          >
            {loading ? "⏳ Adding… (up to 60 seconds)" : "Add Feed"}
          </button>

          {/* Status message */}
          {statusMessage && (
            <div
              className={`
                w-full p-3 rounded-lg text-xs sm:text-sm leading-relaxed break-words
                ${statusMessage.toLowerCase().includes("success")
                  ? "bg-green-50 text-green-800 border border-green-100"
                  : "bg-yellow-50 text-yellow-800 border border-yellow-100"
                }
              `}
            >
              {statusMessage}
            </div>
          )}

        </form>
      </div>
    </div>
  );
}