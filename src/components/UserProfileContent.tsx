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
  Activity,
  Settings,
  LogOut,
  DownloadIcon
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

import { cva } from "class-variance-authority";
// Remove headlessui import and use our own transition implementation
import { useEffect as useLayoutEffect } from 'react';

// Simple fade transition component
const FadeTransition = ({ 
  show, 
  children 
}: { 
  show: boolean; 
  children: React.ReactNode;
}) => {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    if (show) {
      setMounted(true);
    } else {
      const timer = setTimeout(() => setMounted(false), 300);
      return () => clearTimeout(timer);
    }
  }, [show]);
  
  if (!mounted) return null;
  
  return (
    <div
      className={cn(
        "transition-all duration-300",
        show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      )}
    >
      {children}
    </div>
  );
};

// Define variants for cards using cva
const cardVariants = cva(
  "p-5 rounded-xl border transition-all duration-200 relative",
  {
    variants: {
      intent: {
        default: "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700",
        primary: "bg-blue-50/50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/40",
        success: "bg-green-50/50 dark:bg-green-900/20 border-green-200 dark:border-green-800/40",
        warning: "bg-amber-50/50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/40",
        danger: "bg-red-50/50 dark:bg-red-900/20 border-red-200 dark:border-red-800/40",
        info: "bg-violet-50/50 dark:bg-violet-900/20 border-violet-200 dark:border-violet-800/40",
      },
      hover: {
        true: "hover:shadow-md hover:border-opacity-70",
        false: "",
      }
    },
    defaultVariants: {
      intent: "default",
      hover: true,
    }
  }
);

