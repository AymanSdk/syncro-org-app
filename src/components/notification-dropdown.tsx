'use client';

import React, { useState } from 'react';
import {
  Bell,
  BellOff,
  Check,
  Clock,
  MailOpen,
  MoreVertical,
  Trash2,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

// Example notification data - in a real app, you'd fetch this from an API
export type NotificationType = 'mention' | 'message' | 'invite' | 'system';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  content: string;
  time: string;
  read: boolean;
  sender?: {
    name: string;
    avatar?: string;
  };
}

const demoNotifications: Notification[] = [
  {
    id: '1',
    type: 'mention',
    title: 'You were mentioned',
    content: '@johndoe mentioned you in #general: "Could you take a look at this?"',
    time: '2 minutes ago',
    read: false,
    sender: {
      name: 'John Doe',
      avatar: 'https://github.com/shadcn.png',
    },
  },
  {
    id: '2',
    type: 'message',
    title: 'New message',
    content: 'Jane Smith sent you a direct message.',
    time: '1 hour ago',
    read: false,
    sender: {
      name: 'Jane Smith',
      avatar: 'https://github.com/shadcn.png',
    },
  },
  {
    id: '3',
    type: 'invite',
    title: 'Workspace invitation',
    content: 'You have been invited to join the "Design Team" workspace',
    time: '3 hours ago',
    read: true,
  },
  {
    id: '4',
    type: 'system',
    title: 'System update',
    content: 'The system will be under maintenance tonight from 2am to 4am UTC',
    time: '1 day ago',
    read: true,
  },
  {
    id: '5',
    type: 'mention',
    title: 'You were mentioned',
    content: '@sarahparker mentioned you in #design: "Nice work on the latest mockups!"',
    time: '2 days ago',
    read: true,
    sender: {
      name: 'Sarah Parker',
      avatar: 'https://github.com/shadcn.png',
    },
  },
];

const NotificationItem = ({
  notification,
  onMarkAsRead,
  onDelete,
}: {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}) => {
  const getIconForType = (type: NotificationType) => {
    switch (type) {
      case 'mention':
        return <User className="h-4 w-4 text-blue-500" />;
      case 'message':
        return <MailOpen className="h-4 w-4 text-green-500" />;
      case 'invite':
        return <User className="h-4 w-4 text-purple-500" />;
      case 'system':
        return <Bell className="h-4 w-4 text-orange-500" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  return (
    <div className={`flex items-start gap-2 p-3 rounded-md ${notification.read ? 'opacity-75' : 'bg-muted/40'}`}>
      <div className="flex-shrink-0 mt-1">{getIconForType(notification.type)}</div>
      <div className="flex-grow min-w-0">
        <p className={`text-sm font-medium ${!notification.read ? 'font-semibold' : ''}`}>{notification.title}</p>
        <p className="text-xs text-muted-foreground line-clamp-2">{notification.content}</p>
        <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
      </div>
      <div className="flex flex-col gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <MoreVertical className="h-3 w-3" />
              <span className="sr-only">Actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            {!notification.read && (
              <DropdownMenuItem onClick={() => onMarkAsRead(notification.id)}>
                <Check className="mr-2 h-4 w-4" />
                <span>Mark as read</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => onDelete(notification.id)}>
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export const NotificationDropdown = () => {
  const [notifications, setNotifications] = useState<Notification[]>(demoNotifications);
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAsRead = (id: string) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const handleDelete = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const handleToggleDND = () => {
    // Toggle Do Not Disturb mode - in a real app this would update user preferences
    console.log('Toggle Do Not Disturb');
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 flex items-center justify-center p-0 text-[9px]"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-3 border-b">
          <h3 className="font-medium">Notifications</h3>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handleToggleDND}
              title="Do not disturb"
            >
              <BellOff className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0}
              title="Mark all as read"
            >
              <Check className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <Tabs defaultValue="all">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
            <TabsTrigger value="unread" className="text-xs">
              Unread
              {unreadCount > 0 && <Badge variant="secondary" className="ml-1">{unreadCount}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="mentions" className="text-xs">Mentions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all">
            <ScrollArea className="h-[320px]">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[200px] text-center p-4">
                  <Clock className="h-10 w-10 text-muted-foreground mb-2 opacity-50" />
                  <p className="text-sm font-medium">No notifications</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    When you get notifications, they'll show up here
                  </p>
                </div>
              ) : (
                <div className="flex flex-col divide-y">
                  {notifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onMarkAsRead={handleMarkAsRead}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="unread">
            <ScrollArea className="h-[320px]">
              {notifications.filter((n) => !n.read).length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[200px] text-center p-4">
                  <Check className="h-10 w-10 text-muted-foreground mb-2 opacity-50" />
                  <p className="text-sm font-medium">All caught up!</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    You've read all your notifications
                  </p>
                </div>
              ) : (
                <div className="flex flex-col divide-y">
                  {notifications
                    .filter((n) => !n.read)
                    .map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onMarkAsRead={handleMarkAsRead}
                        onDelete={handleDelete}
                      />
                    ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="mentions">
            <ScrollArea className="h-[320px]">
              {notifications.filter((n) => n.type === 'mention').length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[200px] text-center p-4">
                  <User className="h-10 w-10 text-muted-foreground mb-2 opacity-50" />
                  <p className="text-sm font-medium">No mentions</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    When someone mentions you, it will show up here
                  </p>
                </div>
              ) : (
                <div className="flex flex-col divide-y">
                  {notifications
                    .filter((n) => n.type === 'mention')
                    .map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onMarkAsRead={handleMarkAsRead}
                        onDelete={handleDelete}
                      />
                    ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
        
        <DropdownMenuSeparator />
        <div className="p-2">
          <Button variant="ghost" size="sm" className="w-full text-sm justify-center" onClick={handleClearAll}>
            Clear all notifications
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
