import React, { useEffect, useRef, useCallback } from 'react';
import type { ContentItem, InteractionEvent } from '../types';

interface ModalProps {
  item: ContentItem;
  onClose: () => void;
  updateUserProfile: (eventData: Omit<InteractionEvent, 'timestamp'>) => void;
}

const Modal: React.FC<ModalProps> = ({ item, onClose, updateUserProfile }) => {
    const openTime = useRef(Date.now());
    const scrollRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    // Scroll tracking refs
    const scrollPositions = useRef<{pos: number, time: number}[]>([]);
    const maxScroll = useRef(0);
    const scrollBounced = useRef(false);

    // Video tracking refs
    const maxPlaybackPercent = useRef(0);
    const lastVideoTime = useRef(0);

    const handleClose = useCallback(() => {
        const durationMs = Date.now() - openTime.current;

        // Report total dwell time
        updateUserProfile({
            itemId: item.id, itemType: item.type, eventType: 'total_dwell_time',
            details: { durationMs }
        });

        // Report quick exit
        if (durationMs < 3000) {
            updateUserProfile({
                itemId: item.id, itemType: item.type, eventType: 'quick_exit',
                details: { durationMs }
            });
        }

        // Report final article scroll metrics
        if (item.type === 'article') {
            if (maxScroll.current > 10) {
                updateUserProfile({
                    itemId: item.id, itemType: item.type, eventType: 'scroll_depth',
                    details: { scrollPercent: maxScroll.current }
                });
            }
            if (scrollBounced.current) {
                updateUserProfile({
                    itemId: item.id, itemType: item.type, eventType: 'scroll_bounce',
                    details: {}
                });
            }
            if (scrollPositions.current.length > 1) {
                const totalDistance = scrollPositions.current.reduce((acc, sp, i, arr) => {
                    if (i === 0) return 0;
                    return acc + Math.abs(sp.pos - arr[i - 1].pos);
                }, 0);
                const totalTime = scrollPositions.current[scrollPositions.current.length - 1].time - scrollPositions.current[0].time;
                if (totalTime > 0) {
                    const speedPxs = totalDistance / (totalTime / 1000); // pixels per second
                    updateUserProfile({
                        itemId: item.id, itemType: item.type, eventType: 'avg_scroll_speed',
                        details: { speedPxs: Math.round(speedPxs) }
                    });
                }
            }
        }
        
        // Report final video progress
        if (item.type === 'video') {
            if (maxPlaybackPercent.current > 5) {
                updateUserProfile({
                    itemId: item.id, itemType: item.type, eventType: 'video_watch_progress',
                    details: { watchPercent: maxPlaybackPercent.current }
                });
            }
        }

        onClose();
    }, [onClose, updateUserProfile, item]);

    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') handleClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [handleClose]);

    useEffect(() => {
        if (item.type !== 'article' || !scrollRef.current) return;
        const contentElement = scrollRef.current;
        const handleScroll = () => {
            const scrollableHeight = contentElement.scrollHeight - contentElement.clientHeight;
            if (scrollableHeight <= 0) return;
            const currentScrollPercent = Math.round((contentElement.scrollTop / scrollableHeight) * 100);
            if (currentScrollPercent > maxScroll.current) maxScroll.current = currentScrollPercent;
            scrollPositions.current.push({pos: contentElement.scrollTop, time: Date.now()});
            if (maxScroll.current > 95 && contentElement.scrollTop < 50) scrollBounced.current = true;
        };
        contentElement.addEventListener('scroll', handleScroll, { passive: true });
        return () => contentElement.removeEventListener('scroll', handleScroll);
    }, [item.type]);

    useEffect(() => {
        if (item.type !== 'article' || !scrollRef.current) return;
        const contentElement = scrollRef.current;
        const handleSelection = () => {
            const selection = window.getSelection();
            if (selection && selection.toString().trim().length > 5) {
                updateUserProfile({
                    itemId: item.id, itemType: item.type, eventType: 'text_selection',
                    details: { selectedText: selection.toString().trim() }
                });
            }
        };
        contentElement.addEventListener('mouseup', handleSelection);
        return () => contentElement.removeEventListener('mouseup', handleSelection);
    }, [item.id, item.type, updateUserProfile]);

    useEffect(() => {
        if (item.type !== 'article' || !scrollRef.current) return;
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const target = entry.target as HTMLElement;
                const entryTime = target.dataset.entryTime ? parseInt(target.dataset.entryTime, 10) : null;
                if (entry.isIntersecting) {
                    target.dataset.entryTime = String(Date.now());
                } else if (entryTime) {
                    const dwellTimeMs = Date.now() - entryTime;
                    if (dwellTimeMs > 2000) {
                        updateUserProfile({
                            itemId: item.id, itemType: item.type, eventType: 'dwell_on_element',
                            details: { durationMs: dwellTimeMs, elementTag: target.tagName.toLowerCase(), elementId: target.id || undefined }
                        });
                    }
                    delete target.dataset.entryTime;
                }
            });
        }, { threshold: 0.8 });
        const elementsToObserve = scrollRef.current.querySelectorAll('p, img, pre');
        elementsToObserve.forEach((el, index) => {
            if (!el.id) el.id = `observed-${item.id}-${index}`;
            observer.observe(el);
        });
        return () => observer.disconnect();
    }, [item.id, item.type, updateUserProfile]);

    useEffect(() => {
        if (item.type !== 'video' || !videoRef.current) return;
        const videoElement = videoRef.current;
        const handleTimeUpdate = () => {
            if (videoElement.duration > 0) {
                const currentPercent = Math.round((videoElement.currentTime / videoElement.duration) * 100);
                if (currentPercent > maxPlaybackPercent.current) maxPlaybackPercent.current = currentPercent;
            }
            lastVideoTime.current = videoElement.currentTime;
        };
        const handleSeeking = () => {
            const seekToS = videoElement.currentTime;
            const seekFromS = lastVideoTime.current;
            if (Math.abs(seekToS - seekFromS) > 2) {
                const eventType = seekToS < seekFromS ? 'video_rewind' : 'video_seek_forward';
                updateUserProfile({
                    itemId: item.id, itemType: item.type, eventType,
                    details: { seekFromS: Math.round(seekFromS), seekToS: Math.round(seekToS) }
                });
            }
        };
        const handleRateChange = () => updateUserProfile({ itemId: item.id, itemType: item.type, eventType: 'video_rate_change', details: { playbackRate: videoElement.playbackRate }});
        const handleVolumeChange = () => updateUserProfile({ itemId: item.id, itemType: item.type, eventType: 'video_volume_change', details: { volume: videoElement.volume, muted: videoElement.muted }});
        
        videoElement.addEventListener('timeupdate', handleTimeUpdate);
        videoElement.addEventListener('seeking', handleSeeking);
        videoElement.addEventListener('ratechange', handleRateChange);
        videoElement.addEventListener('volumechange', handleVolumeChange);

        return () => {
            videoElement.removeEventListener('timeupdate', handleTimeUpdate);
            videoElement.removeEventListener('seeking', handleSeeking);
            videoElement.removeEventListener('ratechange', handleRateChange);
            videoElement.removeEventListener('volumechange', handleVolumeChange);
        };
    }, [item.id, item.type, updateUserProfile]);

    const handleMediaError = (e: React.SyntheticEvent<HTMLImageElement | HTMLVideoElement, Event>) => {
        updateUserProfile({
            itemId: item.id, itemType: item.type, eventType: 'load_error',
            details: { errorSource: (e.target as HTMLElement).tagName.toLowerCase() }
        });
    };

    const renderContent = () => {
        switch (item.type) {
            case 'article':
                return (
                    <div ref={scrollRef} className="prose-sm sm:prose dark:prose-invert max-w-none mt-6 text-gray-600 dark:text-gray-300 leading-relaxed max-h-[calc(80vh-20rem)] overflow-y-auto pr-4">
                        <p className="text-lg italic">{item.description}</p>
                        <div dangerouslySetInnerHTML={{ __html: item.content || '' }} />
                    </div>
                );
            case 'video':
                return (
                    <div className="mt-6">
                        <p className="mb-4 text-gray-600 dark:text-gray-300">{item.description}</p>
                        {item.videoUrl ? (
                             <video ref={videoRef} className="w-full rounded-lg bg-black" controls autoPlay src={item.videoUrl} key={item.videoUrl} onError={handleMediaError}>
                                Your browser does not support the video tag.
                            </video>
                        ) : (
                            <div className="w-full aspect-video bg-gray-200 dark:bg-gray-700 flex items-center justify-center rounded-lg">
                                <p className="text-gray-500">Video content not available.</p>
                            </div>
                        )}
                    </div>
                );
            default:
                return <p className="mt-6 text-base text-gray-600 dark:text-gray-300 leading-relaxed">{item.description}</p>;
        }
    }

    return (
        <div 
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in"
            onClick={handleClose}
        >
            <div 
                className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col animate-slide-up"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="relative">
                    <img src={item.imageUrl} alt={item.title} className="w-full h-64 object-cover rounded-t-xl" onError={handleMediaError} />
                    <button onClick={handleClose} className="absolute top-4 right-4 bg-white/50 dark:bg-black/50 text-gray-800 dark:text-white rounded-full p-2 hover:bg-white dark:hover:bg-black transition z-10" aria-label="Close modal">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="p-6 sm:p-8 flex-grow overflow-y-hidden flex flex-col">
                    <span className="text-sm font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400">{item.type}</span>
                    <h2 className="text-3xl font-extrabold mt-2 text-gray-900 dark:text-white">{item.title}</h2>
                    <div className="mt-4 flex flex-wrap gap-2">
                        {item.tags.map(tag => (
                            <span key={tag} className="text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                                #{tag}
                            </span>
                        ))}
                    </div>
                    <div className="flex-grow overflow-y-hidden">
                        {renderContent()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Modal;