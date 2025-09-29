import React, { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  TimeScale
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import { MoodEntry, BaselineData } from '../../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  TimeScale
);

interface BaselineChartProps {
  moodEntries: Array<MoodEntry & { note: string }>;
  baseline: BaselineData | null;
  timeRange: 'week' | 'month' | 'quarter';
}

const BaselineChart: React.FC<BaselineChartProps> = ({ moodEntries, baseline, timeRange }) => {
  const chartRef = useRef<ChartJS<'line'>>(null);

  // Filter data based on time range
  const getFilteredData = () => {
    const now = new Date();
    const cutoffDate = new Date();
    
    switch (timeRange) {
      case 'week':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        cutoffDate.setDate(now.getDate() - 30);
        break;
      case 'quarter':
        cutoffDate.setDate(now.getDate() - 90);
        break;
    }

    return moodEntries
      .filter(entry => new Date(entry.timestamp) >= cutoffDate)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  };

  const filteredEntries = getFilteredData();

  // Prepare chart data
  const chartData = {
    labels: filteredEntries.map(entry => new Date(entry.timestamp)),
    datasets: [
      {
        label: 'Mood Score',
        data: filteredEntries.map(entry => ({
          x: new Date(entry.timestamp),
          y: entry.intensity
        })),
        borderColor: '#2196F3',
        backgroundColor: 'rgba(33, 150, 243, 0.1)',
        pointBackgroundColor: filteredEntries.map(entry => {
          // Color points based on mood
          const colors = {
            1: '#F44336', // Red for very sad
            2: '#FF9800', // Orange for sad
            3: '#FFC107', // Yellow for neutral
            4: '#4CAF50', // Green for happy
            5: '#8BC34A'  // Light green for very happy
          };
          return colors[entry.intensity as keyof typeof colors] || '#2196F3';
        }),
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
        tension: 0.3,
        fill: false
      },
      // Baseline line
      ...(baseline ? [{
        label: 'Baseline Average',
        data: filteredEntries.map(entry => ({
          x: new Date(entry.timestamp),
          y: baseline.rollingMean
        })),
        borderColor: '#9E9E9E',
        backgroundColor: 'transparent',
        borderDash: [5, 5],
        pointRadius: 0,
        pointHoverRadius: 0,
        tension: 0,
        fill: false
      }] : []),
      // Confidence interval
      ...(baseline ? [{
        label: 'Confidence Range',
        data: filteredEntries.map(entry => ({
          x: new Date(entry.timestamp),
          y: baseline.rollingMean + baseline.rollingStd
        })),
        borderColor: 'rgba(158, 158, 158, 0.3)',
        backgroundColor: 'rgba(158, 158, 158, 0.1)',
        pointRadius: 0,
        pointHoverRadius: 0,
        tension: 0,
        fill: '+1'
      }, {
        label: 'Confidence Range Lower',
        data: filteredEntries.map(entry => ({
          x: new Date(entry.timestamp),
          y: Math.max(1, baseline.rollingMean - baseline.rollingStd)
        })),
        borderColor: 'rgba(158, 158, 158, 0.3)',
        backgroundColor: 'rgba(158, 158, 158, 0.1)',
        pointRadius: 0,
        pointHoverRadius: 0,
        tension: 0,
        fill: false
      }] : [])
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      title: {
        display: false
      },
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          filter: (legendItem: any) => {
            // Hide the confidence range lower bound from legend
            return legendItem.text !== 'Confidence Range Lower';
          },
          usePointStyle: true,
          padding: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#2196F3',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          title: (context: any) => {
            const date = new Date(context[0].parsed.x);
            return date.toLocaleDateString('en-US', {
              weekday: 'short',
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });
          },
          label: (context: any) => {
            const dataset = context.dataset;
            const value = context.parsed.y;
            
            if (dataset.label === 'Mood Score') {
              const moodLabels = {
                1: 'Very Sad',
                2: 'Sad', 
                3: 'Neutral',
                4: 'Happy',
                5: 'Very Happy'
              };
              const moodLabel = moodLabels[value as keyof typeof moodLabels] || 'Unknown';
              return `${dataset.label}: ${value}/5 (${moodLabel})`;
            }
            
            if (dataset.label === 'Baseline Average') {
              return `${dataset.label}: ${value.toFixed(1)}`;
            }
            
            return `${dataset.label}: ${value.toFixed(1)}`;
          },
          afterBody: (context: any) => {
            // Show note if available
            const dataIndex = context[0].dataIndex;
            const entry = filteredEntries[dataIndex];
            if (entry && entry.note && entry.note.trim()) {
              return [`Note: "${entry.note}"`];
            }
            return [];
          }
        }
      }
    },
    scales: {
      x: {
        type: 'time' as const,
        time: {
          displayFormats: {
            hour: 'MMM d, HH:mm',
            day: 'MMM d',
            week: 'MMM d',
            month: 'MMM yyyy'
          },
          tooltipFormat: 'MMM d, yyyy HH:mm'
        },
        title: {
          display: true,
          text: 'Time'
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      },
      y: {
        min: 1,
        max: 5,
        ticks: {
          stepSize: 1,
          callback: function(value: any) {
            const moodLabels = {
              1: '😢 Very Sad',
              2: '😞 Sad',
              3: '😐 Neutral', 
              4: '🙂 Happy',
              5: '😄 Very Happy'
            };
            return moodLabels[value as keyof typeof moodLabels] || value;
          }
        },
        title: {
          display: true,
          text: 'Mood Level'
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      }
    },
    elements: {
      point: {
        hoverBorderWidth: 3
      }
    }
  };

  // Add change point markers if baseline exists
  useEffect(() => {
    if (chartRef.current && baseline?.changePointDetected) {
      const chart = chartRef.current;
      // You could add annotations here for change points
      // This would require the chartjs-plugin-annotation plugin
    }
  }, [baseline]);

  if (filteredEntries.length === 0) {
    return (
      <div className="chart-empty-state">
        <div className="empty-chart-icon">📊</div>
        <h4>No mood data for this period</h4>
        <p>Start logging your mood to see your timeline and baseline analysis.</p>
        <a href="/mood" className="btn btn-primary">
          Log Your Mood
        </a>
      </div>
    );
  }

  return (
    <div className="baseline-chart-container">
      <div className="chart-wrapper" style={{ height: '400px' }}>
        <Line ref={chartRef} data={chartData} options={options} />
      </div>
      
      {baseline && (
        <div className="baseline-stats">
          <div className="baseline-stat">
            <span className="stat-label">Current Baseline:</span>
            <span className="stat-value">{baseline.rollingMean.toFixed(1)}</span>
          </div>
          <div className="baseline-stat">
            <span className="stat-label">Variability:</span>
            <span className="stat-value">±{baseline.rollingStd.toFixed(1)}</span>
          </div>
          {baseline.zScore !== undefined && (
            <div className="baseline-stat">
              <span className="stat-label">Z-Score:</span>
              <span className={`stat-value ${Math.abs(baseline.zScore) > 1.5 ? 'significant' : ''}`}>
                {baseline.zScore.toFixed(2)}
              </span>
            </div>
          )}
          {baseline.changePointDetected && (
            <div className="change-point-alert">
              <span className="alert-icon">⚠️</span>
              Significant mood change detected
            </div>
          )}
        </div>
      )}
      
      <div className="chart-legend-info">
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#2196F3' }}></div>
          <span>Your mood entries over time</span>
        </div>
        {baseline && (
          <>
            <div className="legend-item">
              <div className="legend-line dashed"></div>
              <span>Your personal baseline average</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: 'rgba(158, 158, 158, 0.2)' }}></div>
              <span>Normal variation range</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BaselineChart;
