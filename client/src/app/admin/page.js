"use client";

import { useEffect, useState } from "react";

import API from "../services/api";

export default function AdminPage() {

  const [title, setTitle] = useState("");

  const [description, setDescription] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [statusMessage, setStatusMessage] = useState("");
  
  const [backendStatus, setBackendStatus] = useState("checking");

  // Check backend health on page load (optional - just for monitoring)
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await API.get("/health", { timeout: 5000 });
        setBackendStatus("online");
        console.log("✓ Backend health check passed");
      } catch (error) {
        // Don't block - just log for debugging
        console.debug("Backend health check not available:", error.message);
        setBackendStatus("checking"); // Keep as "checking" so form can proceed
      }
    };

    checkBackend();
    const interval = setInterval(checkBackend, 30000); // Check every 30 seconds
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
      console.log("Starting feed submission...");

      // Increase timeout to 60 seconds for deployed backend
      const response = await API.post("/feed", {
        title,
        description,
      }, {
        timeout: 60000, // 60 seconds
      });

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
        errorMsg = "Request timeout - Backend may be slow to respond. Please try again.";
      } else if (error.response) {
        errorMsg = `Server error: ${error.response.status} - ${error.response.data?.message || error.response.statusText}`;
      } else if (error.request) {
        errorMsg = "No response from server - Check if backend is running";
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

    <div className="max-w-xl mx-auto p-5">

      <h1 className="text-3xl font-bold mb-5">
        Admin Feed Page
      </h1>

      <form
        onSubmit={submitFeed}
        className="flex flex-col gap-4"
      >

        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) =>
            setTitle(e.target.value)
          }
          className="border p-3 rounded"
        />

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) =>
            setDescription(e.target.value)
          }
          className="border p-3 rounded"
        />

        <button
          disabled={loading}
          className={`p-3 rounded text-white font-medium transition-all ${loading ? "bg-gray-400 cursor-wait" : "bg-black hover:bg-gray-800"}`}
        >

          {loading
            ? "⏳ Adding... (can take up to 60 seconds)"
            : "Add Feed"}

        </button>

        {statusMessage && (
          <div className={`p-3 rounded text-sm ${statusMessage.includes("success") ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
            {statusMessage}
          </div>
        )}

      </form>

    </div>
  );
}