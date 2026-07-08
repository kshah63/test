"use client";

import { useEffect } from "react";

/** Stores the browser's IANA timezone in a cookie so server rendering and
 *  completion logging use the user's local calendar day, not UTC. */
export default function TimezoneSync() {
  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz) {
        const value = encodeURIComponent(tz);
        if (!document.cookie.split("; ").includes(`tz=${value}`)) {
          document.cookie = `tz=${value}; path=/; max-age=31536000; samesite=lax`;
        }
      }
    } catch {
      // leave the server on UTC fallback
    }
  }, []);
  return null;
}
