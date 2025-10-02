import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import ContentCanvas from './components/ContentCanvas';
import Modal from './components/Modal';
import LoadingSpinner from './components/LoadingSpinner';
import WelcomeScreen from './components/WelcomeScreen';
import { useTheme } from './hooks/useTheme';
import { useUserProfile } from './hooks/useUserProfile';
import { generateContentForUser } from './services/geminiService';
import type { ContentItem } from './types';

const App: React.FC = () => {
  const [theme, toggleTheme] = useTheme();
  const { userProfile, updateUserProfile, hasInteracted } = useUserProfile();
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true);
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);

  const fetchContent = useCallback(async () => {
    setIsLoading(true);
    try {
      const items = await generateContentForUser(userProfile);
      setContentItems(items);
    } catch (error) {
      console.error("Failed to fetch content:", error);
      // Here you could set an error state and display a message to the user
    } finally {
      setIsLoading(false);
      if(isInitialLoad) setIsInitialLoad(false);
    }
  }, [userProfile, isInitialLoad]);

  useEffect(() => {
    // Only fetch content on initial mount
    fetchContent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCardClick = (item: ContentItem) => {
    setSelectedItem(item);
    updateUserProfile({
        itemId: item.id,
        itemType: item.type,
        eventType: 'view',
        details: {}
    });
  };

  const handleLike = (item: ContentItem) => {
    setContentItems(prevItems =>
      prevItems.map(i =>
        i.id === item.id ? { ...i, isLiked: !i.isLiked } : i
      )
    );
    if (!item.isLiked) {
      updateUserProfile({
        itemId: item.id,
        itemType: item.type,
        eventType: 'like',
        details: {}
       });
    }
  };

  const handleCloseModal = () => {
    setSelectedItem(null);
  };
  
  const handleStart = () => {
      setIsInitialLoad(false);
      fetchContent();
  }
  
  const handleRegenerate = () => {
      fetchContent();
  }

  return (
    <div className={`min-h-screen font-sans text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-900 transition-colors duration-500`}>
      <Header theme={theme} toggleTheme={toggleTheme} />
      <main className="container mx-auto px-4 py-8">
        {isInitialLoad && !hasInteracted ? (
             <WelcomeScreen onStart={handleStart} />
        ) : isLoading ? (
          <LoadingSpinner />
        ) : (
          <ContentCanvas 
            items={contentItems} 
            onCardClick={handleCardClick} 
            onLike={handleLike} 
            onRegenerate={handleRegenerate}
          />
        )}
      </main>
      {selectedItem && <Modal item={selectedItem} onClose={handleCloseModal} updateUserProfile={updateUserProfile} />}
    </div>
  );
};

export default App;