// Define icon containers with consistent styling
const IconContainer = ({ icon: Icon, color }: { icon: LucideIcon, color: string }) => (
  <div className={`bg-${color}-50 dark:bg-${color}-900/20 p-2 rounded-md flex items-center justify-center`}>
    <Icon className={`h-4 w-4 text-${color}-500`} />
  </div>
);

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

  // Change password handler with more detail
  const handleChangePassword = () => {
    toast.info("Password change modal would open here", {
      description: "For security reasons, you would need to verify your current password"
    });
  };

  // Handle MFA method change
  const handleTwoFactorMethodChange = async (method: 'app' | 'sms' | 'none') => {
    if (method === 'none') {
      setMfaEnabled(false);
    } else {
      setMfaEnabled(true);
    }
    
    setTwoFactorMethod(method);
    
    try {
      if (onUpdateSecurity) {
        await onUpdateSecurity({ 
          mfaEnabled: method !== 'none', 
          mfaMethod: method 
        });
        toast.success(`Two-factor authentication ${method === 'none' ? 'disabled' : 'updated'}`);
      }
    } catch (error) {
      console.error('MFA update error:', error);
      toast.error("Failed to update security settings");
    }
  };

  // Handle device logout
  const handleDeviceLogout = (deviceId: string) => {
    toast.info(`Logging out from: ${deviceId}`, {
      description: "This would end the session on the specified device"
    });
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

  // Additional state for preferences
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('english');
  const [desktopNotifications, setDesktopNotifications] = useState(true);
  const [mentionNotifications, setMentionNotifications] = useState(true);
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [autoUpdateApp, setAutoUpdateApp] = useState(true);
  const [securityAlerts, setSecurityAlerts] = useState(true);
  
  // Additional state for security
  const [passwordLastChanged, setPasswordLastChanged] = useState('3 months ago');
  const [twoFactorMethod, setTwoFactorMethod] = useState<'app' | 'sms' | 'none'>('none');

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

  // New effect to set background gradient color on tab change
  useLayoutEffect(() => {
    // Change background gradient based on active tab
    const gradientClasses = {
      profile: ['from-blue-50', 'to-indigo-50'],
      preferences: ['from-emerald-50', 'to-teal-50'],
      security: ['from-amber-50', 'to-orange-50']
    };
    
    const sidebarElement = document.getElementById('profile-sidebar');
    if (sidebarElement) {
      // Remove all gradient classes first
      Object.values(gradientClasses).flat().forEach(cls => {
        sidebarElement.classList.remove(cls);
      });
      
      // Add the bg-gradient class if not present
      if (!sidebarElement.classList.contains('bg-gradient-to-b')) {
        sidebarElement.classList.add('bg-gradient-to-b');
      }
      
      // Add the specific gradient for this tab
      const activeClasses = gradientClasses[activeTab as keyof typeof gradientClasses] || gradientClasses.profile;
      activeClasses.forEach(cls => {
        sidebarElement.classList.add(cls);
      });
    }
  }, [activeTab]);

  return (
    <div className="max-h-[90vh] overflow-hidden border border-gray-100 dark:border-gray-800 rounded-xl shadow-xl bg-white dark:bg-gray-900">
      <Tabs 
        defaultValue="profile" 
        value={activeTab} 
        onValueChange={setActiveTab} 
        className="w-full"
      >
        {/* Header with tabs and unsaved changes indicator */}
        <div className="border-b border-gray-100 dark:border-gray-800 px-6 py-3 sticky top-0 z-10 backdrop-blur-sm bg-white/90 dark:bg-gray-900/90">
          <div className="flex justify-between items-center">
            <TabsList className="grid w-auto grid-cols-3 bg-muted/50 rounded-full p-1 border border-gray-100 dark:border-gray-800">
              <TabsTrigger 
                value="profile" 
                className="data-[state=active]:bg-white data-[state=active]:text-blue-600 dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-blue-400 rounded-full px-6"
              >
                <Users className="h-4 w-4 mr-2 inline" />
                Profile
              </TabsTrigger>
              <TabsTrigger 
                value="preferences" 
                className="data-[state=active]:bg-white data-[state=active]:text-emerald-600 dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-emerald-400 rounded-full px-6"
              >
                <Settings className="h-4 w-4 mr-2 inline" />
                Preferences
              </TabsTrigger>
              <TabsTrigger 
                value="security" 
                className="data-[state=active]:bg-white data-[state=active]:text-amber-600 dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-amber-400 rounded-full px-6"
              >
                <ShieldCheck className="h-4 w-4 mr-2 inline" />
                Security
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-3">
              {/* Replace Transition with our own FadeTransition */}
              {hasUnsavedChanges && (
                <FadeTransition show={hasUnsavedChanges}>
                  <div className="text-xs text-amber-600 flex items-center bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200">
                    <AlertCircle className="h-3 w-3 mr-1" /> Unsaved changes
                  </div>
                </FadeTransition>
              )}
              
              <Button 
                onClick={handleClose} 
                size="icon" 
                variant="ghost" 
                className="rounded-full h-8 w-8"
              >
                <XIcon className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Content area with scroll */}
        <div className="max-h-[80vh] overflow-auto">
          <form ref={formRef} onSubmit={handleSubmit} className="p-0 m-0">
            {/* Profile Tab */}
            <TabsContent value="profile" className="m-0 p-0">
              <div className="flex flex-col md:flex-row">
                {/* LEFT SECTION */}
                <div id="profile-sidebar" className="md:w-1/3 bg-gradient-to-b from-blue-50 to-indigo-50 dark:bg-gray-900 p-8 border-r border-gray-100 dark:border-gray-800">
                  {/* Profile Image with improved animation */}
                  <div 
                    className={cn(
                      "relative group w-full rounded-xl transition-all duration-300 mb-8",
                      isDraggingOver ? "bg-blue-50 border-2 border-dashed border-blue-300 p-6 scale-105 shadow-lg" : "p-4"
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
                          "hover:shadow-blue-300/50 hover:scale-105 hover:rotate-2 transition-all",
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
                        
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-200 rounded-full backdrop-blur-sm">
                          <CameraIcon className="h-8 w-8 text-white" />
                          <span className="text-xs font-medium text-white mt-1">Update photo</span>
                        </div>
                      </Avatar>
                      
                      {previewImage && (
                        <MotionButton
                          initial={{ scale: 0, rotate: -10 }}
                          animate={{ scale: 1, rotate: 0 }}
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
                  
                  {/* User Name - Enhance with better focus animation */}
                  <div className="text-center mb-8">
                    <div className="relative inline-block max-w-full group">
                      <Input 
                        value={name}
                        onChange={(e) => handleFieldChange('name', e.target.value)}
                        className={cn(
                          "text-2xl font-bold text-center border-none bg-transparent focus-visible:ring-blue-500/40 focus-visible:ring-2 focus-visible:ring-offset-0 rounded-lg px-4 py-2",
                          "transition-all duration-300 group-hover:bg-white/50 dark:group-hover:bg-gray-800/50",
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
                    
                    {/* Status Badge with enhanced animation */}
                    <div className="mt-3 flex justify-center">
                      {!showCustomStatus ? (
                        <Badge 
                          variant={status === 'Active' ? 'success' : status === 'Busy' ? 'warning' : 'default'} 
                          className="cursor-pointer transition-all duration-300 hover:shadow-md px-4 py-1.5 text-sm rounded-full hover:scale-105"
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
                  <Separator className="my-6 bg-gray-200/70 dark:bg-gray-700/70" />
                  
                  <div className="space-y-5">
                    <div className="flex items-center gap-3 group">
                      <div className="bg-blue-50 dark:bg-blue-900/30 p-2 rounded-md transition-all group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50">
                        <Sparkles className="h-4 w-4 text-blue-500" />
                      </div>
                      <Input
                        value={jobTitle}
                        onChange={(e) => handleFieldChange('jobTitle', e.target.value)}
                        className="border-none text-sm p-0 h-auto focus-visible:ring-0 bg-transparent group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
                        placeholder="Add job title"
                      />
                    </div>
                    
                    <div className="flex items-center gap-3 group">
                      <div className="bg-violet-50 dark:bg-violet-900/30 p-2 rounded-md transition-all group-hover:bg-violet-100 dark:group-hover:bg-violet-900/50">
                        <Building className="h-4 w-4 text-violet-500" />
                      </div>
                      <Input
                        value={department}
                        onChange={(e) => handleFieldChange('department', e.target.value)}
                        className="border-none text-sm p-0 h-auto focus-visible:ring-0 bg-transparent group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors"
                        placeholder="Add department"
                      />
                    </div>
                    
                    <div className="flex items-center gap-3 group">
                      <div className="bg-emerald-50 dark:bg-emerald-900/30 p-2 rounded-md transition-all group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/50">
                        <Globe className="h-4 w-4 text-emerald-500" />
                      </div>
                      <Input
                        value={location}
                        onChange={(e) => handleFieldChange('location', e.target.value)}
                        className="border-none text-sm p-0 h-auto focus-visible:ring-0 bg-transparent group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors"
                        placeholder="Add location"
                      />
                    </div>
                    
                    <div className="flex items-center gap-3 group">
                      <div className="bg-amber-50 dark:bg-amber-900/30 p-2 rounded-md transition-all group-hover:bg-amber-100 dark:group-hover:bg-amber-900/50">
                        <CalendarIcon className="h-4 w-4 text-amber-500" />
                      </div>
                      <p className="text-sm text-muted-foreground group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">Member since {joinDate}</p>
                    </div>
                  </div>
                  
                  <div className="mt-auto pt-6">
                    {saved && (
                      <MotionDiv 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-sm text-green-600 flex items-center justify-center mb-4 px-3 py-2 bg-green-50 rounded-lg shadow-sm border border-green-100"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" /> Changes saved successfully
                      </MotionDiv>
                    )}
                  </div>
                </div>
                
                {/* RIGHT SECTION */}
                <div className="md:w-2/3 p-8 bg-white dark:bg-gray-950">
                  <h3 className="text-xl font-semibold mb-6 flex items-center">
                    <Sparkles className="h-5 w-5 mr-2 text-blue-500" /> 
                    Personal Information
                  </h3>
                  
                  {/* Contact Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="space-y-2 group focus-within:ring-2 focus-within:ring-blue-200 focus-within:rounded-lg focus-within:p-2 focus-within:-m-2 transition-all duration-200">
                      <label htmlFor="email" className="text-sm font-medium flex items-center gap-2 group-hover:text-blue-600 transition-colors">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-1.5 rounded-md group-hover:bg-blue-100 dark:group-hover:bg-blue-800/30 transition-colors">
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
                            "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-blue-300 focus-visible:border-blue-500 shadow-sm transition-all duration-200",
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
                    
                    <div className="space-y-2 group focus-within:ring-2 focus-within:ring-emerald-200 focus-within:rounded-lg focus-within:p-2 focus-within:-m-2 transition-all duration-200">
                      <label htmlFor="phone" className="text-sm font-medium flex items-center gap-2 group-hover:text-emerald-600 transition-colors">
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 p-1.5 rounded-md group-hover:bg-emerald-100 dark:group-hover:bg-emerald-800/30 transition-colors">
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
                            "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-emerald-300 focus-visible:border-emerald-500 shadow-sm transition-all duration-200",
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
                  
                  {/* Biography - Enhanced with focus styles */}
                  <div className="mb-8 group focus-within:ring-2 focus-within:ring-violet-200 focus-within:rounded-lg focus-within:p-2 focus-within:-m-2 transition-all duration-200">
                    <label htmlFor="bio" className="text-sm font-medium flex items-center gap-2 mb-2 group-hover:text-violet-600 transition-colors">
                      <div className="bg-violet-50 dark:bg-violet-900/20 p-1.5 rounded-md group-hover:bg-violet-100 dark:group-hover:bg-violet-800/30 transition-colors">
                        <BookOpen className="h-4 w-4 text-violet-500" />
                      </div>
                      Biography
                    </label>
                    <Textarea
                      id="bio"
                      value={bio}
                      onChange={(e) => handleFieldChange('bio', e.target.value)}
                      rows={4}
                      className="resize-none bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-violet-300 focus-visible:border-violet-500 shadow-sm transition-all duration-200"
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
                      className={cn(
                        "min-w-[100px]", 
                        hasUnsavedChanges ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-gray-300 text-gray-600 cursor-not-allowed"
                      )}
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
            
            {/* Preferences Tab */}
            <TabsContent value="preferences" className="m-0 p-0">
              <div className="p-8 bg-white dark:bg-gray-950">
                <div className="max-w-3xl mx-auto">
                  <h3 className="text-xl font-semibold mb-6 flex items-center">
                    <Settings className="h-5 w-5 mr-2 text-emerald-500" /> 
                    Preferences
                  </h3>
                  
                  {/* Appearance */}
                  <div className="mb-8">
                    <h4 className="text-base font-medium mb-3 flex items-center">
                      <div className="bg-indigo-50 dark:bg-indigo-900/20 p-1.5 rounded-md mr-2">
                        <Activity className="h-4 w-4 text-indigo-500" />
                      </div>
                      Appearance
                    </h4>
                    <div className={cardVariants({intent: "info"})}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Dark Mode</p>
                          <p className="text-sm text-muted-foreground">Use dark theme throughout the application</p>
                        </div>
                        <Switch 
                          checked={darkMode} 
                          onCheckedChange={setDarkMode}
                          className={darkMode ? "bg-indigo-600" : undefined}
                        />
                      </div>
                      
                      <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                        <p className="font-medium mb-2">Language</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {['english', 'spanish', 'french', 'german', 'japanese', 'chinese'].map((lang) => (
                            <Button 
                              key={lang}
                              type="button"
                              variant={language === lang ? "default" : "outline"}
                              size="sm"
                              onClick={() => setLanguage(lang)}
                              className={cn(
                                "capitalize transition-all",
                                language === lang ? "bg-indigo-600 hover:bg-indigo-700" : 
                                "hover:border-indigo-300 hover:text-indigo-700"
                              )}
                            >
                              {lang}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Notifications */}
                  <div className="mb-8">
                    <h4 className="text-base font-medium mb-3 flex items-center">
                      <div className="bg-rose-50 dark:bg-rose-900/20 p-1.5 rounded-md mr-2">
                        <BellOff className="h-4 w-4 text-rose-500" />
                      </div>
                      Notifications
                    </h4>
                    <div className={cardVariants({intent: "danger"})}>
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Email Notifications</p>
                            <p className="text-sm text-muted-foreground">Receive updates and alerts via email</p>
                          </div>
                          <Switch 
                            checked={emailNotifications} 
                            onCheckedChange={setEmailNotifications}
                            className={emailNotifications ? "bg-rose-600" : undefined}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Desktop Notifications</p>
                            <p className="text-sm text-muted-foreground">Show notifications on your desktop</p>
                          </div>
                          <Switch 
                            checked={desktopNotifications} 
                            onCheckedChange={setDesktopNotifications}
                            className={desktopNotifications ? "bg-rose-600" : undefined}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Mentions</p>
                            <p className="text-sm text-muted-foreground">Get notified when someone mentions you</p>
                          </div>
                          <Switch 
                            checked={mentionNotifications} 
                            onCheckedChange={setMentionNotifications}
                            className={mentionNotifications ? "bg-rose-600" : undefined}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Sound Alerts</p>
                            <p className="text-sm text-muted-foreground">Play sounds for important notifications</p>
                          </div>
                          <Switch 
                            checked={soundAlerts} 
                            onCheckedChange={setSoundAlerts}
                            className={soundAlerts ? "bg-rose-600" : undefined}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* System */}
                  <div className="mb-8">
                    <h4 className="text-base font-medium mb-3 flex items-center">
                      <div className="bg-emerald-50 dark:bg-emerald-900/20 p-1.5 rounded-md mr-2">
                        <Settings className="h-4 w-4 text-emerald-500" />
                      </div>
                      System
                    </h4>
                    <div className={cardVariants({intent: "success"})}>
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Auto Update</p>
                            <p className="text-sm text-muted-foreground">Keep the application up to date automatically</p>
                          </div>
                          <Switch 
                            checked={autoUpdateApp} 
                            onCheckedChange={setAutoUpdateApp}
                            className={autoUpdateApp ? "bg-emerald-600" : undefined}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Security Alerts</p>
                            <p className="text-sm text-muted-foreground">Get notified about security concerns</p>
                          </div>
                          <Switch 
                            checked={securityAlerts} 
                            onCheckedChange={setSecurityAlerts}
                            className={securityAlerts ? "bg-emerald-600" : undefined}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Actions */}
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
                      className="min-w-[100px] bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      Save Preferences
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            {/* Security Tab */}
            <TabsContent value="security" className="m-0 p-0">
              <div className="p-8 bg-white dark:bg-gray-950">
                <div className="max-w-3xl mx-auto">
                  <h3 className="text-xl font-semibold mb-6 flex items-center">
                    <ShieldCheck className="h-5 w-5 mr-2 text-amber-500" />
                    Security
                  </h3>
                  
                  {/* Password Section */}
                  <div className="mb-8">
                    <h4 className="text-base font-medium mb-3 flex items-center">
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-1.5 rounded-md mr-2">
                        <LockIcon className="h-4 w-4 text-blue-500" />
                      </div>
                      Password Management
                    </h4>
                    <div className={cardVariants({intent: "primary"})}>
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                          <p className="font-medium">Password</p>
                          <p className="text-sm text-muted-foreground">Last updated {passwordLastChanged}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleChangePassword}
                            className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300"
                          >
                            <KeyIcon className="h-4 w-4 mr-2" />
                            Change Password
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Two Factor Authentication */}
                  <div className="mb-8">
                    <h4 className="text-base font-medium mb-3 flex items-center">
                      <div className="bg-violet-50 dark:bg-violet-900/20 p-1.5 rounded-md mr-2">
                        <ShieldCheck className="h-4 w-4 text-violet-500" />
                      </div>
                      Two-Factor Authentication
                    </h4>
                    <div className={cardVariants({intent: "info"})}>
                      <p className="text-sm text-muted-foreground mb-4">
                        Add an extra layer of security to your account by requiring more than just a password to sign in.
                      </p>
                      
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            id="twoFactor-none"
                            name="twoFactorMethod"
                            checked={twoFactorMethod === 'none'}
                            onChange={() => handleTwoFactorMethodChange('none')}
                            className="h-4 w-4 text-violet-600"
                          />
                          <div>
                            <label htmlFor="twoFactor-none" className="font-medium">Don't use two-factor authentication</label>
                            <p className="text-sm text-muted-foreground">Not recommended</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            id="twoFactor-app"
                            name="twoFactorMethod"
                            checked={twoFactorMethod === 'app'}
                            onChange={() => handleTwoFactorMethodChange('app')}
                            className="h-4 w-4 text-violet-600"
                          />
                          <div>
                            <label htmlFor="twoFactor-app" className="font-medium">Use an authenticator app</label>
                            <p className="text-sm text-muted-foreground">Google Authenticator, Microsoft Authenticator, etc.</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            id="twoFactor-sms"
                            name="twoFactorMethod"
                            checked={twoFactorMethod === 'sms'}
                            onChange={() => handleTwoFactorMethodChange('sms')}
                            className="h-4 w-4 text-violet-600"
                          />
                          <div>
                            <label htmlFor="twoFactor-sms" className="font-medium">Use SMS verification</label>
                            <p className="text-sm text-muted-foreground">Receive a code on your phone via SMS</p>
                          </div>
                        </div>
                      </div>
                      
                      {twoFactorMethod !== 'none' && (
                        <Button
                          type="button"
                          variant="outline"
                          className="mt-4 text-violet-600 border-violet-200 hover:bg-violet-50 hover:border-violet-300"
                        >
                          <ShieldCheck className="h-4 w-4 mr-2" />
                          Set up {twoFactorMethod === 'app' ? 'Authenticator App' : 'SMS Verification'}
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {/* Active Sessions */}
                  <div className="mb-8">
                    <h4 className="text-base font-medium mb-3 flex items-center">
                      <div className="bg-amber-50 dark:bg-amber-900/20 p-1.5 rounded-md mr-2">
                        <Activity className="h-4 w-4 text-amber-500" />
                      </div>
                      Active Sessions
                    </h4>
                    <div className={cardVariants({intent: "warning"})}>
                      <p className="text-sm text-muted-foreground mb-4">
                        These are the devices currently signed in to your account.
                      </p>
                      
                      <div className="space-y-3">
                        {activeSessions.map((session, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-md border border-gray-100 dark:border-gray-700">
                            <div>
                              <p className="font-medium">{session.device}</p>
                              <p className="text-xs text-muted-foreground">{session.lastActive}</p>
                            </div>
                            {session.isCurrent ? (
                              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                                Current Device
                              </Badge>
                            ) : (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeviceLogout(session.device)}
                                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                              >
                                Sign out
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                      
                      <Button
                        type="button"
                        variant="outline"
                        className="mt-4 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign out from all devices
                      </Button>
                    </div>
                  </div>
                  
                  {/* Data & Privacy */}
                  <div className="mb-8">
                    <h4 className="text-base font-medium mb-3 flex items-center">
                      <div className="bg-red-50 dark:bg-red-900/20 p-1.5 rounded-md mr-2">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      </div>
                      Account Danger Zone
                    </h4>
                    <div className={cardVariants({intent: "danger"})}>
                      <p className="text-sm text-muted-foreground mb-4">
                        The following actions are irreversible. Please proceed with caution.
                      </p>
                      
                      <div className="flex gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          className="text-orange-600 border-orange-200 hover:bg-orange-50 hover:border-orange-300"
                        >
                          <DownloadIcon className="h-4 w-4 mr-2" />
                          Export My Data
                        </Button>
                        
                        <Button
                          type="button"
                          variant="outline"
                          className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Account
                        </Button>
                      </div>
                    </div>
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
