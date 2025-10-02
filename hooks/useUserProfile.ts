import { useState, useEffect, useCallback } from 'react';
import type { UserProfile, InteractionEvent } from '../types';

const PROFILE_KEY = 'nexusPersonaleProfile';

const getDefaultProfile = (): UserProfile => ({
  interactions: { liked: [], viewed: [] },
  interactionHistory: [],
});

export const useUserProfile = () => {
  const [userProfile, setUserProfile] = useState<UserProfile>(getDefaultProfile());
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    try {
      const storedProfile = localStorage.getItem(PROFILE_KEY);
      if (storedProfile) {
        const parsedProfile = JSON.parse(storedProfile);
        setUserProfile(parsedProfile);
        if (parsedProfile.interactionHistory && parsedProfile.interactionHistory.length > 0) {
            setHasInteracted(true);
        }
      }
    } catch (error) {
      console.error("Failed to load user profile:", error);
      localStorage.removeItem(PROFILE_KEY);
    }
  }, []);

  const updateUserProfile = useCallback((eventData: Omit<InteractionEvent, 'timestamp'>) => {
    setUserProfile(currentProfile => {
      const newEvent: InteractionEvent = {
        ...eventData,
        timestamp: new Date().toISOString(),
      };

      const newInteractionHistory = [...currentProfile.interactionHistory, newEvent];

      // Keep history from getting too long, increased for richer data
      const trimmedHistory = newInteractionHistory.slice(-100);

      // The old liked/viewed arrays can still be useful for quick checks, but history is primary
      let newLiked = currentProfile.interactions.liked;
      if (newEvent.eventType === 'like') {
          newLiked = [...new Set([...currentProfile.interactions.liked, newEvent.itemId])];
      }

      const newProfile: UserProfile = {
        interactions: {
          ...currentProfile.interactions,
          liked: newLiked,
          // 'viewed' is now handled by the 'view' eventType.
          viewed: eventData.eventType === 'view' ? [...new Set([...currentProfile.interactions.viewed, eventData.itemId])] : currentProfile.interactions.viewed,
        },
        interactionHistory: trimmedHistory,
      };

      try {
        localStorage.setItem(PROFILE_KEY, JSON.stringify(newProfile));
        if(!hasInteracted) setHasInteracted(true);
      } catch (error) {
        console.error("Failed to save user profile:", error);
      }

      return newProfile;
    });
  }, [hasInteracted]);

  return { userProfile, updateUserProfile, hasInteracted };
};