import { motion } from "framer-motion";
import { useState } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useTheme } from "next-themes";
import SpotlightCard from "@/components/SpotlightCards";
import { getValueForPeriod, calculatePercentChange, TimePeriod } from "../utils/metrics";
import type { HistoricalData } from "../types";

interface MetricCardProps {
  value: string;
  label: string;
  icon?: React.ReactNode;
  spotlightColor?: string;
  valueColor?: string;
  index?: number;
  historicalData?: {
    "7d": HistoricalData;
    "1m": HistoricalData;
    "3m": HistoricalData;
  };
}

const renderTrend = (change: number) => {
  if (change > 0) {
    return (
      <span className="text-green-500 text-xs flex items-center justify-center">
        <TrendingUp size={12} className="mr-0.5" />
        {change}%
      </span>
    );
  } else if (change < 0) {
    return (
      <span className="text-red-500 text-xs flex items-center justify-center">
        <TrendingDown size={12} className="mr-0.5" />
        {change}%
      </span>
    );
  }
  return (
    <span className="text-gray-500 text-xs flex items-center justify-center">
      <Minus size={12} className="mr-0.5" />
      0%
    </span>
  );
};

const MetricCard: React.FC<MetricCardProps> = ({
  value,
  label,
  icon,
  spotlightColor,
  valueColor,
  index = 0,
  historicalData,
}) => {
  const [isHovering, setIsHovering] = useState(false);
  const { theme } = useTheme();

  const renderTimePeriod = (period: TimePeriod) => (
    <div className={`flex-1 text-center ${
      period !== "7d" && period !== "3m" ? "border-l border-r border-gray-200 dark:border-gray-700 px-1" : ""
    }`}>
      <div className="text-xxs text-gray-500 dark:text-gray-400">
        {period === "7d" ? "7d" : period === "1m" ? "30d" : "90d"}
      </div>
      <div className="text-lg font-bold leading-tight">
        {getValueForPeriod(historicalData, label, period)}
      </div>
      <div className="text-xs mt-1">
        {renderTrend(calculatePercentChange(historicalData, value, label, period))}
      </div>
    </div>
  );

  return (
    <div className="relative">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 * (index + 1) }}
        whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <SpotlightCard
          className={`p-6 rounded-2xl shadow-md card-custom transition-colors ${
            theme === "dark" ? "bg-black" : "bg-white"
          }`}
          spotlightColor={spotlightColor || "#4f46e5"}
        >
          <div className="flex flex-col items-center text-center">
            {icon && (
              <motion.div
                className="icon-container mb-4"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.2 * (index + 1) }}
              >
                {icon}
              </motion.div>
            )}
            
            {!isHovering ? (
              <div className="h-24 flex flex-col items-center justify-center">
                <motion.p
                  className={`metric-value ${valueColor || "text-gray-800 dark:text-gray-200"}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 * (index + 1) }}
                >
                  {parseInt(value).toLocaleString()}
                </motion.p>
                <motion.p
                  className="metric-label"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 * (index + 1) }}
                >
                  {label}
                </motion.p>
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full h-24 flex flex-col justify-center"
              >
                <div className="text-xs font-medium mb-1 text-center">{label}</div>
                <div className="flex justify-between items-center gap-1">
                  {renderTimePeriod("7d")}
                  {renderTimePeriod("1m")}
                  {renderTimePeriod("3m")}
                </div>
              </motion.div>
            )}
          </div>
        </SpotlightCard>
      </motion.div>
    </div>
  );
};

export default MetricCard;
