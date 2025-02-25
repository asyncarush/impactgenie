'use client';

import React from 'react';
import { motion } from 'framer-motion';

const ContentSection: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <section className="relative overflow-hidden py-20 px-4">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 -z-10" />
      
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="container mx-auto max-w-4xl"
      >
        <motion.div 
          variants={itemVariants}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Welcome to ImpactGenie
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Unleash your potential with our powerful tools and resources
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          <motion.div
            variants={itemVariants}
            className="p-6 rounded-2xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-xl hover:shadow-2xl transition-shadow duration-300"
          >
            <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
              Discover Your Impact
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Start your journey today and see how we can help you make a lasting difference in the world.
            </p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="p-6 rounded-2xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-xl hover:shadow-2xl transition-shadow duration-300"
          >
            <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
              Powerful Tools
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Access our suite of tools designed to help you succeed and maximize your impact.
            </p>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

export default ContentSection;
