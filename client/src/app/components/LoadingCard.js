export default function LoadingCard() {
  return (
    <div className="bg-white rounded-xl p-5 border border-gray-100">
      <div className="flex items-start gap-3 animate-pulse">
        <div className="w-9 h-9 rounded-full bg-gray-100 shrink-0" />
        <div className="flex-1">
          <div className="h-3.5 bg-gray-100 rounded w-2/5 mb-3" />
          <div className="h-3 bg-gray-100 rounded w-full mb-2" />
          <div className="h-3 bg-gray-100 rounded w-3/4" />
        </div>
      </div>
    </div>
  );
}