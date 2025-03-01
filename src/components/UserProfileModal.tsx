import { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { XIcon } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    name: string;
    status: 'Active' | 'Busy';
    jobTitle: string;
    department: string;
    email: string;
    phone: string;
    bio: string;
    image: string;
  };
}

export const UserProfileModal = ({ isOpen, onClose, user }: UserProfileModalProps) => {
  console.log('UserProfileModal rendered');
  
  const [name, setName] = useState(user.name);
  const [status, setStatus] = useState(user.status);
  const [jobTitle, setJobTitle] = useState(user.jobTitle);
  const [department, setDepartment] = useState(user.department);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone);
  const [bio, setBio] = useState(user.bio);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ name, status, jobTitle, department, email, phone, bio });
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="fixed inset-0 z-10 overflow-y-auto" onClose={onClose}>
        <div className="min-h-screen px-4 text-center">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50" />
          </Transition.Child>

          <span className="inline-block h-screen align-middle" aria-hidden="true">
            &#8203;
          </span>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <div className="inline-block w-full max-w-4xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
              <button onClick={onClose} className="absolute top-4 right-4">
                <XIcon className="size-5" />
              </button>
              <form onSubmit={handleSubmit} className="flex flex-col md:flex-row">
                <div className="md:w-1/3 p-4 border-r">
                  <Avatar className="size-full max-h-[256px] max-w-[256px] mx-auto">
                    <AvatarImage src={user.image} />
                    <AvatarFallback className="aspect-square text-6xl">
                      {user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="mt-4 text-center">
                    <p className="text-xl font-bold">{name}</p>
                    <p className="text-sm text-gray-500">{status}</p>
                    <p className="mt-2 text-sm">{jobTitle}</p>
                    <p className="text-sm">{department}</p>
                  </div>
                </div>
                <div className="md:w-2/3 p-4">
                  <div className="grid gap-4">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="bio">Biography</Label>
                      <Input id="bio" type="text" value={bio} onChange={(e) => setBio(e.target.value)} />
                    </div>
                    <div className="mt-4">
                      <h4 className="font-medium leading-none">Security Settings</h4>
                      <Button variant="outline" className="mt-2">Change Password</Button>
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Save</Button>
                  </div>
                </div>
              </form>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};
