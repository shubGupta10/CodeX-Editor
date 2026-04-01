"use client"

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, MessageSquare, Send } from 'lucide-react';
import toast from 'react-hot-toast';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: (didSubmitOrDismiss: boolean) => void;
  userName?: string;
}

export function FeedbackModal({ isOpen, onClose, userName }: FeedbackModalProps) {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!message.trim()) {
      toast.error("Please enter some feedback first");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/feedback-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: userName || "Anonymous Developer",
          message: message,
        }),
      });

      if (!response.ok) throw new Error('Failed to submit');

      toast.success('Thanks for your feedback!');
      // True means we submitted or permanently dismissed so it shouldn't pop again
      onClose(true); 
    } catch (error) {
      toast.error('Failed to submit feedback');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose(false)}>
      <DialogContent className="max-w-md bg-[#1e1e1e] border-gray-800 text-white rounded-xl shadow-2xl p-6">
        <DialogHeader className="mb-2">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20">
              <MessageSquare className="w-6 h-6 text-emerald-400" />
            </div>
            <DialogTitle className="text-xl font-semibold tracking-tight">Enjoying CodeX?</DialogTitle>
          </div>
          <DialogDescription className="text-gray-400 text-[15px] leading-relaxed">
            You've compiled a few times! We'd love to hear how your experience is so far. Are we missing any features?
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Share your thoughts, bugs, or feature requests..."
            className="bg-[#252525] border-gray-700/50 focus:ring-emerald-500/50 focus:border-emerald-500/50 text-gray-200 min-h-[140px] resize-none text-[15px] placeholder:text-gray-500"
          />
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-3 sm:justify-between items-center w-full mt-2">
          <Button
            variant="ghost"
            onClick={() => onClose(true)}
            className="text-gray-500 hover:text-gray-300 hover:bg-[#252525] w-full sm:w-auto text-sm transition-colors"
          >
            Don't ask again
          </Button>
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={() => onClose(false)}
              className="bg-transparent border-gray-700 hover:bg-[#2a2a2a] text-gray-300 w-full sm:w-auto transition-colors"
            >
              Not now
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !message.trim()}
              className="bg-emerald-600 hover:bg-emerald-500 text-white w-full sm:w-auto min-w-[120px] transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
