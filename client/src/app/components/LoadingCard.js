export default function LoadingCard() {
  return (
    <div className="bg-white rounded-xl p-3.5 sm:p-4 md:p-5 border border-gray-100 w-full">
      <div className="flex items-start gap-2.5 sm:gap-3 animate-pulse">
        <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full bg-gray-100 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="h-3 sm:h-3.5 bg-gray-100 rounded w-2/5 mb-2 sm:mb-3" />
          <div className="h-2.5 sm:h-3 bg-gray-100 rounded w-full mb-1.5 sm:mb-2" />
          <div className="h-2.5 sm:h-3 bg-gray-100 rounded w-3/4" />
        </div>
      </div>
    </div>
  );
}