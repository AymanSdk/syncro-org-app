'use client';

import React from 'react'; // Added explicit React import
import { useCurrentUser } from '@/app/auth/api/use-current-user';
import { useAuthActions } from '@convex-dev/auth/react';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useShortcuts } from '@/contexts/ShortcutsContext';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSubContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  DropdownMenuSub,
  DropdownMenuSubTrigger,
} from '@radix-ui/react-dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  BellOff,
  CheckCircle2,
  Clock,
  Github,
  LifeBuoy,
  Loader,
  LogOut,
  MessageSquarePlus,
  MinusCircle,
  Plus,
  Settings,
  Users,
  Laptop,
  CircleUser,
  SunMedium,
  Moon,
  Monitor,
  FileKey,
} from 'lucide-react';
import { SimpleModal } from '@/components/SimpleModal';
import { UserProfileContent } from '@/components/UserProfileContent';
import { ShortcutsDialog } from '@/components/shortcuts-dialog';
import { Badge } from "@/components/ui/badge";

export const UserButton = () => {
  const { theme, setTheme } = useTheme();
  const [status, setStatus] = useState('available');
  const [customStatus, setCustomStatus] = useState('');
  const [expirationTime, setExpirationTime] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const { signOut } = useAuthActions();
  const { data, isLoading } = useCurrentUser();
  const { shortcuts } = useShortcuts();

  // Get keyboard shortcuts from context
  const getShortcut = (id: string) => {
    const shortcut = shortcuts?.find(s => s.id === id);
    return shortcut ? shortcut.currentKeys : '';
  };  // Added missing closing brace

  // Set up hotkeys outside of conditions
  // Always call the hooks, but use empty string if not available
  useHotkeys(getShortcut('toggleShortcutsDialog') || 'DISABLED_KEY_123', () => setShortcutsOpen(true), {
    enabled: !!getShortcut('toggleShortcutsDialog'),
  });
  
  useHotkeys(getShortcut('openProfile') || 'DISABLED_KEY_456', () => handleOpenModal(), {
    enabled: !!getShortcut('openProfile'),
  });
  
  useHotkeys(getShortcut('setBusy') || 'DISABLED_KEY_789', () => setStatus('busy'), {
    enabled: !!getShortcut('setBusy'),
  });
  
  useHotkeys(getShortcut('logout') || 'DISABLED_KEY_012', () => signOut(), {
    enabled: !!getShortcut('logout'),
  });
  
  useHotkeys(getShortcut('toggleTheme') || 'DISABLED_KEY_345', () => setTheme(theme === 'dark' ? 'light' : 'dark'), {
    enabled: !!getShortcut('toggleTheme'),
  });

  // Clear any previous bindings when shortcuts change
  useEffect(() => {
    // This is fine as it's just cleanup
    return () => {
      if (useHotkeys.current?.forEach) {
        useHotkeys.current.forEach(({keys}) => useHotkeys.unbind(keys));
      }
    };
  }, [shortcuts]);

  const statuses = [
    {
      value: 'available',
      label: 'Available',
      icon: CheckCircle2,
      color: 'text-green-500',
      bgColor: 'bg-green-500',
    },
    {
      value: 'busy',
      label: 'Busy',
      icon: MinusCircle,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500',
    },
    {
      value: 'away',
      label: 'Away',
      icon: Clock,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500',
    },
    {
      value: 'do-not-disturb',
      label: 'Do Not Disturb',
      icon: BellOff,
      color: 'text-red-500',
      bgColor: 'bg-red-500',
    },
  ];

  const currentStatus = statuses.find((s) => s.value === status) || {
    value: 'custom',
    label: customStatus || 'Set a status',
    icon: MessageSquarePlus,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500',
  };

  const handleCustomStatus = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('custom');
  };

  const handleOpenModal = () => {
    console.log('Opening modal');
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => setIsModalOpen(false);

  const StatusIcon = currentStatus.icon;

  if (isLoading) {
    return <Loader className="size-4 animate-spin text-muted-foreground" />;
  }

  if (!data) {
    return null;
  }

  // Format shortcut for display
  const formatShortcut = (id: string) => {
    if (!shortcuts || shortcuts.length === 0) return null;
    
    const keys = getShortcut(id).split('+');
    return (
      <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground ml-auto">
        {keys.map((key, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span className="text-xs">+</span>}
            <span className="text-xs">{key}</span>
          </React.Fragment>
        ))}
      </kbd>
    );
  };

  const { image, name } = data;
  const avatarFallback = name!.charAt(0).toUpperCase();

  return (
    <>
      <SimpleModal isOpen={isModalOpen} onClose={handleCloseModal}>
        <UserProfileContent
          user={{
            name: data.name,
            status: currentStatus.label,
            jobTitle: 'Software Engineer',
            department: 'Engineering',
            email: data.email,
            phone: '123-456-7890',
            bio: 'A brief biography...',
            image: data.image,
          }}
          statusColor={currentStatus.color}
          statusIcon={currentStatus.icon}
          onClose={handleCloseModal}
        />
      </SimpleModal>

      <ShortcutsDialog 
        isOpen={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
      />

      <DropdownMenu modal={false}>
        <DropdownMenuTrigger className="relative outline-none group">
          <Avatar className="size-10 rounded-md transition group-hover:opacity-90 ring-offset-background ring-offset-2 group-hover:ring-2 ring-primary/20">
            <AvatarImage alt={name} src={image} className="rounded-md" />
            <AvatarFallback className="rounded-md bg-sky-500 text-white">
              {avatarFallback}
            </AvatarFallback>
          </Avatar>
          <span
            className={`absolute bottom-0 right-0 rounded-full ${currentStatus.bgColor} flex h-4 w-4 items-center justify-center ring-2 ring-white`}
          >
            <StatusIcon className={`h-3 w-3 text-white`} />
          </span>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-64 p-2" side="right" forceMount sideOffset={8}>
          {/* User Profile Card */}
          <div className="flex items-center gap-4 p-2 mb-2">
            <Avatar className="size-12 rounded-md">
              <AvatarImage alt={name} src={image} className="rounded-md" />
              <AvatarFallback className="rounded-md bg-sky-500 text-white">
                {avatarFallback}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col overflow-hidden">
              <p className="font-medium truncate">{name}</p>
              <p className="text-sm text-muted-foreground truncate">{data.email}</p>
              <div className="flex items-center gap-1 mt-1">
                <StatusIcon className={`h-3 w-3 ${currentStatus.color}`} />
                <span className="text-xs text-muted-foreground">{currentStatus.label}</span>
              </div>
            </div>
          </div>
          
          <DropdownMenuSeparator />
          
          {/* User status */}
          <DropdownMenuGroup>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="flex items-center justify-between transition-colors hover:bg-accent hover:text-accent-foreground rounded-md">
                <div className="flex items-center">
                  <span className={`mr-2 h-2 w-2 rounded-full ${currentStatus.bgColor}`} />
                  <span>Set Status</span>
                </div>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-56">
                {statuses.map((statusOption) => (
                  <DropdownMenuItem
                    key={statusOption.value}
                    onClick={() => setStatus(statusOption.value)}
                    className="transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <statusOption.icon
                        className={`h-4 w-4 ${statusOption.color}`}
                      />
                      {statusOption.label}
                    </div>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <Popover>
                  <PopoverTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <div className="flex items-center gap-2">
                        <MessageSquarePlus className="h-4 w-4 text-blue-500" />
                        Custom Status
                      </div>
                    </DropdownMenuItem>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <form onSubmit={handleCustomStatus}>
                      <div className="grid gap-4">
                        <div className="space-y-2">
                          <h4 className="font-medium leading-none">
                            Custom Status
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Set a custom status message.
                          </p>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="custom-status">Status</Label>
                          <Input
                            id="custom-status"
                            placeholder="What's happening?"
                            value={customStatus}
                            onChange={(e) => setCustomStatus(e.target.value)}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="expiration">Clear after</Label>
                          <Input
                            id="expiration"
                            type="time"
                            value={expirationTime}
                            onChange={(e) => setExpirationTime(e.target.value)}
                          />
                        </div>
                        <Button type="submit">Save</Button>
                      </div>
                    </form>
                  </PopoverContent>
                </Popover>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          
          {/* My Account Section */}
          <div className="px-2 py-1.5">
            <p className="text-xs font-medium text-muted-foreground mb-1.5">My Account</p>
            <DropdownMenuGroup className="space-y-0.5">
              <DropdownMenuItem onClick={handleOpenModal} className="flex justify-between cursor-pointer rounded-md transition-colors">
                <div className="flex items-center">
                  <CircleUser className="mr-2 size-4" />
                  <span>Profile</span>
                </div>
                {formatShortcut('openProfile')}
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer rounded-md transition-colors">
                <Settings className="mr-2 size-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShortcutsOpen(true)} className="cursor-pointer rounded-md transition-colors">
                <FileKey className="mr-2 size-4" />
                <span>Keyboard Shortcuts</span>
                {formatShortcut('toggleShortcutsDialog')}
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </div>
          
          {/* Workspace Section */}
          <div className="px-2 py-1.5">
            <p className="text-xs font-medium text-muted-foreground mb-1.5">Workspace</p>
            <DropdownMenuGroup className="space-y-0.5">
              <DropdownMenuItem className="cursor-pointer rounded-md transition-colors">
                <Users className="mr-2 size-4" />
                <span>Team</span>
                <Badge variant="outline" className="ml-auto text-xs">12</Badge>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer rounded-md transition-colors">
                <Plus className="mr-2 size-4" />
                <span>Create Workspace</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </div>
          
          {/* Appearance Section */}
          <div className="px-2 py-1.5">
            <p className="text-xs font-medium text-muted-foreground mb-1.5">Appearance</p>
            <DropdownMenuGroup>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="flex items-center justify-between cursor-pointer rounded-md transition-colors">
                  <div className="flex items-center">
                    <Monitor className="mr-2 size-4" />
                    <span>Theme</span>
                  </div>
                  {formatShortcut('toggleTheme')}
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem onClick={() => setTheme('light')} className="cursor-pointer">
                    <SunMedium className="mr-2 h-4 w-4" />
                    <span>Light</span>
                    {theme === 'light' && <CheckCircle2 className="ml-auto h-4 w-4 text-green-500" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme('dark')} className="cursor-pointer">
                    <Moon className="mr-2 h-4 w-4" />
                    <span>Dark</span>
                    {theme === 'dark' && <CheckCircle2 className="ml-auto h-4 w-4 text-green-500" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme('system')} className="cursor-pointer">
                    <Laptop className="mr-2 h-4 w-4" />
                    <span>System</span>
                    {theme === 'system' && <CheckCircle2 className="ml-auto h-4 w-4 text-green-500" />}
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </DropdownMenuGroup>
          </div>
          
          <DropdownMenuSeparator />
          
          {/* Support & Resources */}
          <div className="px-2 py-1.5">
            <p className="text-xs font-medium text-muted-foreground mb-1.5">Support & Resources</p>
            <DropdownMenuGroup className="space-y-0.5">
              <DropdownMenuItem className="cursor-pointer rounded-md transition-colors">
                <Github className="mr-2 size-4" />
                <span>GitHub</span>
                <svg viewBox="0 0 24 24" className="h-3 w-3 ml-1 -translate-y-px">
                  <path
                    fill="currentColor"
                    d="M10 6v2H5v11h11v-5h2v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6Zm11-3v8h-2V6.413l-7.293 7.294-1.414-1.414L17.586 5H13V3h8Z"
                  />
                </svg>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer rounded-md transition-colors">
                <LifeBuoy className="mr-2 size-4" />
                <span>Support</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </div>
          
          <DropdownMenuSeparator />
          
          {/* Logout */}
          <DropdownMenuItem 
            onClick={() => signOut()} 
            className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 cursor-pointer mt-1 rounded-md transition-colors flex justify-between"
          >
            <div className="flex items-center">
              <LogOut className="mr-2 size-4" />
              <span>Log out</span>
            </div>
            {formatShortcut('logout')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};