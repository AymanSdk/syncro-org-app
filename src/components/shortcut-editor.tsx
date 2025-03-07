'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Shortcut } from '@/contexts/ShortcutsContext';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';

interface ShortcutEditorProps {
  shortcut: Shortcut;
  onUpdate: (id: string, keys: string) => void;
  onReset: (id: string) => void;
}

export const ShortcutEditor = ({ shortcut, onUpdate, onReset }: ShortcutEditorProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [tempKeys, setTempKeys] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const formatKeyDisplay = (keys: string) => {
    return keys
      .split('+')
      .map(key => key.charAt(0).toUpperCase() + key.slice(1))
      .join(' + ');
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    setTempKeys('');
    setError(null);
    // Focus input to capture keys
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isRecording) return;
    
    e.preventDefault();

    const keys = [];
    if (e.ctrlKey) keys.push('ctrl');
    if (e.altKey) keys.push('alt');
    if (e.shiftKey) keys.push('shift');
    if (e.metaKey) keys.push('meta');

    // Get the non-modifier key
    const key = e.key.toLowerCase();
    if (!['control', 'alt', 'shift', 'meta'].includes(key) && key !== 'escape') {
      keys.push(key);
    }

    // Only accept shortcuts with modifiers
    if (keys.length > 1) {
      const shortcutString = keys.join('+');
      setTempKeys(shortcutString);
      setIsRecording(false);
      onUpdate(shortcut.id, shortcutString);
    } else if (key === 'escape') {
      setIsRecording(false);
    } else if (keys.length === 1 && !['control', 'alt', 'shift', 'meta'].includes(keys[0])) {
      setError('Please include at least one modifier key (Ctrl, Alt, Shift)');
    }
  };

  const handleReset = () => {
    onReset(shortcut.id);
    setTempKeys('');
    setError(null);
  };

  return (
    <div className="flex items-center space-x-2 mb-2">
      <div className="flex-1">
        <span className="text-sm font-medium">{shortcut.name}</span>
        <p className="text-xs text-muted-foreground">{shortcut.description}</p>
      </div>
      
      <div className="relative">
        <Input
          ref={inputRef}
          className={`w-[140px] text-center font-mono ${isRecording ? 'border-primary' : ''}`}
          value={isRecording ? 'Press keys...' : formatKeyDisplay(tempKeys || shortcut.currentKeys)}
          onKeyDown={handleKeyDown}
          readOnly
          onClick={handleStartRecording}
        />
        {error && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <AlertCircle className="h-4 w-4 absolute right-2 top-1/2 transform -translate-y-1/2 text-red-500" />
              </TooltipTrigger>
              <TooltipContent>
                <p>{error}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      
      <Button 
        variant="outline" 
        size="sm" 
        onClick={isRecording ? () => setIsRecording(false) : handleStartRecording}
      >
        {isRecording ? 'Cancel' : 'Edit'}
      </Button>
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleReset}
              disabled={shortcut.currentKeys === shortcut.defaultKeys}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Reset to default</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};
