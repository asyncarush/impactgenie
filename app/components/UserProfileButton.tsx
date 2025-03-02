import { UserButton } from "@clerk/nextjs";
import React from "react";

export default function UserProfileButton() {
  return (
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
  );
}
