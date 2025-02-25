'use client';

import React from 'react';
import { motion } from 'framer-motion';

const Footer: React.FC = () => {
  return (
    <motion.footer 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-8"
    >
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-semibold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              ImpactGenie
            </h3>
            <p className="text-gray-400">
              Empowering you to make a difference
            </p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <motion.a 
                  href="#" 
                  className="hover:text-white transition-colors"
                  whileHover={{ x: 5 }}
                >
                  About Us
                </motion.a>
              </li>
              <li>
                <motion.a 
                  href="#" 
                  className="hover:text-white transition-colors"
                  whileHover={{ x: 5 }}
                >
                  Features
                </motion.a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <motion.a 
                  href="mailto:hello@impactgenie.com" 
                  className="hover:text-white transition-colors"
                  whileHover={{ x: 5 }}
                >
                  hello@impactgenie.com
                </motion.a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} ImpactGenie. All rights reserved.</p>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;
