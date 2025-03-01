"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface TooltipProviderProps {
  children: React.ReactNode;
  /**
   * The delay in ms before showing the tooltip.
   * @default 700
   */
  delayDuration?: number;
  /**
   * Prevents tooltips from showing on touch devices.
   * @default true
   */
  disableOnMobile?: boolean;
}

// Global state for touch device detection
let isTouchDevice = false;

if (typeof window !== 'undefined') {
  // Only run on client side
  isTouchDevice = 'ontouchstart' in window || 
    navigator.maxTouchPoints > 0 ||
    // @ts-ignore - Some browsers use this property
    navigator.msMaxTouchPoints > 0;
}

export const TooltipProvider: React.FC<TooltipProviderProps> = ({ 
  children, 
  delayDuration = 700,
  disableOnMobile = true
}) => {
  const contextValue = React.useMemo(() => ({ 
    delayDuration,
    disableOnMobile,
    isTouchDevice
  }), [delayDuration, disableOnMobile]);

  return (
    <TooltipContext.Provider value={contextValue}>
      {children}
    </TooltipContext.Provider>
  );
};

// Create context for sharing tooltip state
type TooltipContextValue = {
  delayDuration: number;
  disableOnMobile: boolean;
  isTouchDevice: boolean;
};

const TooltipContext = React.createContext<TooltipContextValue>({
  delayDuration: 700,
  disableOnMobile: true,
  isTouchDevice: false
});

export const useTooltipContext = () => {
  const context = React.useContext(TooltipContext);
  if (!context) {
    throw new Error("Tooltip components must be used within a TooltipProvider");
  }
  return context;
};

interface TooltipProps {
  children: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const Tooltip: React.FC<TooltipProps> = ({ 
  children,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange
}) => {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  
  const open = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen;
  
  const handleOpenChange = React.useCallback((open: boolean) => {
    setUncontrolledOpen(open);
    onOpenChange?.(open);
  }, [onOpenChange]);

  return (
    <TooltipStateProvider open={open} onOpenChange={handleOpenChange}>
      {children}
    </TooltipStateProvider>
  );
};

// Context for internal state
type TooltipStateContextValue = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLElement>;
};

const TooltipStateContext = React.createContext<TooltipStateContextValue | null>(null);

const TooltipStateProvider: React.FC<{
  children: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}> = ({ children, open, onOpenChange }) => {
  const triggerRef = React.useRef<HTMLElement>(null);
  
  return (
    <TooltipStateContext.Provider value={{ open, onOpenChange, triggerRef }}>
      {children}
    </TooltipStateContext.Provider>
  );
};

const useTooltipState = () => {
  const context = React.useContext(TooltipStateContext);
  if (!context) {
    throw new Error("Tooltip compound components must be used within a Tooltip");
  }
  return context;
};

interface TooltipTriggerProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  asChild?: boolean;
}

export const TooltipTrigger = React.forwardRef<HTMLButtonElement, TooltipTriggerProps>(
  ({ children, asChild = false, ...props }, forwardedRef) => {
    const { open, onOpenChange, triggerRef } = useTooltipState();
    const { delayDuration, disableOnMobile, isTouchDevice } = useTooltipContext();
    const [hasMouseOver, setHasMouseOver] = React.useState(false);
    const timerRef = React.useRef<NodeJS.Timeout | null>(null);

    // Merge refs
    const ref = React.useCallback((node: HTMLButtonElement | null) => {
      // Update the triggerRef
      if (node) triggerRef.current = node;
      
      // Forward the ref
      if (typeof forwardedRef === 'function') forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;
    }, [forwardedRef, triggerRef]);
    
    // Handle mouse events
    const handleMouseEnter = React.useCallback((e: React.MouseEvent<HTMLElement>) => {
      props.onMouseEnter?.(e);
      
      // Skip on touch devices if disabled
      if (disableOnMobile && isTouchDevice) return;
      
      setHasMouseOver(true);
      
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      
      timerRef.current = setTimeout(() => {
        if (hasMouseOver) {
          onOpenChange(true);
        }
      }, delayDuration);
    }, [props.onMouseEnter, disableOnMobile, isTouchDevice, hasMouseOver, onOpenChange, delayDuration]);
    
    const handleMouseLeave = React.useCallback((e: React.MouseEvent<HTMLElement>) => {
      props.onMouseLeave?.(e);
      
      setHasMouseOver(false);
      
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      
      onOpenChange(false);
    }, [props.onMouseLeave, onOpenChange]);
    
    React.useEffect(() => {
      return () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
      };
    }, []);
    
    // Handle click outside
    React.useEffect(() => {
      if (!open) return;
      
      const handleClickOutside = (e: MouseEvent) => {
        if (
          triggerRef.current && 
          !triggerRef.current.contains(e.target as Node)
        ) {
          onOpenChange(false);
        }
      };
      
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [open, onOpenChange, triggerRef]);
    
    const TriggerComponent = asChild ? React.cloneElement(children as React.ReactElement, {
      ref,
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
    }) : (
      <button
        type="button"
        ref={ref}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        {children}
      </button>
    );
    
    return TriggerComponent;
  }
);
TooltipTrigger.displayName = "TooltipTrigger";

