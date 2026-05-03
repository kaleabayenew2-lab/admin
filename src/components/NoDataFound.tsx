import React from 'react';

interface NoDataFoundProps {
  onCreateNew: () => void;
  title?: string;
  message?: string;
  buttonText?: string;
  icon?: string;
}

export default function NoDataFound({ 
  onCreateNew, 
  title = "No Data Found", 
  message = "There are no records available at the moment.",
  buttonText = "Create New",
  icon = "📋"
}: NoDataFoundProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      {/* Icon */}
      <div className="mb-6">
        <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
          <span className="text-4xl">{icon}</span>
        </div>
      </div>

      {/* Title */}
      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2 text-center">
        {title}
      </h3>

      {/* Message */}
      <p className="text-gray-600 dark:text-gray-400 text-center mb-8 max-w-md">
        {message}
      </p>

      {/* Create New Button */}
      <button
        onClick={onCreateNew}
        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        {buttonText}
      </button>

      {/* Optional Action Items */}
      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500 dark:text-gray-500">
          Need help? Check our documentation or contact support.
        </p>
      </div>
    </div>
  );
}
