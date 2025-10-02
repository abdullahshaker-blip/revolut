
import React from 'react';
import type { ContentItem } from '../types';

interface ContentCardProps {
  item: ContentItem;
  onClick: (item: ContentItem) => void;
  onLike: (item: ContentItem) => void;
}

const HeartIcon = ({ isLiked }: { isLiked?: boolean }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 transition-colors duration-200 ${isLiked ? 'text-red-500' : 'text-gray-400 group-hover:text-red-400'}`} viewBox="0 0 20 20" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.5}>
    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
  </svg>
);

const ContentCard: React.FC<ContentCardProps> = ({ item, onClick, onLike }) => {
  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onLike(item);
  };
    
  return (
    <div
      onClick={() => onClick(item)}
      className="break-inside-avoid group cursor-pointer bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
    >
      <div className="relative">
        <img
          src={item.imageUrl}
          alt={item.title}
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-4">
           <span className="text-xs font-semibold uppercase tracking-wider bg-white/20 text-white px-2 py-1 rounded-full backdrop-blur-sm">{item.type}</span>
        </div>
      </div>
      <div className="p-5">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-200">
          {item.title}
        </h3>
        <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm leading-relaxed line-clamp-3">
          {item.description}
        </p>
        <div className="mt-4 flex justify-between items-center">
            <div className="flex flex-wrap gap-2">
                {item.tags.slice(0, 2).map(tag => (
                    <span key={tag} className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                        #{tag}
                    </span>
                ))}
            </div>
            <button onClick={handleLikeClick} className="p-2 rounded-full hover:bg-red-100 dark:hover:bg-gray-700" aria-label="Like item">
               <HeartIcon isLiked={item.isLiked} />
            </button>
        </div>
      </div>
    </div>
  );
};

export default ContentCard;
