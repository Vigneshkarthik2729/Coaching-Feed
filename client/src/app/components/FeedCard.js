export default function FeedCard({ feed, isNew = false }) {

  const initials = feed.title
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  const timeAgo = (dateStr) => {
    const diff = (Date.now() - new Date(dateStr)) / 1000;
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div
      className={`
        bg-white rounded-xl p-5 border transition-all duration-300
        ${isNew
          ? "border-l-2 border-l-blue-400 border-t-gray-100 border-r-gray-100 border-b-gray-100 shadow-sm"
          : "border-gray-100 hover:border-gray-200 hover:shadow-sm"
        }
      `}
    >
      <div className="flex items-start gap-3">

        {/* Avatar */}
        <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-medium shrink-0">
          {initials}
        </div>

        <div className="flex-1 min-w-0">

          {/* Title row */}
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <h2 className="text-sm font-medium text-gray-900 leading-snug">
              {feed.title}
            </h2>
            {isNew && (
              <span className="text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-md">
                New
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-sm text-gray-500 leading-relaxed mb-3">
            {feed.description}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-end">
            <span className="text-xs text-gray-400">
              {timeAgo(feed.createdAt)}
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}