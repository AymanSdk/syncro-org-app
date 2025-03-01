'use client';

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { XIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/hooks/use-media-query';

interface SimpleModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /**
   * Optional title for the modal
   */
  title?: string;
  /**
   * Optional CSS class to customize the modal width
   * @default "max-w-5xl"
   */
  maxWidth?: string;
}

export const SimpleModal = ({ 
  isOpen, 
  onClose, 
  children, 
  title,
  maxWidth = "max-w-5xl"
}: SimpleModalProps) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery('(max-width: 768px)');

  // Handle click outside to close
  useEffect(() => {
    const handleOverlayClick = (e: MouseEvent) => {
      if (overlayRef.current && e.target === overlayRef.current) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOverlayClick);
    }

    return () => {
      document.removeEventListener('mousedown', handleOverlayClick);
    };
  }, [isOpen, onClose]);

  // Handle escape key to close
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = ''; // Restore scrolling
    };
  }, [isOpen, onClose]);

  // Focus trap for accessibility
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;
    
    // Focus the first focusable element
    const focusableElements = modalRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length) {
      (focusableElements[0] as HTMLElement).focus();
    }

    // Save the element that had focus before opening modal
    const previouslyFocused = document.activeElement as HTMLElement;

    return () => {
      // Restore focus when modal closes
      if (previouslyFocused) {
        previouslyFocused.focus();
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div 
      ref={overlayRef}
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm",
        "animate-in fade-in duration-200",
        isMobile ? "bg-background/95" : "bg-black/50"
      )}
      aria-modal="true"
      role="dialog"
      aria-labelledby={title ? "modal-title" : undefined}
    >
      <div 
        ref={modalRef}
        className={cn(
          "relative bg-white dark:bg-gray-900 rounded-xl shadow-2xl overflow-hidden",
          "animate-in zoom-in-90 duration-300",
          isMobile ? "w-full h-[90vh] overflow-y-auto" : `w-full ${maxWidth} max-h-[90vh]`
        )}
      >
        {title && (
          <div className="px-6 py-4 border-b flex items-center justify-between">
            <h2 id="modal-title" className="text-xl font-semibold">{title}</h2>
            <button 
              onClick={onClose}
              className="rounded-full p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Close dialog"
            >
              <XIcon className="h-5 w-5" />
            </button>
          </div>
        )}
        
        {!title && (
          <button 
            onClick={onClose}
            className="absolute right-4 top-4 z-10 rounded-full p-2 bg-white/10 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            aria-label="Close dialog"
          >
            <XIcon className="h-5 w-5" />
          </button>
        )}
        
        <div className="max-h-[calc(90vh-4rem)] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

/**
 * A two-column layout component for modal content with a 1/3 - 2/3 split
 */
export const ModalTwoColumnLayout = ({
  left,
  right,
  className
}: {
  left: React.ReactNode;
  right: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex flex-col md:flex-row", className)}>
      {/* Left column (1/3) */}
      <div className="md:w-1/3 p-6 bg-gray-50 dark:bg-gray-800 flex flex-col">
        {left}
      </div>
      
      {/* Right column (2/3) */}
      <div className="md:w-2/3 p-6">
        {right}
      </div>
    </div>
  );
};
