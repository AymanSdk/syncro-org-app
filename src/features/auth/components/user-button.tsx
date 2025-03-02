'use client';

import { useCurrentUser } from '@/app/auth/api/use-current-user';
import { useAuthActions } from '@convex-dev/auth/react';

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

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  DropdownMenuSub,
  DropdownMenuSubTrigger,
} from '@radix-ui/react-dropdown-menu';
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
  User,
  Users,
} from 'lucide-react';
import { useState } from 'react';
import { SimpleModal } from '@/components/SimpleModal';
import { UserProfileContent } from '@/components/UserProfileContent';

export const UserButton = () => {
  const [status, setStatus] = useState('available');
  const [customStatus, setCustomStatus] = useState('');
  const [expirationTime, setExpirationTime] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { signOut } = useAuthActions();
  const { data, isLoading } = useCurrentUser();

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

  const { image, name } = data;

  const avatarFallback = name!.charAt(0).toUpperCase();

  return (
    <>
      <SimpleModal isOpen={isModalOpen} onClose={handleCloseModal}>
        <UserProfileContent
          user={{
            name: data.name,
            status: currentStatus.label, // Use the current status label here
            jobTitle: 'Software Engineer',
            department: 'Engineering',
            email: data.email,
            phone: '123-456-7890',
            bio: 'A brief biography...',
            image: data.image,
          }}
          statusColor={currentStatus.color} // Pass status color
          statusIcon={currentStatus.icon} // Pass status icon
          onClose={handleCloseModal}
        />
      </SimpleModal>

      <DropdownMenu modal={false}>
        <DropdownMenuTrigger className="relative outline-none">
          <Avatar className="size-10 rounded-md transition hover:opacity-75">
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
        <DropdownMenuContent align="end" className="w-56" side="right" forceMount>
          {/* user status */}
          <DropdownMenuGroup>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="flex items-center">
                <StatusIcon className={`mr-2 h-4 w-4 ${currentStatus.color}`} />
                <span>{currentStatus.label}</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-56">
                {statuses.map((statusOption) => (
                  <DropdownMenuItem
                    key={statusOption.value}
                    onClick={() => setStatus(statusOption.value)}
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
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={handleOpenModal}>
              <User className="mr-2 size-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 size-4" />
              <span>Settings</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <Users className="mr-2 size-4" />
              <span>Team</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Plus className="mr-2 size-4" />
              <span>Create Workspace</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Github className="mr-2 size-4" />
            <span>GitHub</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <LifeBuoy className="mr-2 size-4" />
            <span>Support</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <LogOut className="mr-2 size-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
