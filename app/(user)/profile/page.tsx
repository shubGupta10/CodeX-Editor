"use client";

import React, { useEffect, useState } from "react";
import { User } from "@/types/User";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Mail, User as UserIcon, Clock } from "lucide-react";
import { EditProfileDialog } from "./EditProfile";

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
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="min-h-screen w-full bg-[#1e1e1e] text-white p-4 flex items-center justify-center">
      <div className="w-full max-w-4xl">
        <Card className="bg-[#252526] border-none shadow-lg w-full">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-[#1e1e1e] rounded-t-lg p-4 sm:p-6">
            <CardTitle className="text-white text-xl sm:text-2xl font-bold mb-4 sm:mb-0">User Profile</CardTitle>
            <Button 
              onClick={() => setIsEditOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
              disabled={!user || loading}
            >
              Edit Profile
            </Button>
          </CardHeader>
          
          <CardContent className="p-4 sm:p-6">
            {loading ? (
              <ProfileSkeleton />
            ) : user ? (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
                  <Avatar className="w-20 h-20 sm:w-24 sm:h-24 border-2 border-blue-500">
                    <AvatarImage src={user.profileImage} alt={user.username} />
                    <AvatarFallback className="bg-blue-700 text-white text-xl">
                      {getInitials(user.firstName, user.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 space-y-2 text-center sm:text-left">
                    <h3 className="text-white text-xl sm:text-2xl font-semibold">
                      {user.firstName} {user.lastName}
                    </h3>
                    <Badge className="bg-blue-600 hover:bg-blue-600">@{user.username}</Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white">
                  <div className="flex items-center gap-2">
                    <Mail className="text-blue-400 h-5 w-5 flex-shrink-0" />
                    <span className="text-gray-400">Email:</span>
                    <span className="break-all">{user.email}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Clock className="text-blue-400 h-5 w-5 flex-shrink-0" />
                    <span className="text-gray-400">Last Login:</span>
                    <span>{formatDate(user.lastLogin)}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="text-blue-400 h-5 w-5 flex-shrink-0" />
                    <span className="text-gray-400">Created:</span>
                    <span>{formatDate(user.createdAt)}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="text-blue-400 h-5 w-5 flex-shrink-0" />
                    <span className="text-gray-400">Updated:</span>
                    <span>{formatDate(user.updatedAt)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-white">
                <UserIcon className="h-16 w-16 text-gray-500 mb-4" />
                <h3 className="text-xl font-medium">No User Found</h3>
                <p className="text-gray-400 mt-2">Please sign in to view your profile</p>
              </div>
            )}
          </CardContent>
        </Card>
        
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
  <div className="space-y-6">
    <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
      <Skeleton className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gray-700" />
      <div className="flex-1 space-y-2 w-full">
        <Skeleton className="h-8 w-48 max-w-full bg-gray-700" />
        <Skeleton className="h-5 w-24 max-w-full bg-gray-700" />
      </div>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="h-6 w-full bg-gray-700" />
      ))}
    </div>
  </div>
);

export default ProfilePage;