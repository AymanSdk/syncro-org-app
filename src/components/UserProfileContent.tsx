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
  LucideIcon,
  Building,
  Sparkles,
  Globe,
  Activity
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { MessageSquarePlus } from '@/components/ui/improved-tooltip';
import { useDebounce } from '@/hooks/use-debounce';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Import the simplified ScrollArea
import { ScrollArea } from "@/components/ui/scroll-area";

// Check if framer-motion is available, if not, provide fallbacks
let motion: any = {
  div: "div",
  button: "button",
};

try {
  const framerMotion = require("framer-motion");
  if (framerMotion) {
    motion = framerMotion;
  }
} catch (e) {
  // Fallback already set above
  console.log("Framer Motion not available, using fallbacks");
}

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
    location?: string;
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
  const [name, setName] = useState(user.name || '');
  const [status, setStatus] = useState<'Active' | 'Busy' | 'Offline'>(user.status as any || 'Active');
  const [jobTitle, setJobTitle] = useState(user.jobTitle || '');
  const [department, setDepartment] = useState(user.department || '');
  const [email, setEmail] = useState(user.email || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [bio, setBio] = useState(user.bio || '');
  const [location, setLocation] = useState(user.location || '');
  const [customStatus, setCustomStatus] = useState('');
  const [joinDate, setJoinDate] = useState('January 2023');
  const [activeTab, setActiveTab] = useState("profile");

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

  // Motion components with fallbacks
  const MotionDiv = motion.div || "div";
  const MotionButton = motion.button || "button";

  return (
    <div className="max-h-[85vh] overflow-hidden border border-gray-100 dark:border-gray-800 rounded-xl shadow-lg">
      <Tabs 
        defaultValue="profile" 
        value={activeTab} 
        onValueChange={setActiveTab} 
        className="w-full"
      >
        <div className="border-b border-gray-100 dark:border-gray-800 px-6 py-3 bg-white dark:bg-gray-900">
          <div className="flex justify-between items-center">
            <TabsList className="grid w-auto grid-cols-3 bg-muted/50 rounded-lg p-1">
              <TabsTrigger 
                value="profile" 
                className="data-[state=active]:bg-white data-[state=active]:text-primary dark:data-[state=active]:bg-gray-800 rounded-md px-6"
              >
                Profile
              </TabsTrigger>
              <TabsTrigger 
                value="preferences" 
                className="data-[state=active]:bg-white data-[state=active]:text-primary dark:data-[state=active]:bg-gray-800 rounded-md px-6"
              >
                Preferences
              </TabsTrigger>
              <TabsTrigger 
                value="security" 
                className="data-[state=active]:bg-white data-[state=active]:text-primary dark:data-[state=active]:bg-gray-800 rounded-md px-6"
              >
                Security
              </TabsTrigger>
            </TabsList>

            {hasUnsavedChanges && (
              <div className="text-xs text-amber-600 flex items-center bg-amber-50 px-3 py-1.5 rounded-full">
                <AlertCircle className="h-3 w-3 mr-1" /> Unsaved changes
              </div>
            )}
          </div>
        </div>
        
        {/* Using the simplified ScrollArea component */}
        <div className="max-h-[75vh] overflow-auto">
          <form ref={formRef} onSubmit={handleSubmit} className="p-0 m-0">
            <TabsContent value="profile" className="m-0 p-0">
              <div className="flex flex-col md:flex-row">
                {/* LEFT SECTION */}
                <div className="md:w-1/3 bg-[#fafbfc] dark:bg-gray-900 p-8 border-r border-gray-100 dark:border-gray-800">
                  {/* Profile Image */}
                  <div 
                    className={cn(
                      "relative group w-full rounded-xl transition-colors mb-8",
                      isDraggingOver ? "bg-blue-50 border-2 border-dashed border-blue-300 p-6" : "p-4"
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
                          "size-36 md:size-44 lg:size-48 border-4 border-white dark:border-gray-800 shadow-xl cursor-pointer group-hover:opacity-95 transition-all duration-300 mx-auto",
                          isDraggingOver && "opacity-60"
                        )}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <AvatarImage 
                          src={previewImage || user.image || ''} 
                          className="object-cover"
                        />
                        <AvatarFallback 
                          className="text-3xl font-bold bg-gradient-to-br from-blue-500 to-violet-500 text-white"
                        >
                          {name?.charAt(0) || '?'}
                        </AvatarFallback>
                        
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full backdrop-blur-sm">
                          <CameraIcon className="h-8 w-8 text-white" />
                          <span className="text-xs font-medium text-white mt-1">Update photo</span>
                        </div>
                      </Avatar>
                      
                      {previewImage && (
                        <MotionButton
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          type="button"
                          onClick={handleRemoveImage}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-lg hover:bg-red-600 transition-colors"
                          aria-label="Remove profile picture"
                        >
                          <Trash2 className="h-4 w-4" />
                        </MotionButton>
                      )}
                    </div>
                    
                    <p className="text-xs text-center mt-3 text-gray-500 font-medium">
                      {isDraggingOver ? "Drop to upload" : "Click or drag to upload new photo"}
                    </p>
                  </div>
                  
                  {/* User Name */}
                  <div className="text-center mb-8">
                    <div className="relative inline-block max-w-full">
                      <Input 
                        value={name}
                        onChange={(e) => handleFieldChange('name', e.target.value)}
                        className={cn(
                          "text-2xl font-bold text-center border-none bg-transparent focus-visible:ring-blue-500/40 focus-visible:ring-2 focus-visible:ring-offset-0 rounded-lg px-4 py-2",
                          !validation.name && "border-red-500"
                        )}
                        placeholder="Your name"
                      />
                      {!validation.name && (
                        <MotionDiv 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-xs text-red-500 mt-1 absolute left-0 right-0"
                        >
                          Name is required
                        </MotionDiv>
                      )}
                    </div>
                    
                    {/* Status Badge */}
                    <div className="mt-3 flex justify-center">
                      {!showCustomStatus ? (
                        <Badge 
                          variant={status === 'Active' ? 'success' : status === 'Busy' ? 'warning' : 'default'} 
                          className="cursor-pointer transition-all duration-300 hover:shadow-md px-4 py-1.5 text-sm rounded-full"
                          onClick={() => {
                            const statusOrder = ['Active', 'Busy', 'Offline'];
                            const currentIndex = statusOrder.indexOf(status);
                            const nextIndex = (currentIndex + 1) % statusOrder.length;
                            setStatus(statusOrder[nextIndex] as 'Active' | 'Busy' | 'Offline');
                          }}
                        >
                          {status === 'Active' ? (
                            <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                          ) : status === 'Busy' ? (
                            <Clock className="h-3.5 w-3.5 mr-1.5" />
                          ) : (
                            <div className="h-3.5 w-3.5 bg-gray-500 rounded-full mr-1.5" />
                          )}
                          {status}
                        </Badge>
                      ) : (
                        <MotionDiv 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center mt-1"
                        >
                          <Input
                            value={customStatus}
                            onChange={(e) => handleFieldChange('customStatus', e.target.value)}
                            placeholder="Set status..."
                            className="h-9 text-sm"
                            autoFocus
                          />
                          <Button 
                            type="button" 
                            size="sm" 
                            variant="ghost" 
                            onClick={handleApplyCustomStatus} 
                            className="ml-2 h-9 w-9 p-0"
                          >
                            <CheckIcon className="h-4 w-4" />
                          </Button>
                        </MotionDiv>
                      )}
                    </div>
                  </div>
                  
                  {/* Additional Info Section */}
                  <Separator className="my-6" />
                  
                  <div className="space-y-5">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-50 dark:bg-blue-900/30 p-2 rounded-md">
                        <Sparkles className="h-4 w-4 text-blue-500" />
                      </div>
                      <Input
                        value={jobTitle}
                        onChange={(e) => handleFieldChange('jobTitle', e.target.value)}
                        className="border-none text-sm p-0 h-auto focus-visible:ring-0 bg-transparent"
                        placeholder="Add job title"
                      />
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="bg-violet-50 dark:bg-violet-900/30 p-2 rounded-md">
                        <Building className="h-4 w-4 text-violet-500" />
                      </div>
                      <Input
                        value={department}
                        onChange={(e) => handleFieldChange('department', e.target.value)}
                        className="border-none text-sm p-0 h-auto focus-visible:ring-0 bg-transparent"
                        placeholder="Add department"
                      />
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="bg-emerald-50 dark:bg-emerald-900/30 p-2 rounded-md">
                        <Globe className="h-4 w-4 text-emerald-500" />
                      </div>
                      <Input
                        value={location}
                        onChange={(e) => handleFieldChange('location', e.target.value)}
                        className="border-none text-sm p-0 h-auto focus-visible:ring-0 bg-transparent"
                        placeholder="Add location"
                      />
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="bg-amber-50 dark:bg-amber-900/30 p-2 rounded-md">
                        <CalendarIcon className="h-4 w-4 text-amber-500" />
                      </div>
                      <p className="text-sm text-muted-foreground">Member since {joinDate}</p>
                    </div>
                  </div>
                  
                  <div className="mt-auto pt-6">
                    {saved && (
                      <MotionDiv 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-sm text-green-600 flex items-center justify-center mb-4 px-3 py-2 bg-green-50 rounded-lg"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" /> Changes saved successfully
                      </MotionDiv>
                    )}
                  </div>
                </div>
                
                {/* RIGHT SECTION */}
                <div className="md:w-2/3 p-8 bg-white dark:bg-gray-950">
                  <h3 className="text-xl font-semibold mb-6">Personal Information</h3>
                  
                  {/* Contact Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-1.5 rounded-md">
                          <MailIcon className="h-4 w-4 text-blue-500" />
                        </div>
                        Email Address
                      </label>
                      <div className="relative">
                        <Input 
                          id="email"
                          type="email" 
                          value={email} 
                          onChange={(e) => handleFieldChange('email', e.target.value)}
                          className={cn(
                            "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-gray-300 focus-visible:border-blue-500 shadow-sm transition-colors",
                            !validation.email && "border-red-500 bg-red-50"
                          )}
                        />
                        {!validation.email && (
                          <MotionDiv 
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-xs text-red-500 mt-1"
                          >
                            Valid email required
                          </MotionDiv>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="phone" className="text-sm font-medium flex items-center gap-2">
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 p-1.5 rounded-md">
                          <SmartphoneIcon className="h-4 w-4 text-emerald-500" />
                        </div>
                        Phone Number
                      </label>
                      <div className="relative">
                        <Input 
                          id="phone"
                          type="tel" 
                          value={phone} 
                          onChange={(e) => handleFieldChange('phone', e.target.value)}
                          className={cn(
                            "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-gray-300 focus-visible:border-blue-500 shadow-sm transition-colors",
                            !validation.phone && "border-red-500 bg-red-50"
                          )}
                        />
                        {!validation.phone && (
                          <MotionDiv 
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-xs text-red-500 mt-1"
                          >
                            Valid phone number required
                          </MotionDiv>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Biography */}
                  <div className="mb-8">
                    <label htmlFor="bio" className="text-sm font-medium flex items-center gap-2 mb-2">
                      <div className="bg-violet-50 dark:bg-violet-900/20 p-1.5 rounded-md">
                        <BookOpen className="h-4 w-4 text-violet-500" />
                      </div>
                      Biography
                    </label>
                    <Textarea
                      id="bio"
                      value={bio}
                      onChange={(e) => handleFieldChange('bio', e.target.value)}
                      rows={4}
                      className="resize-none bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-gray-300 focus-visible:border-blue-500 shadow-sm transition-colors"
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex justify-end gap-3 mt-10">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleClose}
                      disabled={saving}
                      className="border-gray-300 hover:border-gray-400 transition-colors"
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
              </div>
            </TabsContent>
          </form>
        </div>
      </Tabs>
    </div>
  );
}
