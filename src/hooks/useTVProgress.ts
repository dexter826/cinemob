import { useState, useEffect } from 'react';
import { getTVShowEpisodeInfo } from '../services/tmdb';
import { Movie } from '../types';

interface TVProgressProps {
    movieToEdit?: Movie;
    tmdbId?: number | string;
    mediaType?: 'movie' | 'tv';
    isTVSeries: boolean;
    isOpen: boolean;
}

/** Hook quản lý tiến độ xem phim bộ (TV Series). */
export const useTVProgress = ({ movieToEdit, tmdbId, mediaType, isTVSeries, isOpen }: TVProgressProps) => {
    const [currentSeason, setCurrentSeason] = useState(1);
    const [currentEpisode, setCurrentEpisode] = useState(0);
    const [totalEpisodes, setTotalEpisodes] = useState(0);
    const [episodesPerSeason, setEpisodesPerSeason] = useState<Record<number, number>>({});
    const [isCompleted, setIsCompleted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!isOpen) return;

        if (movieToEdit && movieToEdit.media_type === 'tv') {
            const m = movieToEdit;
            if (m.source === 'tmdb' && m.id && m.seasons) {
                const fetchInfo = async () => {
                    setIsLoading(true);
                    try {
                        const info = await getTVShowEpisodeInfo(Number(m.id), m.seasons);
                        setTotalEpisodes(info.total_episodes);
                        setEpisodesPerSeason(info.episodes_per_season);
                    } catch (error) {
                        setTotalEpisodes(m.total_episodes || 0);
                    } finally {
                        setIsLoading(false);
                    }
                };
                fetchInfo();
            } else {
                setTotalEpisodes(m.total_episodes || 0);
            }

            if (m.progress) {
                setCurrentSeason(m.progress.current_season || 1);
                setCurrentEpisode(m.progress.current_episode || 0);
                setIsCompleted(m.progress.is_completed || false);
            }
        } else if (!movieToEdit && isTVSeries && tmdbId) {
        } else if (!movieToEdit && !tmdbId) {
            setTotalEpisodes(0);
            setEpisodesPerSeason({});
            setCurrentSeason(1);
            setCurrentEpisode(0);
            setIsCompleted(true);
        }
    }, [isOpen, movieToEdit, isTVSeries, tmdbId]);

    const calculateWatchedEpisodes = (season: number, episode: number, completed: boolean) => {
        if (completed) return totalEpisodes;
        let watched = 0;
        for (let s = 1; s < season; s++) {
            watched += episodesPerSeason[s] || 0;
        }
        watched += episode;
        return watched;
    };

    return {
        currentSeason, setCurrentSeason,
        currentEpisode, setCurrentEpisode,
        totalEpisodes, setTotalEpisodes,
        episodesPerSeason, setEpisodesPerSeason,
        isCompleted, setIsCompleted,
        isLoading,
        calculateWatchedEpisodes
    };
};
