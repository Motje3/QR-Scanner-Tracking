const LoadingSpinner = () => (
  <div className="fixed inset-0 flex flex-col items-center justify-center z-50 bg-transparent" style={{ left: '15%', right: '0' }}>
    <div className="animate-spin rounded-full h-20 w-20 border-t-8 border-b-8 border-white border-solid border-opacity-80 mb-6"></div>
    <span className="text-white text-xl font-semibold tracking-wide mt-0">Laden</span>
  </div>
);

export default LoadingSpinner;
