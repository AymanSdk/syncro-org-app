"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";
import { calculateTooltipPosition, useTooltipCleanup } from "@/lib/tooltip-utils";

interface ImprovedTooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  delay?: number;
  offset?: number;
  className?: string;
  contentClassName?: string;
}

export const ImprovedTooltip = ({
  content,
  children,
  side = "top",
  align = "center",
  delay = 300,
  offset = 8,
  className,
  contentClassName,
}: ImprovedTooltipProps) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const [isMounted, setIsMounted] = React.useState(false);
  const [position, setPosition] = React.useState({ top: 0, left: 0 });
  const triggerRef = React.useRef<HTMLDivElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Don't show tooltips on mobile devices
  const shouldShowTooltip = !isMobile;

  // Calculate tooltip position based on trigger element position
  const updatePosition = React.useCallback(() => {
    if (!triggerRef.current || !contentRef.current) return;
    
    const triggerRect = triggerRef.current.getBoundingClientRect();
    const contentRect = contentRef.current.getBoundingClientRect();
    
    const { top, left } = calculateTooltipPosition({
      triggerRect,
      contentRect,
      position: side,
      offset
    });
    
    setPosition({ top, left });
  }, [side, offset]);

  const show = React.useCallback(() => {
    if (!shouldShowTooltip) return;
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    if (delay) {
      timeoutRef.current = setTimeout(() => {
        setIsVisible(true);
        setIsMounted(true);
        // Update position in next tick after render
        setTimeout(updatePosition, 0);
      }, delay);
    } else {
      setIsVisible(true);
      setIsMounted(true);
      // Update position in next tick after render
      setTimeout(updatePosition, 0);
    }
  }, [delay, updatePosition, shouldShowTooltip]);

  const hide = React.useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    setIsVisible(false);
    // Keep it mounted briefly for the hide animation
    setTimeout(() => setIsMounted(false), 200);
  }, []);

  // Handle click outside to hide tooltip
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        contentRef.current && 
        triggerRef.current && 
        !contentRef.current.contains(e.target as Node) && 
        !triggerRef.current.contains(e.target as Node)
      ) {
        hide();
      }
    };
    
    if (isVisible) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isVisible, hide]);

  // Update position when window resizes
  React.useEffect(() => {
    if (isVisible) {
      const handleResize = () => updatePosition();
      window.addEventListener("resize", handleResize);
      window.addEventListener("scroll", handleResize, true);
      
      return () => {
        window.removeEventListener("resize", handleResize);
        window.removeEventListener("scroll", handleResize, true);
      };
    }
  }, [isVisible, updatePosition]);

  // Clean up timeout on unmount
  useTooltipCleanup(timeoutRef);

  return (
    <div 
      ref={triggerRef}
      className={cn("inline-flex", className)}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      
      {isMounted && (
        <div
          ref={contentRef}
          role="tooltip"
          className={cn(
            "fixed z-50 rounded-md bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md border border-border",
            "animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
            !isVisible && "opacity-0 pointer-events-none",
            `data-[side=${side}]:slide-in-from-${
              side === "top" ? "bottom" : side === "bottom" ? "top" : side === "left" ? "right" : "left"
            }-2`,
            "tooltip-container",
            contentClassName
          )}
          style={{
            position: 'absolute',
            top: `${position.top}px`,
            left: `${position.left}px`,
            visibility: isVisible ? 'visible' : 'hidden',
            pointerEvents: 'none'
          }}
          data-state={isVisible ? "open" : "closed"}
          data-side={side}
        >
          {content}
        </div>
      )}
    </div>
  );
};

export const MessageSquarePlus = ({ className, ...props }: React.ComponentProps<"svg">) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={cn("lucide lucide-message-square-plus", className)} 
    {...props}
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    <line x1="9" x2="15" y1="10" y2="10"/>
    <line x1="12" x2="12" y1="7" y2="13"/>
  </svg>
);