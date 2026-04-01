"use client"

import React, { use, useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, User, MessageSquare, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import { CurrentUser } from '@/types/User';

interface FormData {
  name: string;
  message: string;
}

interface SubmitResponse {
  message: string;
  feedback?: any;
}

function FeedbackForm() {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const user = useSession();
  const userName = user.data?.user.name;
  const [formData, setFormData] = useState<FormData>({
    name: currentUser?.username || "",
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');

  useEffect(() => {
    const getCurrentUser = async () => {
      const response = await fetch("/api/user/profile", {
        method: "GET"
      })
      const data = await response.json();
      setCurrentUser(data.user);
    }
    getCurrentUser();
  },[])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  useEffect(() => {
    if (currentUser?.username) {
      setFormData(prev => ({
        ...prev,
        name: currentUser.username
      }));
    }
  }, [currentUser?.username])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSuccessMessage('');

    if (!formData.name.trim() || !formData.message.trim()) {
      toast.error("Name and message are required");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/feedback-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data: SubmitResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      toast.success('Thank you for your feedback!');
      setSuccessMessage('Your feedback has been submitted successfully. We appreciate your input!');

      // Reset form
      setFormData({ name: userName || '', message: '' });

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to submit feedback";
      toast.error(errorMessage);
      setSuccessMessage(`Failed to submit feedback: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#1e1e1e] text-white p-4 sm:p-12 flex justify-center">
      <div className="w-full max-w-3xl pt-8 sm:pt-16">
        <div className="mb-10 text-left">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-3">Feedback</h1>
          <p className="text-gray-400 text-[15px]">Help us shape the future of CodeX. We read every message.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-gray-300">
              Name
            </label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              readOnly
              onChange={handleChange}
              placeholder="Your name"
              className="w-full bg-[#252525] border-transparent focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-lg p-3 h-12 text-[15px] transition-all text-white"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="message" className="text-sm font-medium text-gray-300 flex justify-between items-center">
              <span>Message</span>
            </label>
            <Textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="What's on your mind? Missing features, bugs, or general thoughts..."
              className="w-full bg-[#252525] border-transparent focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-lg p-4 resize-none min-h-[160px] text-[15px] transition-all placeholder:text-gray-500 text-white"
              required
            />
          </div>

          <div className="pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-8 h-12 flex justify-center items-center rounded-lg text-white bg-emerald-600 hover:bg-emerald-500 transition-colors font-medium disabled:opacity-50"
            >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin mr-2 h-5 w-5" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="mr-2 h-5 w-5" />
                Submit Feedback
              </>
            )}
          </Button>
          </div>
        </form>

        {successMessage && (
          <div
            className={`mt-6 p-4 rounded-md ${successMessage.includes('Failed')
                ? 'bg-red-900/50 text-red-200 border border-red-700'
                : 'bg-emerald-900/50 text-emerald-200 border border-emerald-700'
              }`}
          >
            {successMessage}
          </div>
        )}
      </div>
    </div>
  );
}

export default FeedbackForm;