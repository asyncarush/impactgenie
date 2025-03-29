// React and Hooks
import { useState, useRef, useEffect } from "react";

// Third-party Libraries
import { useAuth } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";

// Icons
import { IoClose, IoChevronDown, IoChevronUp } from "react-icons/io5";

interface VideoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const VideoUploadModal: React.FC<VideoUploadModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { userId } = useAuth();
  const [isMinimized, setIsMinimized] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // YouTube video categories (based on YouTube Data API v3)
  const VIDEO_CATEGORIES = [
    { id: "1", name: "Film & Animation" },
    { id: "2", name: "Autos & Vehicles" },
    { id: "10", name: "Music" },
    { id: "15", name: "Pets & Animals" },
    { id: "17", name: "Sports" },
    { id: "19", name: "Travel & Events" },
    { id: "20", name: "Gaming" },
    { id: "23", name: "Comedy" },
    { id: "24", name: "Entertainment" },
    { id: "25", name: "News & Politics" },
    { id: "26", name: "Howto & Style" },
    { id: "27", name: "Education" },
    { id: "28", name: "Science & Technology" },
    { id: "29", name: "Nonprofits & Activism" },
  ];

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    privacy: "private",
    thumbnail: null as File | null,
    videoFile: null as File | null,
    tags: "",
    category: "24", // Default to Entertainment
  });

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "thumbnail" | "videoFile"
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, [type]: file }));
    }

    if (type === "videoFile") {
      // do call to ML backend for processing the video for title and description suggestion
      const form = new FormData();
      form.append("videoFile", file!);

      try {
        const response = await fetch(`/api/ml/uploadVideo?userId=${userId}`, {
          method: "POST",
          body: form,
        });
        const data = await response.json();
        console.log("Getting suggestion from ML :", data);
      } catch (err) {
        console.error("Error in getting suggestion from ML :", err);
      }
    }
  };

  const handleMinimize = () => setIsMinimized(!isMinimized);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cleanup function for active intervals
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, []);

  // Poll upload progress
  const pollProgress = async (pollInterval: ReturnType<typeof setInterval>) => {
    if (!userId) return;

    try {
      const response = await fetch(`/api/youtube/upload?userId=${userId}`);
      const data = await response.json();

      if (data.progress !== undefined) {
        setUploadProgress(data.progress);

        // If upload is complete (100%), stop polling
        if (data.progress === 100) {
          clearInterval(pollInterval);
        }
      }
    } catch (err) {
      console.error("Error polling progress:", err);
      clearInterval(pollInterval);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    // Clear any existing interval
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }

    try {
      if (!userId) {
        throw new Error("You must be logged in to upload videos");
      }

      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value) formDataToSend.append(key, value);
      });
      formDataToSend.append("userId", userId);

      // Start polling for progress
      pollIntervalRef.current = setInterval(
        () => pollProgress(pollIntervalRef.current!),
        1000
      );

      // Upload the video
      const response = await fetch("/api/youtube/upload", {
        method: "POST",
        body: formDataToSend,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Upload failed");
      }

      // Clear any remaining poll interval
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }

      // Show success message and close modal
      console.log("Upload successful:", result);
      onClose();
    } catch (err) {
      // Clear poll interval on error
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
      setError(
        err instanceof Error ? err.message : "An error occurred during upload"
      );
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`fixed inset-0 z-50 ${isMinimized ? "h-16" : "h-full"}`}
      >
        {/* <div
          className="fixed inset-0 bg-black bg-opacity-50"
          onClick={!isMinimized ? onClose : undefined}
        /> */}

        <motion.div
          className={`fixed ${
            isMinimized ? "bottom-0 left-0" : "top-1/2 left-1/2"
          } 
                     ${isMinimized ? "w-64" : "w-[90vw] max-w-[560px]"} 
                     transform ${
                       isMinimized
                         ? "translate-y-0"
                         : "-translate-x-1/2 -translate-y-1/2"
                     }
                     bg-white dark:bg-black rounded-lg shadow-lg overflow-hidden
                     border border-gray-200/50 dark:border-gray-800/50`}
        >
          {/* Header */}
          <div className="flex items-center justify-between bg-white dark:bg-black border-b border-gray-100 dark:border-gray-900 px-5 py-4 cursor-move">
            <h3 className="text-base font-medium text-gray-700 dark:text-gray-200 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-gray-500 dark:text-gray-400"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 4-8 4z" />
              </svg>
              Upload to YouTube
            </h3>
            <div className="flex gap-2">
              <button
                onClick={handleMinimize}
                className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 rounded transition-colors"
                aria-label={isMinimized ? "Expand" : "Minimize"}
              >
                {isMinimized ? (
                  <IoChevronUp className="w-5 h-5" />
                ) : (
                  <IoChevronDown className="w-5 h-5" />
                )}
              </button>
              <button
                onClick={onClose}
                className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 rounded transition-colors"
                aria-label="Close"
              >
                <IoClose className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className="px-6 py-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/30 dark:to-blue-900/30 border-b border-purple-100 dark:border-purple-800">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent" />
                  <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                    Uploading to YouTube...
                  </span>
                </div>
                <span className="text-sm font-medium text-blue-700 tabular-nums">
                  {uploadProgress}%
                </span>
              </div>
              <div className="w-full bg-gradient-to-r from-purple-200 to-blue-200 dark:from-purple-800/30 dark:to-blue-800/30 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-600 to-blue-500 h-2 rounded-full transition-all duration-300 shadow-sm"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="px-4 py-3 bg-red-50/50 dark:bg-red-500/5 border border-red-100/50 dark:border-red-500/10 rounded mx-5 mt-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-500 dark:text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-700 dark:text-red-300">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Content */}
          {!isMinimized && (
            <div className="px-5 py-6">
              <form
                onSubmit={handleSubmit}
                className="space-y-5 md:grid md:grid-cols-2 md:gap-5 md:space-y-0"
              >
                {/* Video Upload */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                    Video File*
                  </label>
                  <div className="relative mt-1.5 flex justify-center px-4 py-4 border border-gray-200 dark:border-gray-800 border-dashed rounded hover:border-blue-500/50 dark:hover:border-blue-500/25 bg-gray-50/50 dark:bg-gray-900/25 transition-colors duration-150 group">
                    <input
                      type="file"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
                      name="videoFile"
                      accept="video/mp4,video/mov"
                      onChange={(e) => handleFileChange(e, "videoFile")}
                      disabled={isUploading}
                    />
                    <div className="space-y-3 text-center">
                      <svg
                        className="mx-auto h-9 w-9 text-gray-400 dark:text-gray-600 group-hover:text-blue-500/75 dark:group-hover:text-blue-500/50 transition-colors duration-150"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 4v16M17 4v16M3 8h3m-3 4h18m-3-4h3M3 16h3m-3 4h18m-3-4h3M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
                        />
                      </svg>
                      <div className="flex flex-col items-center">
                        <span className="text-sm font-medium text-purple-600 dark:text-purple-400 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-all duration-200">
                          {formData.videoFile
                            ? formData.videoFile.name
                            : "Upload a video"}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          MP4, MOV up to 10GB
                        </span>
                        {formData.videoFile && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 mt-2 backdrop-blur-sm">
                            <svg
                              className="-ml-0.5 mr-1.5 h-2 w-2 text-green-400"
                              fill="currentColor"
                              viewBox="0 0 8 8"
                            >
                              <circle cx="4" cy="4" r="3" />
                            </svg>
                            Ready to upload
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                    Title*
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="mt-1.5 block w-full border border-gray-200 dark:border-gray-800 rounded py-1.5 px-2.5 bg-white dark:bg-black text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500/50 dark:focus:ring-blue-500/25 focus:border-blue-500/50 dark:focus:border-blue-500/25 transition-colors duration-150 text-sm placeholder-gray-400 dark:placeholder-gray-600"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="mt-1.5 block w-full border border-gray-200 dark:border-gray-800 rounded py-1.5 px-2.5 bg-white dark:bg-black text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500/50 dark:focus:ring-blue-500/25 focus:border-blue-500/50 dark:focus:border-blue-500/25 transition-colors duration-150 text-sm placeholder-gray-400 dark:placeholder-gray-600"
                    disabled={isUploading}
                  />
                </div>

                {/* Thumbnail */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                    Thumbnail
                  </label>
                  <div className="relative mt-1.5 flex justify-center px-4 py-4 border border-gray-200 dark:border-gray-800 border-dashed rounded hover:border-blue-500/50 dark:hover:border-blue-500/25 bg-gray-50/50 dark:bg-gray-900/25 transition-colors duration-150 group">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, "thumbnail")}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
                      disabled={isUploading}
                    />
                    <div className="space-y-3 text-center">
                      <svg
                        className="mx-auto h-9 w-9 text-gray-400 dark:text-gray-600 group-hover:text-blue-500/75 dark:group-hover:text-blue-500/50 transition-colors duration-150"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <div className="flex flex-col items-center">
                        <span className="text-sm font-medium text-purple-600 dark:text-purple-400 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-all duration-200">
                          {formData.thumbnail
                            ? formData.thumbnail.name
                            : "Upload a thumbnail"}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          PNG, JPG up to 2MB
                        </span>
                        {formData.thumbnail && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 mt-2 backdrop-blur-sm">
                            <svg
                              className="-ml-0.5 mr-1.5 h-2 w-2 text-green-400"
                              fill="currentColor"
                              viewBox="0 0 8 8"
                            >
                              <circle cx="4" cy="4" r="3" />
                            </svg>
                            Thumbnail selected
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Privacy Setting */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Privacy Setting
                  </label>
                  <div className="relative">
                    <select
                      name="privacy"
                      value={formData.privacy}
                      onChange={handleInputChange}
                      className="block w-full border border-gray-300 dark:border-gray-600 rounded-lg py-3 pl-4 pr-10 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 appearance-none"
                      disabled={isUploading}
                    >
                      <option value="private">Private</option>
                      <option value="unlisted">Unlisted</option>
                      <option value="public">Public</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <svg
                        className="h-5 w-5 text-gray-400 dark:text-gray-500"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <div className="relative">
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="block w-full border border-gray-300 dark:border-gray-600 rounded-lg py-3 pl-4 pr-10 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 appearance-none"
                      disabled={isUploading}
                    >
                      {VIDEO_CATEGORIES.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <svg
                        className="h-5 w-5 text-gray-400 dark:text-gray-500"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tags (comma separated)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        className="h-5 w-5 text-gray-400 dark:text-gray-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                        />
                      </svg>
                    </div>
                    <input
                      type="text"
                      name="tags"
                      value={formData.tags}
                      onChange={handleInputChange}
                      className="block w-full border border-gray-300 rounded-md py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out"
                      placeholder="gaming, vlog, tutorial"
                      disabled={isUploading}
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Add relevant tags to help viewers discover your video
                  </p>
                </div>

                {/* Category
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <div className="relative">
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="block w-full border border-gray-300 dark:border-gray-600 rounded-lg py-3 pl-4 pr-10 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 appearance-none"
                      disabled={isUploading}
                    >
                      <option value="Entertainment">Entertainment</option>
                      <option value="Education">Education</option>
                      <option value="Gaming">Gaming</option>
                      <option value="Music">Music</option>
                      <option value="Tech">Technology</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400 dark:text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div> */}

                {/* Error Message */}
                {error && (
                  <div className="p-4 bg-gradient-to-r from-red-50/80 to-red-50/50 dark:from-red-900/30 dark:to-red-900/20 border-l-4 border-red-500 dark:border-red-600 rounded-r-lg backdrop-blur-sm mb-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg
                          className="h-5 w-5 text-red-400"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-red-700 dark:text-red-300">
                          {error}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end gap-2 pt-5 mt-6 border-t border-gray-100 dark:border-gray-900">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isUploading}
                    className="inline-flex items-center px-3.5 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50/75 dark:hover:bg-gray-900/50 focus:outline-none focus:ring-1 focus:ring-gray-200 dark:focus:ring-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                  >
                    <span className="flex items-center gap-2">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                      <span>Cancel</span>
                    </span>
                  </button>
                  <button
                    type="submit"
                    disabled={
                      isUploading || !formData.videoFile || !formData.title
                    }
                    className="inline-flex items-center px-3.5 py-1.5 text-sm font-medium text-white bg-blue-500 dark:bg-blue-500 hover:bg-blue-600 dark:hover:bg-blue-600 border border-transparent rounded shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50 dark:focus:ring-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                  >
                    <span className="flex items-center gap-2">
                      {isUploading ? (
                        <>
                          <svg
                            className="animate-spin h-5 w-5"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                              fill="none"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span>Upload</span>
                        </>
                      )}
                    </span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default VideoUploadModal;
