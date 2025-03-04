import { motion } from "framer-motion";
import SpotlightCard from "@/components/SpotlightCards";

interface MetricCardProps {
  value: string;
  label: string;
  icon: React.ReactNode;
  spotlightColor: string;
  valueColor: string;
  index?: number;
}

const MetricCard: React.FC<MetricCardProps> = ({
  value,
  label,
  icon,
  spotlightColor,
  valueColor,
  index = 0,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.1 * (index + 1) }}
    whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
  >
    <SpotlightCard
      className="p-6 rounded-2xl shadow-md card-custom transition-colors"
      spotlightColor={spotlightColor}
    >
      <div className="flex flex-col items-center text-center">
        <motion.div
          className="icon-container mb-4"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 * (index + 1) }}
        >
          {icon}
        </motion.div>
        <motion.p
          className={`metric-value ${valueColor}`}
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
    </SpotlightCard>
  </motion.div>
);

export default MetricCard;
