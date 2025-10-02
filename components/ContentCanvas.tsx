
import React from 'react';
import ContentCard from './ContentCard';
import type { ContentItem } from '../types';

interface ContentCanvasProps {
  items: ContentItem[];
  onCardClick: (item: ContentItem) => void;
  onLike: (item: ContentItem) => void;
  onRegenerate: () => void;
}

const SparklesIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v1.5a.5.5 0 001 0V4a1 1 0 112 0v1.5a.5.5 0 001 0V4a1 1 0 112 0v1.5a.5.5 0 001 0V4a1 1 0 011-1 .999.999 0 011 .999V6a1 1 0 01-1 1h-1.5a.5.5 0 000 1H16a1 1 0 011 1v1.5a.5.5 0 000 1V16a1 1 0 01-1 1h-1.5a.5.5 0 000 1H16a1 1 0 011 1v.001a1 1 0 01-1 1h-1.5a.5.5 0 00-1 0H12a1 1 0 110-2h1.5a.5.5 0 000-1H12a1 1 0 01-1-1v-1.5a.5.5 0 00-1 0V16a1 1 0 11-2 0v-1.5a.5.5 0 00-1 0V16a1 1 0 11-2 0v-1.5a.5.5 0 00-1 0V16a1 1 0 01-1 1H3.999a1 1 0 01-1-1v-1.5a.5.5 0 000-1H4a1 1 0 011-1v-1.5a.5.5 0 000-1V4a1 1 0 011-1h1.5a.5.5 0 000-1H4a1 1 0 01-1-1V3a1 1 0 011-1h1.5a.5.5 0 001 0V3a1 1 0 112 0v-.5a.5.5 0 001 0V3z" clipRule="evenodd" />
    </svg>
)

const ContentCanvas: React.FC<ContentCanvasProps> = ({ items, onCardClick, onLike, onRegenerate }) => {
  return (
    <div className="animate-fade-in">
        <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Your Personal Nexus</h2>
            <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">Discoveries tailored to your evolving consciousness.</p>
            <button 
              onClick={onRegenerate}
              className="mt-6 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 dark:focus:ring-offset-gray-900 transition-transform transform hover:scale-105"
            >
              <SparklesIcon />
              Reveal New Insights
            </button>
        </div>
        <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
            {items.map((item) => (
            <ContentCard
                key={item.id}
                item={item}
                onClick={onCardClick}
                onLike={onLike}
            />
            ))}
        </div>
    </div>
  );
};

export default ContentCanvas;
