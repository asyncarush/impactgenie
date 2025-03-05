'use client';

import React from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ContentSection from "./components/ContentSection";
import { motion } from "framer-motion";

export default function HomePage() {
  // Animation variants
  const pageVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.2
      }
    },
    exit: { opacity: 0 }
  };

  const childVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <motion.div 
      className="min-h-screen flex flex-col font-poppins"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <motion.div variants={childVariants}>
        <Header />
      </motion.div>
      
      <motion.main 
        className="flex-grow"
        variants={childVariants}
      >
        <ContentSection />
      </motion.main>
      
      <motion.div variants={childVariants}>
        <Footer />
      </motion.div>
    </motion.div>
  );
}
