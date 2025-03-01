import Link from 'next/link';
import { Id } from '../../../../../../convex/_generated/dataModel';
import {
  AlertTriangle,
  ChevronDownIcon,
  Loader,
  MailIcon,
  XIcon,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu';

import { useGetMember } from '@/features/members/api/use-get-member';
import { useUpdateMember } from '@/features/members/api/use-update-member';
import { useRemoveMember } from '@/features/members/api/use-remove-member';
import { useCurrentMember } from '@/features/members/api/use-current-member';

import { useWorkspaceId } from '@/hooks/use-workspace-id';
import { toast } from 'sonner';
import { useConfirm } from '@/hooks/use-confirm';
import { useRouter } from 'next/navigation';
import { SimpleModal } from '@/components/SimpleModal';
import { UserProfileContent } from '@/components/UserProfileContent';
import { useState } from 'react';
import { 
  fetchUserProfile, 
  updateUserProfile, 
  updateUserSecurity,
  uploadProfileImage,
  ProfileUpdateData
} from '@/services/profile-service';

interface ProfileProps {
  memberId: Id<'members'>;
  onClose: () => void;
}

export const Profile = ({ memberId, onClose }: ProfileProps) => {
  const router = useRouter();
  const workspaceId = useWorkspaceId();

  const [LeaveDialog, confirmLeave] = useConfirm(
    'Leave workspace',
    'Are you sure you want to leave this workspace?'
  );
  const [RemoveDialog, confirmRemove] = useConfirm(
    'Remove member',
    'Are you sure you want to remove this member?'
  );
  const [UpdateDialog, confirmUpdate] = useConfirm(
    'Change role',
    "Are you sure you want to change this member's role?"
  );

  const { data: currentMember, isLoading: isLoadingCurrentMember } =
    useCurrentMember({
      workspaceId,
    });
  const { data: member, isLoading: isLoadingMember } = useGetMember({
    id: memberId,
  });

  const { mutate: updateMember, isPending: isUpdatingMember } =
    useUpdateMember();
  const { mutate: removeMember, isPending: isRemovingMember } =
    useRemoveMember();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  // Define handlers for UserProfileContent
  const handleSaveProfile = async (data: ProfileUpdateData) => {
    try {
      await updateUserProfile(member.user._id, data);
      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
      return false;
    }
  };

  const handleUpdateSecurity = async (securityData: { mfaEnabled: boolean }) => {
    try {
      await updateUserSecurity(member.user._id, securityData);
      return true;
    } catch (error) {
      console.error('Error updating security settings:', error);
      toast.error('Failed to update security settings');
      return false;
    }
  };

  const handleUploadImage = async (imageFile: File | Blob | string) => {
    try {
      const imageUrl = await uploadProfileImage(imageFile);
      return imageUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
      throw error;
    }
  };

  const onRemove = async () => {
    const ok = await confirmRemove();

    if (!ok) return;
    removeMember(
      {
        id: memberId,
      },
      {
        onSuccess: () => {
          toast.success('Member removed successfully');
          onClose();
        },
        onError: () => {
          toast.error('Failed to remove member');
        },
      }
    );
  };

  const onLeave = async () => {
    const ok = await confirmLeave();

    if (!ok) return;

    removeMember(
      {
        id: memberId,
      },
      {
        onSuccess: () => {
          router.replace('/');
          toast.success('You have left the workspace');
          onClose();
        },
        onError: () => {
          toast.error('Failed to leave the workspace');
        },
      }
    );
  };

  const onUpdate = async (role: 'admin' | 'member') => {
    const ok = await confirmUpdate();

    if (!ok) return;

    updateMember(
      { id: memberId, role },
      {
        onSuccess: () => {
          toast.success('Role changed');
          onClose();
        },
        onError: () => {
          toast.error('Failed to change role');
        },
      }
    );
  };

  if (isLoadingMember || isLoadingCurrentMember) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex h-[49px] items-center justify-between border-b px-4">
          <p className="text-lg font-bold">Profile</p>
          <Button size="iconSm" variant="ghost" onClick={onClose}>
            <XIcon className="size-5 stroke-[1.5]" />
          </Button>
        </div>
        <div className="flex h-full flex-col items-center justify-center gap-y-2">
          <Loader className="size-5 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }
  if (!member) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex h-[49px] items-center justify-between border-b px-4">
          <p className="text-lg font-bold">Profile</p>
          <Button size="iconSm" variant="ghost" onClick={onClose}>
            <XIcon className="size-5 stroke-[1.5]" />
          </Button>
        </div>
        <div className="flex h-full flex-col items-center justify-center gap-y-2">
          <AlertTriangle className="size-5 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Profile not found</p>
        </div>
      </div>
    );
  }

  const avatarFallback = member.user.name?.[0] ?? 'M';

  return (
    <>
      <RemoveDialog />
      <LeaveDialog />
      <UpdateDialog />
      <SimpleModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal}
        title="User Profile"
        maxWidth="max-w-6xl" // Make it slightly wider for better layout
      >
        <UserProfileContent
          user={{
            name: member.user.name || '',
            status: 'Active',
            jobTitle: member.user.jobTitle || 'Software Engineer',
            department: member.user.department || 'Engineering',
            email: member.user.email || '',
            phone: member.user.phone || '',
            bio: member.user.bio || '',
            image: member.user.imageUrl || '',
            location: member.user.location || '',
          }}
          onClose={handleCloseModal}
          onSave={handleSaveProfile}
          onUpdateSecurity={handleUpdateSecurity}
          onUploadImage={handleUploadImage}
        />
      </SimpleModal>
      <div className="flex h-full flex-col">
        <div className="flex h-[49px] items-center justify-between border-b px-4">
          <p className="text-lg font-bold">Profile</p>
          <Button size="iconSm" variant="ghost" onClick={onClose}>
            <XIcon className="size-5 stroke-[1.5]" />
          </Button>
        </div>
        <div className="flex flex-col items-center justify-center p-4">
          <Avatar className="size-full max-h-[256px] max-w-[256px]">
            <AvatarImage src={member.user.image} />
            <AvatarFallback className="aspect-square text-6xl">
              {avatarFallback}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="flex flex-col p-4">
          <p className="text-xl font-bold">{member.user.name}</p>
          <Button onClick={handleOpenModal} variant="outline" className="mt-4">
            Edit Profile
          </Button>
          {currentMember?.role === 'admin' && currentMember._id !== memberId ? (
            <div className="mt-4 flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full capitalize">
                    {member.role} <ChevronDownIcon className="ml-2 size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full">
                  <DropdownMenuRadioGroup
                    value={member.role}
                    onValueChange={(role) =>
                      onUpdate(role as 'admin' | 'member')
                    }
                  >
                    <DropdownMenuRadioItem value="admin">
                      Admin
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="member">
                      Member
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button onClick={onRemove} variant="outline" className="w-full">
                Remove
              </Button>
            </div>
          ) : currentMember?._id === memberId &&
            currentMember.role !== 'admin' ? (
            <div className="mt-4">
              <Button onClick={onLeave} variant="outline" className="w-full">
                Leave workspace
              </Button>
            </div>
          ) : null}
        </div>
        <Separator />
        <div className="flex flex-col p-4">
          <p className="mb-4 text-sm font-bold">Contact information</p>
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-md bg-muted">
              <MailIcon className="size-4" />
            </div>
            <div className="flex flex-col">
              <p className="text-[13px] font-semibold text-muted-foreground">
                Email Address
              </p>
              <Link
                href={`mailto:${member.user.email}`}
                className="text-sm text-[#1264a3] hover:underline"
              >
                {member.user.email}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
