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
  FileText
} from "lucide-react";
import { EditProfileDialog } from "./EditProfile";
import { motion } from "framer-motion";

function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  
  useEffect(() => {
    const handleFetchUser = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/user/profile", {
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          }
        });
        const data = await response.json();
        
        if (data?.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Something went wrong", error);
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
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    
    return date.toLocaleDateString(undefined, options);
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
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-3">User Profile</h1>
              <p className="text-gray-400 text-[15px]">Manage your personal information and preferences.</p>
            </div>
            <Button 
              onClick={() => setIsEditOpen(true)}
              className="bg-white/10 hover:bg-white/20 border border-white/5 text-white w-full sm:w-auto mt-6 sm:mt-0 flex items-center gap-2 rounded-lg h-11 px-6 transition-all font-medium"
              disabled={!user || loading}
            >
              <Edit3 className="h-4 w-4" />
              Edit Profile
            </Button>
          </div>
          
          <div className="w-full">
            <div className="pt-0">
              {loading ? (
                <ProfileSkeleton />
              ) : user ? (
                <div className="space-y-8">
                  <div className="flex flex-col sm:flex-row gap-8 items-center sm:items-start pb-10 border-b border-gray-800/60 mb-10">
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.1, duration: 0.3 }}
                    >
                      <Avatar className="w-28 h-28 sm:w-32 sm:h-32 border border-gray-700 shadow-xl rounded-full">
                        <AvatarImage src={user.profileImage} alt={user.username} />
                        <AvatarFallback className="bg-[#252525] text-gray-300 text-2xl font-light">
                          {getInitials(user.firstName, user.lastName)}
                        </AvatarFallback>
                      </Avatar>
                    </motion.div>
                    
                    <div className="flex-1 space-y-3 text-center sm:text-left mt-2 sm:mt-4">
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.4 }}
                      >
                        <h3 className="text-white text-3xl font-semibold tracking-tight">
                          {user.firstName} {user.lastName}
                        </h3>
                        <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
                          <Badge className="bg-[#252525] text-emerald-400 hover:bg-[#252525] border-transparent text-sm px-3 py-1 font-mono rounded-md">
                            @{user.username}
                          </Badge>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                  
                  <div className="w-full">
                    <h4 className="text-[13px] font-semibold text-gray-500 uppercase tracking-wider mb-6">
                      Account Information
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 text-white">
                      <div className="flex flex-col gap-1.5 border-b border-gray-800/40 pb-4">
                        <span className="text-gray-500 text-[13px] font-medium">Email Address</span>
                        <span className="text-gray-200 text-[15px]">{user.email}</span>
                      </div>
                      
                      <div className="flex flex-col gap-1.5 border-b border-gray-800/40 pb-4">
                        <span className="text-gray-500 text-[13px] font-medium">Member Since</span>
                        <span className="text-gray-200 text-[15px]">{formatDate(user.createdAt)}</span>
                      </div>
                      
                      <div className="flex flex-col gap-1.5 border-b border-gray-800/40 pb-4">
                        <span className="text-gray-500 text-[13px] font-medium">Last Login</span>
                        <span className="text-gray-200 text-[15px]">{formatDate(user.lastLogin)}</span>
                      </div>
                      
                      <div className="flex flex-col gap-1.5 border-b border-gray-800/40 pb-4">
                        <span className="text-gray-500 text-[13px] font-medium">Profile Updated</span>
                        <span className="text-gray-200 text-[15px]">{formatDate(user.updatedAt)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="w-full pt-4">
                    <h4 className="text-[13px] font-semibold text-emerald-500 uppercase tracking-wider mb-6 flex items-center gap-2">
                      <Zap className="h-4 w-4" /> Your Coding Stats
                    </h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <Card className="bg-[#252525] border-gray-800 shadow-xl">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-gray-400 flex items-center justify-between">
                            AI Requests <Zap className="h-4 w-4 text-emerald-400" />
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold text-white">{(user as any).limits?.aiRequestCount || 0}</div>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-[#252525] border-gray-800 shadow-xl">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-gray-400 flex items-center justify-between">
                            Conversions <Globe className="h-4 w-4 text-emerald-400" />
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold text-white">{(user as any).limits?.conversionCount || 0}</div>
                        </CardContent>
                      </Card>

                      <Card className="bg-[#252525] border-gray-800 shadow-xl">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-gray-400 flex items-center justify-between">
                            Files Created <FileText className="h-4 w-4 text-emerald-400" />
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold text-white">{(user as any).limits?.fileCount || 0}</div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="flex flex-col items-center justify-center py-20 text-white"
                >
                  <div className="bg-[#252525] p-6 rounded-full mb-6 relative">
                    <UserIcon className="h-12 w-12 text-gray-500" />
                  </div>
                  <h3 className="text-2xl font-semibold tracking-tight">No User Found</h3>
                  <p className="text-gray-500 mt-3 text-center max-w-md text-[15px]">
                    Please sign in to view your profile information and manage your CodeX workspace.
                  </p>
                  <Button 
                    className="mt-8 bg-emerald-600 hover:bg-emerald-500 text-white h-11 px-8 rounded-lg font-medium transition-colors"
                    onClick={() => window.location.href = "/auth/login"}
                  >
                    Sign In to Continue
                  </Button>
                </motion.div>
              )}
            </div>
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
  <div className="space-y-8">
    <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
      <Skeleton className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gray-800" />
      <div className="flex-1 space-y-3 w-full">
        <Skeleton className="h-8 w-48 max-w-full bg-gray-800" />
        <Skeleton className="h-6 w-32 max-w-full bg-gray-800" />
        <Skeleton className="h-4 w-64 max-w-full bg-gray-800" />
      </div>
    </div>
    
    <div className="bg-[#1e1e1e] rounded-lg p-5 border border-gray-800">
      <Skeleton className="h-6 w-48 mb-4 bg-gray-800" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-20 w-full bg-gray-800 rounded-lg" />
        ))}
      </div>
    </div>
  </div>
);

export default ProfilePage;