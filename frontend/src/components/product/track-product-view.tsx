"use client";

import { useEffect } from "react";

type TrackProductViewProps = {
  productId: string;
};

export const TrackProductView = ({ productId }: TrackProductViewProps) => {
  useEffect(() => {
    const trackView = async () => {
      try {
        // Only track if user is authenticated
        const response = await fetch("/api/account/recent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ productId }),
        });

        if (!response.ok) {
          // Silently fail if user is not authenticated or other error
          return;
        }
      } catch (error) {
        // Silently fail - don't interrupt user experience
        console.error("Failed to track product view:", error);
      }
    };

    // Track the view after a short delay to ensure page is loaded
    const timeoutId = setTimeout(() => {
      trackView();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [productId]);

  return null; // This component doesn't render anything
};

