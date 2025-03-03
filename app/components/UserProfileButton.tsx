import { UserButton } from "@clerk/nextjs";
import React from "react";
import { motion } from "framer-motion";

export default function UserProfileButton() {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <UserButton 
        userProfileProps={{
          additionalOAuthScopes: {
            // Add YouTube-specific scopes for Google OAuth
            google: [
              "https://www.googleapis.com/auth/youtube.readonly",
              "https://www.googleapis.com/auth/youtube.force-ssl"
            ],
          },
        }}
      />
    </motion.div>
  );
}
