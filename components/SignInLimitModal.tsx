"use client"

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Lock, LogIn, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SignInLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SignInLimitModal({ isOpen, onClose }: SignInLimitModalProps) {
  const router = useRouter();

  const handleSignIn = () => {
    router.push('/auth/login');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md bg-[#1e1e1e] border-gray-800 text-white rounded-xl shadow-2xl p-6">
        <DialogHeader className="mb-2">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20">
              <Lock className="w-6 h-6 text-emerald-400" />
            </div>
            <DialogTitle className="text-xl font-semibold tracking-tight">Limit Reached</DialogTitle>
          </div>
          <DialogDescription className="text-gray-400 text-[15px] leading-relaxed">
            You've reached the free execution limit for guests. Sign in now to get unlimited code executions and save your work.
          </DialogDescription>
        </DialogHeader>


        <DialogFooter className="flex flex-col sm:flex-row gap-3 sm:justify-end items-center w-full mt-2">
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-300 hover:bg-[#252525] w-full sm:w-auto text-sm transition-colors"
          >
            Maybe Later
          </Button>
          <Button
            onClick={handleSignIn}
            className="bg-emerald-600 hover:bg-emerald-500 text-white w-full sm:w-auto min-w-[140px] transition-all duration-200 shadow-lg shadow-emerald-600/20"
          >
            <LogIn className="w-4 h-4 mr-2" />
            Sign In Now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
