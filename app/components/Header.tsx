"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { SignInButton, SignUpButton, useUser } from "@clerk/nextjs";
import UserProfileButton from "./UserProfileButton";
import { useTheme } from "next-themes";

const Header: React.FC = () => {
  const { isSignedIn } = useUser();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    if (mounted) {
      setTheme(theme === "dark" ? "light" : "dark");
    }
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="backdrop-blur-md bg-white/70 dark:bg-gray-900/70 sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800"
    >
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <motion.h1
          className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
          whileHover={{ scale: 1.02 }}
        >
          <Link href="/">ImpactGenie</Link>
        </motion.h1>
        <nav className="flex items-center gap-4">
          <motion.div
            className="theme-toggle mr-4"
            onClick={toggleTheme}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title={
              theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"
            }
            initial={false}
            animate={{
              backgroundColor: theme === "dark" ? "#1a1a1a" : "#e2e8f0",
            }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="theme-toggle-thumb"
              layout
              initial={false}
              animate={{
                x: theme === "dark" ? 30 : 0,
                backgroundColor: theme === "dark" ? "#f59e0b" : "#ffffff",
              }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            ></motion.div>
          </motion.div>

          {!isSignedIn ? (
            <>
              <SignInButton mode="modal">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2.5 rounded-full font-medium shadow-lg hover:shadow-blue-500/25 transition-shadow duration-300"
                >
                  Sign In
                </motion.button>
              </SignInButton>
              <SignUpButton mode="modal">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white text-gray-800 border border-gray-300 px-6 py-2.5 rounded-full font-medium hover:bg-gray-50 shadow-lg hover:shadow-blue-500/10 transition-shadow duration-300"
                >
                  Sign Up
                </motion.button>
              </SignUpButton>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <Link href="/youtube">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-2.5 rounded-full font-medium shadow-lg hover:shadow-red-500/25 transition-shadow duration-300"
                >
                  YouTube
                </motion.button>
              </Link>

              <UserProfileButton />
            </div>
          )}
        </nav>
      </div>
    </motion.header>
  );
};

export default Header;
