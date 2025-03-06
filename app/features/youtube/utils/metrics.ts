import type { HistoricalData } from '../types';

export type TimePeriod = '7d' | '1m' | '3m';
export type MetricType = 'subscriberCount' | 'videoCount' | 'viewCount';

export const getMetricKeyFromLabel = (label: string): MetricType => {
  switch (label.toLowerCase()) {
    case 'subscribers':
      return 'subscriberCount';
    case 'videos':
      return 'videoCount';
    default:
      return 'viewCount';
  }
};

export const getValueForPeriod = (
  historicalData: { [key in TimePeriod]: HistoricalData } | undefined,
  label: string,
  period: TimePeriod
): string => {
  if (!historicalData) return 'N/A';
  
  const metricKey = getMetricKeyFromLabel(label);
  return historicalData[period][metricKey] 
    ? parseInt(historicalData[period][metricKey]).toLocaleString() 
    : 'N/A';
};

export const calculatePercentChange = (
  historicalData: { [key in TimePeriod]: HistoricalData } | undefined,
  currentValue: string,
  label: string,
  period: TimePeriod
): number => {
  if (!historicalData) return 0;
  
  const metricKey = getMetricKeyFromLabel(label);
  const historicalValue = historicalData[period][metricKey] 
    ? parseInt(historicalData[period][metricKey])
    : 0;
    
  const currentNumericValue = parseInt(currentValue);
  const percentChange = historicalValue 
    ? ((currentNumericValue - historicalValue) / historicalValue) * 100 
    : 0;
  
  return parseFloat(percentChange.toFixed(2));
};
