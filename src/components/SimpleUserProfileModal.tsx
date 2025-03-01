import { useState } from 'react';

interface SimpleUserProfileModalProps {
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

export const SimpleUserProfileModal = ({ isOpen, onClose, user }: SimpleUserProfileModalProps) => {
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl p-6">
        <button onClick={onClose} className="absolute top-4 right-4">
          X
        </button>
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row">
          <div className="md:w-1/3 p-4 border-r">
            <div className="size-full max-h-[256px] max-w-[256px] mx-auto">
              <img src={user.image} alt={user.name} className="rounded-full" />
            </div>
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
                <label htmlFor="email">Email</label>
                <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div>
                <label htmlFor="phone">Phone</label>
                <input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div>
                <label htmlFor="bio">Biography</label>
                <input id="bio" type="text" value={bio} onChange={(e) => setBio(e.target.value)} />
              </div>
              <div className="mt-4">
                <h4 className="font-medium leading-none">Security Settings</h4>
                <button type="button" className="mt-2">Change Password</button>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={onClose}>Cancel</button>
              <button type="submit">Save</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
