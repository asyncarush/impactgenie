'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { SignInButton, SignUpButton, UserButton, useUser } from '@clerk/nextjs';

const Header: React.FC = () => {
  const { isSignedIn } = useUser();

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
              <Link href="/dashboard">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2.5 rounded-full font-medium shadow-lg hover:shadow-blue-500/25 transition-shadow duration-300"
                >
                  Dashboard
                </motion.button>
              </Link>
              <UserButton afterSignOutUrl="/" />
            </div>
          )}
        </nav>
      </div>
    </motion.header>
  );
};

export default Header;