interface TooltipContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  sideOffset?: number;
}

export const TooltipContent = React.forwardRef<HTMLDivElement, TooltipContentProps>(
  ({ children, className, side = "top", align = "center", sideOffset = 4, ...props }, forwardedRef) => {
    const { open, triggerRef } = useTooltipState();
    const contentRef = React.useRef<HTMLDivElement>(null);
    const [position, setPosition] = React.useState({ top: 0, left: 0 });
    
    const updatePosition = React.useCallback(() => {
      if (!triggerRef.current || !contentRef.current) return;
      
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const contentRect = contentRef.current.getBoundingClientRect();
      
      let top = 0;
      let left = 0;
      
      // Calculate position based on side and align
      switch (side) {
        case "top":
          top = triggerRect.top - contentRect.height - sideOffset;
          left = triggerRect.left + triggerRect.width / 2 - contentRect.width / 2;
          break;
        case "right":
          top = triggerRect.top + triggerRect.height / 2 - contentRect.height / 2;
          left = triggerRect.right + sideOffset;
          break;
        case "bottom":
          top = triggerRect.bottom + sideOffset;
          left = triggerRect.left + triggerRect.width / 2 - contentRect.width / 2;
          break;
        case "left":
          top = triggerRect.top + triggerRect.height / 2 - contentRect.height / 2;
          left = triggerRect.left - contentRect.width - sideOffset;
          break;
      }
      
      // Adjust alignment
      if (align === "start") {
        if (side === "top" || side === "bottom") {
          left = triggerRect.left;
        } else {
          top = triggerRect.top;
        }
      } else if (align === "end") {
        if (side === "top" || side === "bottom") {
          left = triggerRect.right - contentRect.width;
        } else {
          top = triggerRect.bottom - contentRect.height;
        }
      }
      
      // Keep tooltip within viewport
      const viewportMargin = 8;
      
      if (top < viewportMargin) top = viewportMargin;
      if (top + contentRect.height > window.innerHeight - viewportMargin) {
        top = window.innerHeight - contentRect.height - viewportMargin;
      }
      
      if (left < viewportMargin) left = viewportMargin;
      if (left + contentRect.width > window.innerWidth - viewportMargin) {
        left = window.innerWidth - contentRect.width - viewportMargin;
      }
      
      setPosition({ top: top + window.scrollY, left: left + window.scrollX });
    }, [side, align, sideOffset, triggerRef]);
    
    // Update position when tooltip becomes visible
    React.useEffect(() => {
      if (!open) return;
      
      // Update position after render
      requestAnimationFrame(updatePosition);
      
      // Update position on resize and scroll
      const handleResize = () => updatePosition();
      
      window.addEventListener("resize", handleResize);
      window.addEventListener("scroll", handleResize, true);
      
      return () => {
        window.removeEventListener("resize", handleResize);
        window.removeEventListener("scroll", handleResize, true);
      };
    }, [open, updatePosition]);
    
    // Combine refs
    const ref = React.useCallback((node: HTMLDivElement | null) => {
      contentRef.current = node;
      
      if (typeof forwardedRef === 'function') forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;
    }, [forwardedRef]);
    
    if (!open) return null;
    
    return (
      <div
        ref={ref}
        role="tooltip"
        style={{
          position: 'absolute',
          top: `${position.top}px`,
          left: `${position.left}px`,
          zIndex: 1000,
          pointerEvents: 'none'
        }}
        className={cn(
          "z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          className
        )}
        data-state={open ? "open" : "closed"}
        data-side={side}
        {...props}
      >
        {children}
      </div>
    );
  }
);
TooltipContent.displayName = "TooltipContent";
