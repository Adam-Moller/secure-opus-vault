import { useCallback } from "react";

/**
 * Hook for handling mobile keyboard scroll behavior.
 * Scrolls input into view when focused to prevent keyboard from hiding content.
 */
export function useScrollOnFocus() {
  const handleFocus = useCallback((e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    // Delay to allow keyboard to appear first
    setTimeout(() => {
      e.target.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 300);
  }, []);

  return { handleFocus };
}

/**
 * Creates onFocus handler props for input elements.
 * Use this to spread on Input/Textarea components.
 */
export function getScrollOnFocusProps() {
  return {
    onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setTimeout(() => {
        e.target.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 300);
    },
  };
}
