'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ImprovedTooltip } from '@/components/ui/improved-tooltip';
import { toast } from 'sonner';
import { 
  CheckCircle, 
  AlertCircle,
  LockIcon, 
  SmartphoneIcon, 
  MailIcon, 
  BookOpen,
  MapPin,
  CalendarIcon,
  CameraIcon,
  ChevronDown,
  ChevronUp,
  Clock,
  Smile,
  BellOff,
  Users,
  KeyIcon,
  ShieldCheck,
  Trash2,
  CheckIcon,
  XIcon,
  AlertTriangle,
  Loader,
  LucideIcon
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { MessageSquarePlus } from '@/components/ui/improved-tooltip';
import { useDebounce } from '@/hooks/use-debounce';

// Define types for our component
interface UserData {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  imageUrl?: string;
  bio?: string;
  jobTitle?: string;
  department?: string;
  location?: string;
  status?: 'Active' | 'Busy' | 'Offline';
  customStatus?: string;
  mfaEnabled?: boolean;
  emailNotifications?: boolean;
  createdAt?: number;
  activeSessions?: {
    device: string;
    lastActive: string;
    isCurrent: boolean;
  }[];
}

interface UserProfileContentProps {
  user: {
    name?: string | null;
    status: string;
    jobTitle: string;
    department: string;
    email?: string | null;
    phone: string;
    bio: string;
    image?: string | null;
  };
  statusColor?: string;
  statusIcon?: LucideIcon;
  onClose: () => void;
  // Optional callbacks for when the server implementation is ready
  onSave?: (userData: any) => Promise<void>;
  onUpdateSecurity?: (securityData: any) => Promise<void>;
  onUploadImage?: (file: File | Blob) => Promise<string>;
}

// Field validation schema
interface ValidationSchema {
  email: RegExp;
  phone: RegExp;
}

const validationSchema: ValidationSchema = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\+?[0-9\s\-()]{7,}$/,
};

