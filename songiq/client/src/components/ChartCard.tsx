import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, Music, Users, Play } from 'lucide-react';

interface ChartCardProps {
  artist: {
    _id: string;
    name: string;
    compositeScore: number;
    momentumScore: number;
    reachScore: number;
    genres?: string[];
    images?: Array<{
      url: string;
      source: string;
    }>;
    metrics?: {
      spotify?: {
        followers: number;
        popularity: number;
      };
      lastfm?: {
        listeners: number;
        playcount: number;
      };
    };
  };
  rank?: number;
}

const ChartCard: React.FC<ChartCardProps> = ({ artist, rank }) => {
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getScoreColor = (score: number): string => {
    if (score >= 70) return 'text-green-600 dark:text-green-400';
    if (score >= 40) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const getMomentumIcon = () => {
    // Show neutral/unknown state for very low momentum scores (likely no growth data)
    if (artist.momentumScore < 10) {
      return null; // Don't show icon for unknown momentum
    }
    if (artist.momentumScore >= 40) {
      return <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />;
    }
    if (artist.momentumScore >= 20) {
      return <TrendingUp className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />;
    }
    return <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />;
  };

  const imageUrl = artist.images?.[0]?.url || artist.images?.[1]?.url;
  const spotifyFollowers = artist.metrics?.spotify?.followers || 0;
  const lastfmListeners = artist.metrics?.lastfm?.listeners || 0;
  const lastfmPlaycount = artist.metrics?.lastfm?.playcount || 0;

  return (
    <Link
      to={`/charts/artist/${artist._id}`}
      className="block bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow p-3 sm:p-4 md:p-6 border border-gray-200 dark:border-gray-700 overflow-hidden w-full"
    >
      <div className="flex items-start space-x-2 sm:space-x-3 md:space-x-4">
        {/* Rank Badge */}
        {rank && (
          <div className="flex-shrink-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-xs sm:text-sm md:text-lg">
              {rank}
            </div>
          </div>
        )}

        {/* Artist Image */}
        {imageUrl ? (
          <div className="flex-shrink-0">
            <img
              src={imageUrl}
              alt={artist.name}
              className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full object-cover shadow-md"
              onError={(e) => {
                // Fallback to placeholder if image fails to load
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const placeholder = target.nextElementSibling as HTMLElement;
                if (placeholder) placeholder.style.display = 'flex';
              }}
            />
            <div className="hidden w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-gray-200 dark:bg-gray-700 items-center justify-center">
              <Music className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-gray-400 dark:text-gray-500" />
            </div>
          </div>
        ) : (
          <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <Music className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-gray-400 dark:text-gray-500" />
          </div>
        )}

        {/* Artist Info */}
        <div className="flex-1 min-w-0 overflow-hidden max-w-full">
          <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 dark:text-white truncate">
            {artist.name}
          </h3>

          {/* Genres */}
          {artist.genres && artist.genres.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-0.5 sm:mt-1 overflow-hidden">
              {artist.genres.slice(0, 2).map((genre, idx) => (
                <span
                  key={idx}
                  className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full truncate max-w-[80px] sm:max-w-none"
                  title={genre}
                >
                  {genre}
                </span>
              ))}
            </div>
          )}

          {/* Scores */}
          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 mt-1.5 sm:mt-2 md:mt-3 flex-wrap">
            <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
              <span className={`text-xs sm:text-sm font-semibold ${getScoreColor(artist.compositeScore)} whitespace-nowrap`}>
                {artist.compositeScore.toFixed(1)}
              </span>
              <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                <span className="hidden sm:inline">Score</span>
                <span className="sm:hidden">S</span>
              </span>
            </div>

            <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
              {getMomentumIcon()}
              <span className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                {artist.momentumScore.toFixed(1)}
              </span>
              <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                <span className="hidden sm:inline">Momentum</span>
                <span className="sm:hidden">Mom</span>
              </span>
            </div>
          </div>

          {/* Metrics */}
          <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 mt-1.5 sm:mt-2 text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 flex-wrap">
            {spotifyFollowers > 0 && (
              <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0 min-w-0">
                <Users className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" />
                <span className="whitespace-nowrap min-w-0">
                  {formatNumber(spotifyFollowers)} <span className="hidden sm:inline">followers</span><span className="sm:hidden">f</span>
                </span>
              </div>
            )}
            {lastfmListeners > 0 && (
              <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0 min-w-0">
                <Users className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" />
                <span className="whitespace-nowrap min-w-0">
                  {formatNumber(lastfmListeners)} <span className="hidden sm:inline">listeners</span><span className="sm:hidden">l</span>
                </span>
              </div>
            )}
            {lastfmPlaycount > 0 && (
              <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0 min-w-0">
                <Play className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" />
                <span className="whitespace-nowrap min-w-0">
                  {formatNumber(lastfmPlaycount)} <span className="hidden sm:inline">plays</span><span className="sm:hidden">p</span>
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ChartCard;

