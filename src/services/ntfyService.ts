import { UpcomingEpisode } from '../types';

// ntfy.sh topic - configured in .env
const NTFY_TOPIC = import.meta.env.VITE_NTFY_TOPIC || '';
const NTFY_BASE_URL = 'https://ntfy.sh';

// Key to track which episodes have been notified today
const NOTIFIED_EPISODES_KEY = 'ntfy_notified_episodes';
const LAST_NOTIFICATION_DATE_KEY = 'ntfy_last_notification_date';

interface NotifiedEpisode {
  seriesId: number;
  seasonNumber: number;
  episodeNumber: number;
}

/**
 * Get today's date string in YYYY-MM-DD format
 */
const getTodayDateString = (): string => {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
};

/**
 * Check if we already sent notifications today, reset if new day
 */
const getNotifiedEpisodes = (): NotifiedEpisode[] => {
  const lastDate = localStorage.getItem(LAST_NOTIFICATION_DATE_KEY);
  const today = getTodayDateString();
  
  // Reset if new day
  if (lastDate !== today) {
    localStorage.setItem(LAST_NOTIFICATION_DATE_KEY, today);
    localStorage.setItem(NOTIFIED_EPISODES_KEY, JSON.stringify([]));
    return [];
  }
  
  try {
    return JSON.parse(localStorage.getItem(NOTIFIED_EPISODES_KEY) || '[]');
  } catch {
    return [];
  }
};

/**
 * Mark an episode as notified
 */
const markAsNotified = (episode: UpcomingEpisode): void => {
  const notified = getNotifiedEpisodes();
  notified.push({
    seriesId: episode.seriesId,
    seasonNumber: episode.episode.season_number,
    episodeNumber: episode.episode.episode_number
  });
  localStorage.setItem(NOTIFIED_EPISODES_KEY, JSON.stringify(notified));
};

/**
 * Check if an episode was already notified
 */
const wasNotified = (episode: UpcomingEpisode, notifiedList: NotifiedEpisode[]): boolean => {
  return notifiedList.some(n => 
    n.seriesId === episode.seriesId &&
    n.seasonNumber === episode.episode.season_number &&
    n.episodeNumber === episode.episode.episode_number
  );
};

/**
 * Send notification via ntfy.sh
 */
const sendNtfyNotification = async (
  title: string, 
  body: string, 
  options?: {
    priority?: 1 | 2 | 3 | 4 | 5; // 1=min, 3=default, 5=max
    tags?: string[];
    click?: string;
    icon?: string;
  }
): Promise<boolean> => {
  if (!NTFY_TOPIC) {
    console.warn('NTFY_TOPIC not configured. Skipping notification.');
    return false;
  }

  try {
    // Use JSON body to properly handle UTF-8 characters
    const payload: Record<string, unknown> = {
      topic: NTFY_TOPIC,
      title: title,
      message: body,
      priority: options?.priority || 3,
    };

    if (options?.tags?.length) {
      payload.tags = options.tags;
    }

    if (options?.click) {
      payload.click = options.click;
    }

    if (options?.icon) {
      payload.icon = options.icon;
    }

    const response = await fetch(NTFY_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      console.log('✅ Notification sent:', title);
      return true;
    } else {
      console.error('❌ Failed to send notification:', response.statusText);
      return false;
    }
  } catch (error) {
    console.error('❌ Error sending notification:', error);
    return false;
  }
};

/**
 * Check for today's episodes and send notifications
 */
export const checkAndNotifyTodayEpisodes = async (upcomingEpisodes: UpcomingEpisode[]): Promise<void> => {
  if (!NTFY_TOPIC) {
    return;
  }

  const today = getTodayDateString();
  const notifiedList = getNotifiedEpisodes();

  // Filter episodes airing today that haven't been notified yet
  const todayEpisodes = upcomingEpisodes.filter(ep => {
    const isToday = ep.episode.air_date === today;
    const alreadyNotified = wasNotified(ep, notifiedList);
    return isToday && !alreadyNotified;
  });

  if (todayEpisodes.length === 0) {
    return;
  }

  // Send notification for each episode
  for (const episode of todayEpisodes) {
    const seriesName = episode.seriesNameVi || episode.seriesName;
    const episodeInfo = `S${episode.episode.season_number}E${episode.episode.episode_number}`;
    const episodeName = episode.episode.name;

    const title = `🎬 ${seriesName}`;
    const body = `${episodeInfo}: "${episodeName}" phát hôm nay!`;
    
    // Poster as icon (ntfy supports image URLs)
    const posterUrl = episode.posterPath 
      ? `https://image.tmdb.org/t/p/w200${episode.posterPath}`
      : undefined;

    const success = await sendNtfyNotification(title, body, {
      priority: 4, // High priority
      tags: ['tv', 'clapper'], // Emoji tags
      icon: posterUrl,
      click: window.location.origin + '/calendar' // Open calendar when clicked
    });

    if (success) {
      markAsNotified(episode);
    }

    // Small delay between notifications to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }
};
