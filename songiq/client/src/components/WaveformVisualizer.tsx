import React, { useEffect, useRef, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface WaveformVisualizerProps {
  waveformData: number[];
  duration: number;
  title?: string;
  height?: number;
  showControls?: boolean;
  onTimeSelect?: (time: number) => void;
  className?: string;
}

interface WaveformState {
  isPlaying: boolean;
  currentTime: number;
  playbackRate: number;
  zoomLevel: number;
  selectedRegion: { start: number; end: number } | null;
}

const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({
  waveformData,
  duration,
  title = 'Audio Waveform',
  height = 200,
  showControls = true,
  onTimeSelect,
  className = '',
}) => {
  const chartRef = useRef<ChartJS>(null);
  const [state, setState] = useState<WaveformState>({
    isPlaying: false,
    currentTime: 0,
    playbackRate: 1,
    zoomLevel: 1,
    selectedRegion: null,
  });

  // Prepare data for Chart.js
  const prepareChartData = () => {
    const timePoints = waveformData.map((_, index) => {
      const time = (index / waveformData.length) * duration;
      return time.toFixed(2);
    });

    return {
      labels: timePoints,
      datasets: [
        {
          label: 'Waveform',
          data: waveformData,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 1,
          fill: true,
          tension: 0.1,
          pointRadius: 0,
          pointHoverRadius: 3,
          pointHoverBackgroundColor: 'rgb(59, 130, 246)',
          pointHoverBorderColor: '#fff',
          pointHoverBorderWidth: 2,
        },
      ],
    };
  };

  // Chart options
  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: title,
        color: 'rgb(156, 163, 175)',
        font: {
          size: 14,
          weight: 'normal',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'rgb(255, 255, 255)',
        bodyColor: 'rgb(255, 255, 255)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          title: (context) => {
            const time = parseFloat(context[0].label);
            const minutes = Math.floor(time / 60);
            const seconds = Math.floor(time % 60);
            return `${minutes}:${seconds.toString().padStart(2, '0')}`;
          },
          label: (context) => {
            const amplitude = context.parsed.y;
            return `Amplitude: ${amplitude.toFixed(3)}`;
          },
        },
      },
    },
    scales: {
      x: {
        type: 'linear',
        display: true,
        title: {
          display: true,
          text: 'Time (seconds)',
          color: 'rgb(156, 163, 175)',
        },
        grid: {
          color: 'rgba(156, 163, 175, 0.1)',
        },
        ticks: {
          color: 'rgb(156, 163, 175)',
          callback: (value) => {
            const time = Number(value);
            const minutes = Math.floor(time / 60);
            const seconds = Math.floor(time % 60);
            return `${minutes}:${seconds.toString().padStart(2, '0')}`;
          },
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Amplitude',
          color: 'rgb(156, 163, 175)',
        },
        grid: {
          color: 'rgba(156, 163, 175, 0.1)',
        },
        ticks: {
          color: 'rgb(156, 163, 175)',
        },
        min: -1,
        max: 1,
      },
    },
    elements: {
      point: {
        hoverRadius: 6,
      },
    },
  };

  // Handle chart click
  const handleChartClick = (event: any) => {
    if (!chartRef.current) return;

    const canvasPosition = chartRef.current.canvas.getBoundingClientRect();
    const clickX = event.clientX - canvasPosition.left;
    const chartArea = chartRef.current.chartArea;
    
    if (clickX >= chartArea.left && clickX <= chartArea.right) {
      const xScale = chartRef.current.scales.x;
      const time = xScale.getValueForPixel(clickX);
      
      if (time !== null && time !== undefined && time >= 0 && time <= duration) {
        setState(prev => ({ ...prev, currentTime: time }));
        onTimeSelect?.(time);
      }
    }
  };

  // Playback controls
  const togglePlayback = () => {
    setState(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
  };

  const setPlaybackRate = (rate: number) => {
    setState(prev => ({ ...prev, playbackRate: rate }));
  };

  const setZoomLevel = (level: number) => {
    setState(prev => ({ ...prev, zoomLevel: Math.max(0.1, Math.min(5, level)) }));
  };

  const seekToTime = (time: number) => {
    const clampedTime = Math.max(0, Math.min(duration, time));
    setState(prev => ({ ...prev, currentTime: clampedTime }));
    onTimeSelect?.(clampedTime);
  };

  // Format time for display
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Auto-playback simulation
  useEffect(() => {
    if (!state.isPlaying) return;

    const interval = setInterval(() => {
      setState(prev => {
        const newTime = prev.currentTime + (0.1 * prev.playbackRate);
        if (newTime >= duration) {
          return { ...prev, isPlaying: false, currentTime: 0 };
        }
        return { ...prev, currentTime: newTime };
      });
    }, 100);

    return () => clearInterval(interval);
  }, [state.isPlaying, state.playbackRate, duration]);

  return (
    <div className={`waveform-visualizer ${className}`}>
      <div className="waveform-container" style={{ height: `${height}px` }}>
        <Line
          ref={chartRef as any}
          data={prepareChartData()}
          options={chartOptions}
          onClick={handleChartClick}
        />
      </div>

      {showControls && (
        <div className="waveform-controls mt-4 space-y-3">
          {/* Playback Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={togglePlayback}
                className="px-3 py-1 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
              >
                {state.isPlaying ? '⏸️ Pause' : '▶️ Play'}
              </button>
              
              <button
                onClick={() => seekToTime(0)}
                className="px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                ⏮️ Reset
              </button>
            </div>

            <div className="text-sm text-gray-600 dark:text-gray-400">
              {formatTime(state.currentTime)} / {formatTime(duration)}
            </div>
          </div>

          {/* Time Slider */}
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-600 dark:text-gray-400 w-12">
              Time:
            </span>
            <input
              type="range"
              min="0"
              max={duration}
              step="0.1"
              value={state.currentTime}
              onChange={(e) => seekToTime(parseFloat(e.target.value))}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400 w-16">
              {formatTime(state.currentTime)}
            </span>
          </div>

          {/* Playback Rate */}
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-600 dark:text-gray-400 w-20">
              Speed:
            </span>
            <select
              value={state.playbackRate}
              onChange={(e) => setPlaybackRate(parseFloat(e.target.value))}
              className="px-2 py-1 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600"
            >
              <option value={0.5}>0.5x</option>
              <option value={0.75}>0.75x</option>
              <option value={1}>1x</option>
              <option value={1.25}>1.25x</option>
              <option value={1.5}>1.5x</option>
              <option value={2}>2x</option>
            </select>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-600 dark:text-gray-400 w-16">
              Zoom:
            </span>
            <button
              onClick={() => setZoomLevel(state.zoomLevel - 0.5)}
              className="px-2 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              -
            </button>
            <span className="text-sm text-gray-600 dark:text-gray-400 w-8">
              {state.zoomLevel.toFixed(1)}x
            </span>
            <button
              onClick={() => setZoomLevel(state.zoomLevel + 0.5)}
              className="px-2 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              +
            </button>
          </div>
        </div>
      )}

      {/* Waveform Statistics */}
      <div className="waveform-stats mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="text-sm text-gray-600 dark:text-gray-400">Duration</div>
          <div className="text-lg font-semibold">{formatTime(duration)}</div>
        </div>
        <div className="stat-card">
          <div className="text-sm text-gray-600 dark:text-gray-400">Samples</div>
          <div className="text-lg font-semibold">{waveformData.length.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div className="text-sm text-gray-600 dark:text-gray-400">Max Amplitude</div>
          <div className="text-lg font-semibold">
            {Math.max(...waveformData.map(Math.abs)).toFixed(3)}
          </div>
        </div>
        <div className="stat-card">
          <div className="text-sm text-gray-600 dark:text-gray-400">RMS Energy</div>
          <div className="text-lg font-semibold">
            {Math.sqrt(waveformData.reduce((sum, val) => sum + val * val, 0) / waveformData.length).toFixed(3)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaveformVisualizer; 