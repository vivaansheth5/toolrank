"use client";

import { useEffect } from "react";
import { site } from "@/lib/site-config";

/** When the tab loses focus: "COME BACK TO THE WRONG SIDE". */
export function TabTitle() {
  useEffect(() => {
    let saved = "";
    const onVis = () => {
      if (document.hidden) {
        saved = document.title;
        document.title = site.tabAwayTitle;
      } else if (saved) {
        document.title = saved;
        saved = "";
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);
  return null;
}
