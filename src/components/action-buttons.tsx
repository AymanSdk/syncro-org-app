import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Plus, MessageCircle, Hash } from 'lucide-react';

interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

export const ActionButton = ({ icon, label, onClick }: ActionButtonProps) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClick}
            className="rounded-full hover:bg-gray-200 dark:hover:bg-gray-800"
          >
            {icon}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export const NewChannelButton = ({ onClick }: { onClick: () => void }) => (
  <ActionButton 
    icon={<Hash className="size-5" />} 
    label="New Channel" 
    onClick={onClick} 
  />
);

export const NewMessageButton = ({ onClick }: { onClick: () => void }) => (
  <ActionButton 
    icon={<MessageCircle className="size-5" />} 
    label="New Message" 
    onClick={onClick} 
  />
);

export const NewDirectMessageButton = ({ onClick }: { onClick: () => void }) => (
  <ActionButton 
    icon={<Plus className="size-5" />} 
    label="New Direct Message" 
    onClick={onClick} 
  />
);
