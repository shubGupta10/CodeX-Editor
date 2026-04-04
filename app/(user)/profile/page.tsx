"use client";

import React, { useEffect, useState } from "react";
import { User } from "@/types/User";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Calendar, 
  Mail, 
  User as UserIcon, 
  Clock, 
  Edit3, 
  Shield, 
  Globe,
  Zap,
  FileText,
  TrendingUp
} from "lucide-react";
import { EditProfileDialog } from "./EditProfile";
import { motion } from "framer-motion";
import { getPlanLimits } from "@/lib/plans";

/**
 * Visual Progress Bar Component for Usage Tracking
 */
const UsageBar = ({ label, used, total, icon: Icon }: { label: string, used: number, total: number, icon: any }) => {
  const percentage = Math.min(Math.round((used / total) * 100), 100);
  const isHigh = percentage >= 80;
  const isMedium = percentage >= 50 && percentage < 80;

  return (
    <div className="space-y-3 bg-[#252525] p-5 rounded-xl border border-gray-800/50 hover:border-emerald-500/20 transition-all group">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-500/5 text-emerald-400 group-hover:bg-emerald-500/10 transition-colors">
            <Icon className="h-4 w-4" />
          </div>
          <span className="text-sm font-bold text-gray-300">{label}</span>
        </div>
        <span className="text-xs font-mono text-gray-500">
          {used} / {total}
        </span>
      </div>
      
      <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`h-full rounded-full ${
            isHigh ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" : 
            isMedium ? "bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]" : 
            "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
          }`}
        />
      </div>
      
      <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-bold">
        <span className={isHigh ? "text-red-400" : isMedium ? "text-yellow-400" : "text-emerald-500"}>
          {percentage}% Credits Used
        </span>
        {isHigh && <span className="text-red-400 animate-pulse">Upgrade Soon</span>}
      </div>
    </div>
  );
};