export function UserProfileContent({ user, statusColor, statusIcon: StatusIcon, onClose, onSave, onUpdateSecurity, onUploadImage }: UserProfileContentProps) {
  const avatarFallback = user.name ? user.name.charAt(0).toUpperCase() : '?';

  // Form state
  const [name, setName] = useState(user.name);
  const [status, setStatus] = useState<'Active' | 'Busy' | 'Offline'>(user.status);
  const [jobTitle, setJobTitle] = useState(user.jobTitle);
  const [department, setDepartment] = useState(user.department);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone);
  const [bio, setBio] = useState(user.bio);
  const [location, setLocation] = useState(user.location || '');
  const [customStatus, setCustomStatus] = useState('');
  const [joinDate, setJoinDate] = useState('January 2023');

  // UI state
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showCustomStatus, setShowCustomStatus] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Field validity state
  const [validation, setValidation] = useState({
    email: true,
    phone: true,
    name: true
  });

  // File upload
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  
  // Debounced values for optimization
  const debouncedEmail = useDebounce(email, 500);
  const debouncedPhone = useDebounce(phone, 500);
  const debouncedName = useDebounce(name, 500);

  // Check for unsaved changes
  useEffect(() => {
    const hasChanges = 
      name !== user.name ||
      email !== user.email ||
      phone !== user.phone ||
      bio !== user.bio ||
      jobTitle !== user.jobTitle ||
      department !== user.department ||
      location !== (user.location || '') ||
      previewImage !== null;
      
    setHasUnsavedChanges(hasChanges);
  }, [name, email, phone, bio, jobTitle, department, location, previewImage, user]);

  // Validation functions and handlers
  const validateField = useCallback((field: string, value: string): boolean => {
    if (field === 'name') return value.trim().length > 0;
    if (field === 'email' || field === 'phone') {
      return field in validationSchema ? validationSchema[field as keyof ValidationSchema].test(value) : true;
    }
    return true;
  }, []);

  const handleFieldChange = useCallback((field: string, value: string) => {
    setValidation(prev => ({
      ...prev,
      [field]: validateField(field, value)
    }));
    
    switch (field) {
      case 'name': setName(value); break;
      case 'email': setEmail(value); break;
      case 'phone': setPhone(value); break;
      case 'bio': setBio(value); break;
      case 'jobTitle': setJobTitle(value); break;
      case 'department': setDepartment(value); break;
      case 'location': setLocation(value); break;
      case 'customStatus': setCustomStatus(value); break;
    }
  }, [validateField]);

  // Auto-validate on debounced values
  useEffect(() => {
    if (debouncedEmail) validateField('email', debouncedEmail);
  }, [debouncedEmail, validateField]);

  useEffect(() => {
    if (debouncedPhone) validateField('phone', debouncedPhone);
  }, [debouncedPhone, validateField]);

  useEffect(() => {
    if (debouncedName) validateField('name', debouncedName);
  }, [debouncedName, validateField]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    const isNameValid = validateField('name', name);
    const isEmailValid = validateField('email', email);
    const isPhoneValid = validateField('phone', phone);
    
    setValidation({
      name: isNameValid,
      email: isEmailValid,
      phone: isPhoneValid
    });
    
    if (!isNameValid || !isEmailValid || !isPhoneValid) {
      toast.error("Please fix the validation errors before saving");
      return;
    }
    
    setSaving(true);
    
    try {
      // Profile data to save
      const profileData = {
        name,
        email,
        phone,
        bio,
        jobTitle,
        department,
        location,
        status: customStatus ? 'Custom' : status,
        customStatus,
        mfaEnabled,
        emailNotifications,
        // Include image if changed
        imageUrl: previewImage ? 'updated-image-url' : user.image
      };

      // Use the onSave prop if provided, otherwise simulate API call
      if (onSave) {
        await onSave(profileData);
      } else {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('Updated profile:', profileData);
      }
      
      setSaved(true);
      setHasUnsavedChanges(false);
      toast.success("Profile updated successfully");
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  // Image upload handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.match('image.*')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            setPreviewImage(e.target.result as string);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setPreviewImage(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setPreviewImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Apply custom status
  const handleApplyCustomStatus = () => {
    if (customStatus.trim()) {
      setShowCustomStatus(false);
    }
  };

  // Change password handler
  const handleChangePassword = () => {
    // For now, just show a toast
    toast.info("Password change functionality would be implemented here");
  };

  // Handle MFA toggle
  const handleMfaToggle = async (enabled: boolean) => {
    setMfaEnabled(enabled);
    
    try {
      // Use callback if provided
      if (onUpdateSecurity) {
        await onUpdateSecurity({ mfaEnabled: enabled });
        toast.success(enabled ? "Two-factor authentication enabled" : "Two-factor authentication disabled");
      } else {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        toast.success(enabled ? "Two-factor authentication enabled" : "Two-factor authentication disabled");
      }
    } catch (error) {
      console.error('MFA toggle error:', error);
      setMfaEnabled(!enabled); // Revert UI state
      toast.error("Failed to update security settings");
    }
  };

  // Handle close with unsaved changes
  const handleClose = () => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm('You have unsaved changes. Are you sure you want to close?');
      if (confirmed) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (hasUnsavedChanges) {
          // Ask for confirmation
          const confirmed = window.confirm('You have unsaved changes. Are you sure you want to close?');
          if (confirmed) {
            onClose();
          }
        } else {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [hasUnsavedChanges, onClose]);

  // Dummy active sessions data for the UI
  const activeSessions = [
    {
      device: "Chrome on Mac",
      lastActive: "Active now",
      isCurrent: true
    },
    {
      device: "Safari on iPhone",
      lastActive: "2 hours ago",
      isCurrent: false
    }
  ];

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center">
          <Loader className="h-8 w-8 text-primary animate-spin" />
          <p className="mt-4 text-sm text-gray-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-h-[90vh] overflow-y-auto">
      <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col md:flex-row">
        {/* LEFT SECTION (1/3) */}
        <div className="md:w-1/3 bg-gray-50 dark:bg-gray-800 p-6 flex flex-col">
          {/* Profile Image */}
          <div 
            className={cn(
              "relative group w-full flex-shrink-0 rounded-lg transition-colors mb-6",
              isDraggingOver && "bg-blue-50 border-2 border-dashed border-blue-300 p-4"
            )}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              className="hidden"
              accept="image/*"
            />
            
            <div className="relative mx-auto">
              <Avatar 
                className={cn(
                  "size-32 md:size-40 border-4 border-white dark:border-gray-700 shadow-xl cursor-pointer group-hover:opacity-90 transition-opacity mx-auto",
                  isDraggingOver && "opacity-60"
                )}
                onClick={() => fileInputRef.current?.click()}
              >
                <AvatarImage 
                  src={previewImage || user.image} 
                  className="object-cover"
                />
                <AvatarFallback className="text-3xl font-bold bg-primary text-white">
                  {name.charAt(0)}
                </AvatarFallback>
                
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                  <CameraIcon className="h-8 w-8 text-white" />
                  <span className="text-xs text-white mt-1">Change</span>
                </div>
              </Avatar>
              
              {previewImage && (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
                  aria-label="Remove profile picture"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
            
            <p className="text-xs text-center mt-2 text-gray-400">
              {isDraggingOver ? "Drop image here" : "Click or drag to upload photo"}
            </p>
          </div>
          
          {/* User Name and Status */}
          <div className="text-center mb-6">
            <Input 
              value={name}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              className={cn(
                "text-xl font-bold text-center border-none bg-transparent focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
                !validation.name && "border-red-500"
              )}
              placeholder="Your name"
            />
            {!validation.name && (
              <p className="text-xs text-red-500 mt-1">Name is required</p>
            )}
            
            <div className="mt-2 flex justify-center">
              {!showCustomStatus ? (
                <Badge 
                  variant={status === 'Active' ? 'success' : status === 'Busy' ? 'warning' : 'default'} 
                  className="cursor-pointer mt-1 transition-all duration-150 hover:shadow-sm px-3 py-1 rounded-full"
                  onClick={() => {
                    const statusOrder = ['Active', 'Busy', 'Offline'];
                    const currentIndex = statusOrder.indexOf(status);
                    const nextIndex = (currentIndex + 1) % statusOrder.length;
                    setStatus(statusOrder[nextIndex] as 'Active' | 'Busy' | 'Offline');
                  }}
                >
                  {status === 'Active' ? (
                    <CheckCircle className="h-3 w-3 mr-2" />
                  ) : status === 'Busy' ? (
                    <Clock className="h-3 w-3 mr-2" />
                  ) : (
                    <div className="h-3 w-3 bg-gray-500 rounded-full mr-2" />
                  )}
                  {status}
                </Badge>
              ) : (
                <div className="flex items-center mt-1">
                  <Input
                    value={customStatus}
                    onChange={(e) => handleFieldChange('customStatus', e.target.value)}
                    placeholder="Set status..."
                    className="h-8 text-sm"
                    autoFocus
                  />
                  <Button 
                    type="button" 
                    size="sm" 
                    variant="ghost" 
                    onClick={handleApplyCustomStatus} 
                    className="ml-2 h-8 w-8 p-0"
                  >
                    <CheckIcon className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          {/* Additional Info Section */}
          <Separator className="mb-6" />
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Smile className="h-4 w-4 text-gray-500" />
              <Input
                value={jobTitle}
                onChange={(e) => handleFieldChange('jobTitle', e.target.value)}
                className="border-none text-sm p-0 h-auto focus-visible:ring-0 bg-transparent"
                placeholder="Add job title"
              />
            </div>
            
            <div className="flex items-center gap-3">
              <Users className="h-4 w-4 text-gray-500" />
              <Input
                value={department}
                onChange={(e) => handleFieldChange('department', e.target.value)}
                className="border-none text-sm p-0 h-auto focus-visible:ring-0 bg-transparent"
                placeholder="Add department"
              />
            </div>
            
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-gray-500" />
              <Input
                value={location}
                onChange={(e) => handleFieldChange('location', e.target.value)}
                className="border-none text-sm p-0 h-auto focus-visible:ring-0 bg-transparent"
                placeholder="Add location"
              />
            </div>
            
            <div className="flex items-center gap-3">
              <CalendarIcon className="h-4 w-4 text-gray-500" />
              <p className="text-sm text-muted-foreground">Member since {joinDate}</p>
            </div>
          </div>
          
          <div className="mt-auto pt-6">
            {saved && (
              <div className="text-sm text-green-600 flex items-center justify-center mb-4 animate-in fade-in px-3 py-1 bg-green-50 rounded-md">
                <CheckCircle className="h-4 w-4 mr-1" /> Changes saved
              </div>
            )}
          </div>
        </div>
        
        {/* RIGHT SECTION (2/3) */}
        <div className="md:w-2/3 p-6 bg-[#F9FAFB] dark:bg-gray-900">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold">Personal Information</h3>
            
            {hasUnsavedChanges && (
              <div className="text-xs text-amber-600 flex items-center bg-amber-50 px-2 py-1 rounded-md">
                <AlertCircle className="h-3 w-3 mr-1" /> Unsaved changes
              </div>
            )}
          </div>
          
          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm flex items-center gap-2">
                <MailIcon className="h-4 w-4 text-gray-500" />
                Email Address
              </label>
              <div className="relative">
                <Input 
                  id="email"
                  type="email" 
                  value={email} 
                  onChange={(e) => handleFieldChange('email', e.target.value)}
                  className={cn(
                    "bg-white dark:bg-gray-800 border border-gray-200 hover:border-gray-300 focus:border-blue-500 shadow-sm",
                    !validation.email && "border-red-500 bg-red-50"
                  )}
                />
                {!validation.email && (
                  <p className="text-xs text-red-500 mt-1">Valid email required</p>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm flex items-center gap-2">
                <SmartphoneIcon className="h-4 w-4 text-gray-500" />
                Phone Number
              </label>
              <div className="relative">
                <Input 
                  id="phone"
                  type="tel" 
                  value={phone} 
                  onChange={(e) => handleFieldChange('phone', e.target.value)}
                  className={cn(
                    "bg-white dark:bg-gray-800 border border-gray-200 hover:border-gray-300 focus:border-blue-500 shadow-sm",
                    !validation.phone && "border-red-500 bg-red-50"
                  )}
                />
                {!validation.phone && (
                  <p className="text-xs text-red-500 mt-1">Valid phone number required</p>
                )}
              </div>
            </div>
          </div>
          
          {/* Biography */}
          <div className="mb-6">
            <label htmlFor="bio" className="text-sm flex items-center gap-2 mb-2">
              <BookOpen className="h-4 w-4 text-gray-500" />
              Biography
            </label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => handleFieldChange('bio', e.target.value)}
              rows={4}
              className="resize-none bg-white dark:bg-gray-800 border border-gray-200 hover:border-gray-300 focus:border-blue-500 shadow-sm"
              placeholder="Tell us about yourself..."
            />
          </div>
          
          {/* Security Section */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-md mb-6 shadow-sm border border-gray-200">
            <h4 className="font-medium flex items-center gap-2 mb-4">
              <ShieldCheck className="h-4 w-4 text-blue-600" />
              Security
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md">
                <div>
                  <p className="font-medium text-sm">Password</p>
                  <p className="text-xs text-muted-foreground">Last updated 3 months ago</p>
                </div>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  className="h-8 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors"
                  onClick={handleChangePassword}
                >
                  Change
                </Button>
              </div>

              <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md">
                <div>
                  <p className="font-medium text-sm">Two-factor Authentication</p>
                  <p className="text-xs text-muted-foreground">{mfaEnabled ? 'Enabled' : 'Disabled'}</p>
                </div>
                <Switch 
                  checked={mfaEnabled} 
                  onCheckedChange={handleMfaToggle}
                  className={cn(
                    mfaEnabled ? "bg-blue-500" : "bg-gray-400"
                  )}
                />
              </div>
            </div>
          </div>
          
          {/* Advanced Settings Toggle */}
          <Button 
            type="button" 
            variant="ghost" 
            className="flex items-center justify-center gap-2 w-full hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            {showAdvanced ? 'Hide' : 'Show'} Advanced Settings
            {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
          
          {/* Advanced Settings */}
          {showAdvanced && (
            <div className="mt-4 space-y-4 animate-in slide-in-from-top-5">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow-sm border border-gray-200">
                <h4 className="font-medium flex items-center gap-2 mb-3">
                  <BellOff className="h-4 w-4" />
                  Notification Preferences
                </h4>
                
                <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-xs text-muted-foreground">Receive updates via email</p>
                  </div>
                  <Switch 
                    checked={emailNotifications} 
                    onCheckedChange={setEmailNotifications}
                    className={cn(
                      emailNotifications ? "bg-blue-500" : "bg-gray-400"
                    )}
                  />
                </div>
              </div>

              {/* Active Sessions */}
              <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow-sm border border-gray-200">
                <h4 className="font-medium mb-3">Active Sessions</h4>
                <div className="space-y-3">
                  {activeSessions.map((session, index) => (
                    <div key={index} className="flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md">
                      <div>
                        <p className="font-medium">{session.device}</p>
                        <p className="text-xs text-muted-foreground">{session.lastActive}</p>
                      </div>
                      {session.isCurrent ? (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-transparent">Current</Badge>
                      ) : (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 text-red-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                        >
                          Sign Out
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="mt-8 flex justify-end gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={saving}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 border-0"
            >
              Cancel
            </Button>
            
            <Button 
              type="submit" 
              disabled={saving || !hasUnsavedChanges}
              className="min-w-[100px] bg-blue-600 hover:bg-blue-700 text-white"
            >
              {saving ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent border-white"></span>
                  Saving...
                </>
              ) : "Save Changes"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
