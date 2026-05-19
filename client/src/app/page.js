"use client";

import { useEffect, useState } from "react";
import API from "./services/api";
import { getSocket } from "./socket";
import FeedCard from "./components/FeedCard";
import LoadingCard from "./components/LoadingCard";

export default function Home() {
  const [feeds, setFeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newFeedId, setNewFeedId] = useState(null);

  useEffect(() => {
    fetchFeeds();

    const socket = getSocket();
    if (!socket) return;

    const handleNewFeed = (newFeed) => {
      setFeeds((prev) => {
        if (prev.some((f) => f._id === newFeed._id)) return prev;
        return [newFeed, ...prev];
      });
      setNewFeedId(newFeed._id);
      setTimeout(() => setNewFeedId(null), 3000);
    };

    socket.on("newFeed", handleNewFeed);
    return () => socket.off("newFeed", handleNewFeed);
  }, []);

  const fetchFeeds = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await API.get("/feed");
      setFeeds(res.data);
    } catch (err) {
      setError("Failed to fetch feeds");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full max-w-sm sm:max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto px-3 sm:px-5 md:px-6 py-5 sm:py-8 md:py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-5 sm:mb-6 md:mb-8 gap-2">
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 truncate">
              Coaching Feed
            </h1>
            {!loading && !error && (
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                {feeds.length} session{feeds.length !== 1 ? "s" : ""} available
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Live badge */}
            <span className="inline-flex items-center gap-1 sm:gap-1.5 text-xs font-medium text-blue-600 bg-blue-50 px-2 sm:px-3 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shrink-0" />
              <span className="hidden xs:inline sm:inline">Live</span>
            </span>

            {/* Refresh button */}
            <button
              onClick={fetchFeeds}
              className="text-sm text-gray-500 hover:text-gray-800 flex items-center gap-1 sm:gap-1.5 transition-colors p-1 sm:p-0"
              aria-label="Refresh feeds"
            >
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="hidden sm:inline text-sm">Refresh</span>
            </button>
          </div>
        </div>

        {/* Loading skeletons */}
        {loading && (
          <div className="flex flex-col gap-2.5 sm:gap-3">
            <LoadingCard />
            <LoadingCard />
            <LoadingCard />
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="flex items-start gap-2.5 sm:gap-3 bg-red-50 border border-red-200 rounded-xl p-3.5 sm:p-4">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-red-700">{error}</p>
              <p className="text-xs text-red-500 mt-0.5 mb-2.5 sm:mb-3">
                Check your connection and try again.
              </p>
              <button
                onClick={fetchFeeds}
                className="text-xs font-medium text-red-600 hover:text-red-800 underline underline-offset-2"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && feeds.length === 0 && (
          <div className="text-center py-12 sm:py-16 md:py-20">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-700">No feeds yet</p>
            <p className="text-xs text-gray-400 mt-1">
              New sessions will appear here in real time.
            </p>
          </div>
        )}

        {/* Feed list */}
        {!loading && !error && feeds.length > 0 && (
          <div className="flex flex-col gap-2.5 sm:gap-3">
            {feeds.map((feed) => (
              <FeedCard
                key={feed._id}
                feed={feed}
                isNew={feed._id === newFeedId}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}