function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  
  useEffect(() => {
    const handleFetchUser = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/user/profile");
        const data = await response.json();
        
        if (data?.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Profile fetch failed:", error);
      } finally {
        setLoading(false);
      }
    };
    
    handleFetchUser();
  }, []);

  const handleUserUpdate = (updatedUser: User) => {
    setUser(updatedUser);
    setIsEditOpen(false);
  };

  function getInitials(firstName?: string, lastName?: string) {
    if (!firstName && !lastName) return "U";
    return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`;
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen flex-1 bg-[#1e1e1e] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-3">User <span className="text-emerald-400">Profile</span></h1>
              <p className="text-gray-400 text-[15px]">Manage your personal information and track your usage.</p>
            </div>
            <Button 
              onClick={() => setIsEditOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white w-full sm:w-auto mt-6 sm:mt-0 flex items-center gap-2 rounded-lg h-11 px-6 transition-all font-bold shadow-lg shadow-emerald-600/10"
              disabled={!user || loading}
            >
              <Edit3 className="h-4 w-4" />
              Edit Profile
            </Button>
          </div>
          
          <div className="w-full">
            {loading ? (
              <ProfileSkeleton />
            ) : user ? (
              <div className="space-y-12">
                {/* Identity Header */}
                <div className="flex flex-col sm:flex-row gap-8 items-center sm:items-start pb-10 border-b border-gray-800/60">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1, duration: 0.3 }}
                  >
                    <Avatar className="w-28 h-28 sm:w-32 sm:h-32 border-2 border-emerald-500/20 shadow-2xl rounded-full">
                      <AvatarImage src={user.profileImage} alt={user.username} />
                      <AvatarFallback className="bg-[#252525] text-emerald-400 text-3xl font-bold">
                        {getInitials(user.firstName, user.lastName)}
                      </AvatarFallback>
                    </Avatar>
                  </motion.div>
                  
                  <div className="flex-1 space-y-4 text-center sm:text-left mt-2 sm:mt-4">
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2, duration: 0.4 }}
                    >
                      <h3 className="text-white text-3xl font-extrabold tracking-tight">
                        {user.firstName} {user.lastName}
                      </h3>
                      <div className="flex flex-wrap gap-3 mt-3 justify-center sm:justify-start items-center">
                        <Badge className="bg-[#252525] text-emerald-400 hover:bg-[#252525] border-gray-800 text-xs px-3 py-1 font-mono rounded-md">
                          @{user.username}
                        </Badge>
                        <Badge className="bg-emerald-600/10 text-emerald-400 border-emerald-600/20 text-[10px] px-3 py-1 font-black uppercase tracking-[0.2em] rounded">
                          {user.plan || "free"} tier
                        </Badge>
                      </div>
                    </motion.div>
                  </div>
                </div>
                
                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                  {/* Account Details */}
                  <div className="lg:col-span-1 space-y-8">
                    <h4 className="text-[11px] font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
                       Account Information
                    </h4>
                    
                    <div className="space-y-6">
                      <div className="flex flex-col gap-1.5 p-4 bg-[#252525]/30 rounded-xl border border-gray-800/40">
                        <span className="text-gray-500 text-[11px] font-black uppercase tracking-wider">Email</span>
                        <div className="flex items-center gap-2 text-gray-200 text-sm">
                          <Mail className="h-3.5 w-3.5 text-emerald-500/50" />
                          {user.email}
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-1.5 p-4 bg-[#252525]/30 rounded-xl border border-gray-800/40">
                        <span className="text-gray-500 text-[11px] font-black uppercase tracking-wider">Member Since</span>
                        <div className="flex items-center gap-2 text-gray-200 text-sm">
                          <Calendar className="h-3.5 w-3.5 text-emerald-500/50" />
                          {formatDate(user.createdAt)}
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-1.5 p-4 bg-[#252525]/30 rounded-xl border border-gray-800/40">
                        <span className="text-gray-500 text-[11px] font-black uppercase tracking-wider">Last Activity</span>
                        <div className="flex items-center gap-2 text-gray-200 text-sm">
                          <Clock className="h-3.5 w-3.5 text-emerald-500/50" />
                          {formatDate(user.lastLogin)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Usage Tracking */}
                  <div className="lg:col-span-2 space-y-8">
                    <h4 className="text-[11px] font-black text-emerald-400 uppercase tracking-[0.2em] flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" /> Usage & Credits
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <UsageBar 
                        label="AI Assistant" 
                        used={user.limits?.aiRequestCount || 0} 
                        total={getPlanLimits(user.plan || "free").aiMaxRequests}
                        icon={Zap}
                      />
                      <UsageBar 
                        label="Code Conversions" 
                        used={user.limits?.conversionCount || 0} 
                        total={getPlanLimits(user.plan || "free").conversionLimit}
                        icon={Globe}
                      />
                      <UsageBar 
                        label="Cloud Workspaces" 
                        used={user.limits?.fileCount || 0} 
                        total={getPlanLimits(user.plan || "free").maxFiles}
                        icon={FileText}
                      />
                      <div className="bg-emerald-600/5 border border-emerald-500/10 rounded-xl p-6 flex flex-col justify-center items-center text-center group hover:bg-emerald-600/10 transition-all cursor-pointer" onClick={() => window.location.href = "/pricing"}>
                        <Zap className="h-8 w-8 text-emerald-400 mb-3 group-hover:scale-110 transition-transform" />
                        <h5 className="text-white font-bold text-sm">Need more?</h5>
                        <p className="text-gray-400 text-xs mt-1">Upgrade to Pro for 50x higher limits.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-32"
              >
                <div className="bg-[#252525] p-8 rounded-full mb-8">
                  <UserIcon className="h-16 w-16 text-gray-700" />
                </div>
                <h3 className="text-3xl font-bold">Authentication Required</h3>
                <p className="text-gray-500 mt-4 text-center max-w-sm">
                  Sign in to access your profile, sync your projects, and track your daily coding credits.
                </p>
                <Button 
                  className="mt-10 bg-emerald-600 hover:bg-emerald-500 text-white h-12 px-10 rounded-xl font-bold shadow-xl shadow-emerald-600/20"
                  onClick={() => window.location.href = "/auth/login"}
                >
                  Sign In to CodeX
                </Button>
              </motion.div>
            )}
          </div>
        </motion.div>
        
        {user && (
          <EditProfileDialog 
            user={user}
            isOpen={isEditOpen}
            onClose={() => setIsEditOpen(false)}
            onUserUpdate={handleUserUpdate}
          />
        )}
      </div>
    </div>
  );
}

const ProfileSkeleton = () => (
  <div className="space-y-12 animate-pulse">
    <div className="flex flex-col sm:flex-row gap-8 items-center sm:items-start pb-10 border-b border-gray-800/60">
      <Skeleton className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-white/5" />
      <div className="flex-1 space-y-4 w-full">
        <Skeleton className="h-10 w-64 bg-white/5 rounded-lg" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-24 bg-white/5" />
          <Skeleton className="h-6 w-20 bg-white/5" />
        </div>
      </div>
    </div>
    
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
      <div className="lg:col-span-1 space-y-6">
        <Skeleton className="h-4 w-32 bg-white/5" />
        <Skeleton className="h-16 w-full bg-white/5 rounded-xl" />
        <Skeleton className="h-16 w-full bg-white/5 rounded-xl" />
      </div>
      <div className="lg:col-span-2 space-y-6">
        <Skeleton className="h-4 w-32 bg-white/5" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-32 w-full bg-white/5 rounded-xl" />
          <Skeleton className="h-32 w-full bg-white/5 rounded-xl" />
        </div>
      </div>
    </div>
  </div>
);

export default ProfilePage;