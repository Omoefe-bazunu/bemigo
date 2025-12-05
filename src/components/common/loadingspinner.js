export default function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center h-64">
      <div className="w-12 h-12 border-4 border-t-4 border-gray-200 border-t-sky-800 rounded-full animate-spin"></div>
    </div>
  );
}
