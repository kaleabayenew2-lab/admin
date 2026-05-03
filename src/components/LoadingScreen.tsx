import React from 'react';

interface LoadingScreenProps {
  isVisible: boolean;
  message?: string;
}

export default function LoadingScreen({ isVisible, message = "Loading..." }: LoadingScreenProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900 z-50 flex items-center justify-center">
      <div className="text-center">
        {/* Logo */}
        <div className="mb-8">
          <img 
            src="/src/images/logo.png" 
            alt="FindMed" 
            className="h-20 w-auto mx-auto animate-zoom-in"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        </div>

        {/* 5 Circle Ball Animation */}
        <div className="flex justify-center items-center gap-2 mb-6">
          {[0, 1, 2, 3, 4].map((index) => (
            <div
              key={index}
              className="w-3 h-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full animate-bounce-ball"
              style={{
                animationDelay: `${index * 0.1}s`,
                animationDuration: '1.4s'
              }}
            />
          ))}
        </div>

        {/* Loading Message */}
        <div className="text-gray-600 dark:text-gray-300 font-medium animate-pulse">
          {message}
        </div>
      </div>
    </div>
  );
}
