import { useCallback, useEffect } from 'react';

export type TooltipPosition = 'top' | 'right' | 'bottom' | 'left';

interface CalculatePositionProps {
  triggerRect: DOMRect;
  contentRect: DOMRect;
  position: TooltipPosition;
  offset?: number;
}

/**
 * Calculate tooltip position based on trigger element and desired position
 */
export const calculateTooltipPosition = ({
  triggerRect,
  contentRect,
  position,
  offset = 8
}: CalculatePositionProps) => {
  let top = 0;
  let left = 0;
  
  switch (position) {
    case "top":
      top = triggerRect.top - contentRect.height - offset;
      left = triggerRect.left + triggerRect.width / 2 - contentRect.width / 2;
      break;
    case "right":
      top = triggerRect.top + triggerRect.height / 2 - contentRect.height / 2;
      left = triggerRect.right + offset;
      break;
    case "bottom":
      top = triggerRect.bottom + offset;
      left = triggerRect.left + triggerRect.width / 2 - contentRect.width / 2;
      break;
    case "left":
      top = triggerRect.top + triggerRect.height / 2 - contentRect.height / 2;
      left = triggerRect.left - contentRect.width - offset;
      break;
  }
  
  // Keep tooltip within viewport
  const viewportMargin = 8;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  
  if (top < viewportMargin) top = viewportMargin;
  if (top + contentRect.height > viewportHeight - viewportMargin) {
    top = viewportHeight - contentRect.height - viewportMargin;
  }
  
  if (left < viewportMargin) left = viewportMargin;
  if (left + contentRect.width > viewportWidth - viewportMargin) {
    left = viewportWidth - contentRect.width - viewportMargin;
  }
  
  return { top, left };
};

/**
 * Hook to handle tooltip cleanup
 */
export const useTooltipCleanup = (timeoutRef: React.MutableRefObject<NodeJS.Timeout | null>) => {
  useEffect(() => {
    // Clean up on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [timeoutRef]);
};
