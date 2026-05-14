export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-accent-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary-500 text-white mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 14c1.5-2 2-4 2-6 0-3.3-2.7-6-6-6-1.5 0-2.9.6-4 1.5-1.1-.9-2.5-1.5-4-1.5-3.3 0-6 2.7-6 6 0 2 .5 4 2 6l4 4 4-4z"/>
              <path d="M7 10v2"/>
              <path d="M11 10v2"/>
              <path d="M9 8v4"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">MediCore MRMS</h1>
          <p className="text-sm text-gray-500 mt-1">CareTrack Clinic</p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
