"use client";

// React and Next.js
import { useState, useEffect } from "react";
import Image from "next/image";

// Third-party libraries
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@clerk/nextjs";

// Components - Core
import SpotlightCard from "@/components/SpotlightCards";
import SplitText from "@/components/SplitText";
import Header from "@/app/components/Header";

// Components - Video Upload
import VideoUploadModal from "@/app/components/VideoUploadModal";

// Components - YouTube
import Top10Videos from "@/app/features/youtube/components/Top10Videos";
import MetricCard from "@/app/features/youtube/components/MetricCard";
import { YouTubeIcons } from "@/app/features/youtube/icons";

// Hooks
import { useNextTheme } from "@/app/lib/utils/next-theme";
import { useYouTubeChannel } from "@/app/features/youtube/hooks/useYouTubeChannel";

export default function YouTubeIntegrationPage() {
  const { getSpotlightColor, theme } = useNextTheme();
  const { isSignedIn } = useUser();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { channel, error, isLoading, fetchYouTubeChannel } =
    useYouTubeChannel();

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  useEffect(() => {
    fetchYouTubeChannel();
  }, [fetchYouTubeChannel]);

  // Page transition variants
  const pageVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.5 } },
    exit: { opacity: 0, transition: { duration: 0.3 } },
  };

  return (
    <motion.div
      className={`min-h-screen ${
        theme === "light" ? "bg-gradient-light" : "bg-gradient-custom"
      } transition-colors duration-300 font-poppins`}
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <Header onUploadClick={handleOpenModal} />
      <div className="container mx-auto px-4 py-8">
        <VideoUploadModal isOpen={isModalOpen} onClose={handleCloseModal} />
        {/* YouTube Dashboard title */}
        <motion.div
          className="flex justify-center items-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center">
            <motion.div
              className="icon-container icon-container-youtube mr-4 rounded-2xl"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              {YouTubeIcons.youtube}
            </motion.div>
            <SplitText
              text={`YouTube Dashboard`}
              className="text-3xl font-bold text-gray-800 dark:text-white font-poppins"
              delay={100}
              animationFrom={{ opacity: 0, transform: "translate3d(0,30px,0)" }}
              animationTo={{ opacity: 1, transform: "translate3d(0,0,0)" }}
              easing="easeOutCubic"
              threshold={0.2}
              rootMargin="-20px"
            />
          </div>
        </motion.div>

        {/* Loading state */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              className="flex justify-center items-center h-64"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="h-8 w-8 border-4 border-red-500 dark:border-gray-400 border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              ></motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error state */}
        <AnimatePresence>
          {error && (
            <motion.div
              className={`${
                theme === "dark" ? "bg-black" : "bg-red-50"
              } border-l-4 border-red-500 rounded-lg p-4 mb-6`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <motion.p
                className="text-red-600 dark:text-red-400 font-poppins"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { delay: 0.2 } }}
              >
                {error}
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Channel data display */}
        <AnimatePresence>
          {channel && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              {/* Main channel info with side-by-side layout */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
                {/* Left side - Profile and channel name */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <SpotlightCard
                    className={`lg:col-span-1 p-8 rounded-2xl shadow-md card-custom transition-colors channel-card ${
                      theme === "dark" ? "bg-black" : "bg-white"
                    }`}
                    spotlightColor={getSpotlightColor("red")}
                  >
                    <div className="flex flex-col items-center">
                      {channel.snippet.thumbnails?.medium?.url && (
                        <motion.div
                          className="relative mb-6"
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.5, delay: 0.3 }}
                          whileHover={{ scale: 1.05 }}
                        >
                          <Image
                            src={channel.snippet.thumbnails.medium.url}
                            alt="Youtube Profile"
                            width={120}
                            height={120}
                            className="rounded-full border-2 border-white dark:border-gray-800 shadow-md profile-image"
                          />
                        </motion.div>
                      )}
                      <motion.div
                        className="text-center"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                      >
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-3 font-poppins">
                          {channel.snippet.title}
                        </h2>
                        {channel.snippet.customUrl && (
                          <motion.a
                            href={`https://youtube.com/${channel.snippet.customUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-red-500 dark:text-gray-300 hover:text-red-600 dark:hover:text-white text-sm font-poppins"
                            whileHover={{ scale: 1.05, x: 3 }}
                            transition={{
                              type: "spring",
                              stiffness: 400,
                              damping: 15,
                            }}
                          >
                            <svg
                              className="w-4 h-4 mr-1 text-red-600"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                            </svg>
                            {channel.snippet.customUrl}
                          </motion.a>
                        )}
                      </motion.div>
                    </div>
                  </SpotlightCard>
                </motion.div>

                {/* Right side - Statistics cards */}
                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {channel.statistics && channel.historicalData && (
                    <>
                      <MetricCard
                        label="Subscribers"
                        value={channel.statistics.subscriberCount}
                        historicalData={channel.historicalData}
                        icon={YouTubeIcons.subscribers}
                        spotlightColor={getSpotlightColor("red")}
                        valueColor="text-red-600 dark:text-gray-200"
                        index={0}
                      />

                      <MetricCard
                        label="Videos"
                        value={channel.statistics.videoCount}
                        historicalData={channel.historicalData}
                        icon={YouTubeIcons.videos}
                        spotlightColor={getSpotlightColor("blue")}
                        valueColor="text-blue-600 dark:text-gray-200"
                        index={1}
                      />

                      <MetricCard
                        label="Views"
                        value={channel.statistics.viewCount}
                        historicalData={channel.historicalData}
                        icon={YouTubeIcons.views}
                        spotlightColor={getSpotlightColor("amber")}
                        valueColor="text-amber-600 dark:text-gray-200"
                        index={2}
                      />

                      <div className="col-span-3 text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <p className="flex items-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3 w-3 mr-1 inline"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          Hover over metrics to see historical data for 7, 30,
                          and 90 days simultaneously (simulated for
                          demonstration).
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
          {isSignedIn && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-8"
            >
              {/* Channel Stats */}
              <div>
                <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-white">
                  Channel Analytics
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div
                    className={`${
                      theme === "dark" ? "bg-black" : "bg-white"
                    } rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-800`}
                  >
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Last 10 Views
                    </div>
                    <div className="text-lg font-semibold mt-1 text-gray-800 dark:text-gray-200">
                      {parseInt(
                        channel?.statistics?.last10ViewsCount || "0"
                      ).toLocaleString()}
                    </div>
                  </div>
                  <div
                    className={`${
                      theme === "dark" ? "bg-black" : "bg-white"
                    } rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-800`}
                  >
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Last 10 Likes
                    </div>
                    <div className="text-lg font-semibold mt-1 text-gray-800 dark:text-gray-200">
                      {parseInt(
                        channel?.statistics?.likeCount || "0"
                      ).toLocaleString()}
                    </div>
                  </div>
                  <div
                    className={`${
                      theme === "dark" ? "bg-black" : "bg-white"
                    } rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-800`}
                  >
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Last 10 Comments
                    </div>
                    <div className="text-lg font-semibold mt-1 text-gray-800 dark:text-gray-200">
                      {parseInt(
                        channel?.statistics?.commentCount || "0"
                      ).toLocaleString()}
                    </div>
                  </div>
                  <div
                    className={`${
                      theme === "dark" ? "bg-black" : "bg-white"
                    } rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-800`}
                  >
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Engagement Rate
                    </div>
                    <div className="text-lg font-semibold mt-1 text-gray-800 dark:text-gray-200">
                      {channel?.statistics?.last10ViewsCount
                        ? `${(
                            ((parseInt(channel.statistics.likeCount || "0") +
                              parseInt(
                                channel.statistics.commentCount || "0"
                              )) /
                              parseInt(channel.statistics.last10ViewsCount)) *
                            100
                          ).toFixed(2)}%`
                        : "0%"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Videos Section */}
              <Top10Videos />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
