
import React from 'react';

interface WelcomeScreenProps {
  onStart: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  return (
    <div className="flex flex-col items-center justify-center h-[70vh] text-center animate-fade-in">
        <div className="relative flex items-center justify-center w-24 h-24 mb-6">
            <div className="absolute w-full h-full rounded-full bg-purple-300 dark:bg-purple-700 animate-pulse"></div>
            <div className="absolute w-20 h-20 rounded-full bg-blue-300 dark:bg-blue-700 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="absolute w-16 h-16 rounded-full bg-purple-400 dark:bg-purple-600 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white">Welcome to Nexus Personale</h1>
        <p className="mt-4 max-w-2xl text-lg md:text-xl text-gray-600 dark:text-gray-400">
            An extension of your consciousness. A sanctuary for your curiosity.
            This is not just an app; it's a mental companion that learns and grows with you.
        </p>
        <button
            onClick={onStart}
            className="mt-10 px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-purple-600 to-blue-500 rounded-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-purple-500/50"
        >
            Begin Your Journey
        </button>
    </div>
  );
};

export default WelcomeScreen;
