
import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-96 text-center">
      <div className="relative flex items-center justify-center w-24 h-24">
        <div className="absolute w-full h-full rounded-full border-2 border-purple-300 dark:border-purple-700 animate-spin" style={{ animationDuration: '1.5s' }}></div>
        <div className="absolute w-20 h-20 rounded-full border-2 border-blue-300 dark:border-blue-700 animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }}></div>
        <div className="absolute w-16 h-16 rounded-full border-2 border-purple-400 dark:border-purple-600 animate-spin" style={{ animationDuration: '1s' }}></div>
      </div>
      <h2 className="mt-8 text-2xl font-semibold text-gray-700 dark:text-gray-300 tracking-wide">
        Synthesizing Insights...
      </h2>
      <p className="mt-2 text-gray-500 dark:text-gray-400">
        Your personal nexus is evolving.
      </p>
    </div>
  );
};

export default LoadingSpinner;
