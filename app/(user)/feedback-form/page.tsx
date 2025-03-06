"use client"

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, User, MessageSquare, Send } from 'lucide-react';
import toast from 'react-hot-toast';

interface FormData {
  name: string;
  message: string;
}

interface SubmitResponse {
  message: string;
  feedback?: any;
}

function FeedbackForm() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

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
      setFormData({ name: '', message: '' });
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to submit feedback";
      toast.error(errorMessage);
      setSuccessMessage(`Failed to submit feedback: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-[#1e1e1e] flex items-center justify-center p-4">
      <div className="w-full max-w-3xl p-8 rounded-lg border border-gray-800 shadow-lg">
        <h1 className="text-3xl font-bold text-white mb-6">Share Your Feedback</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className=" text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
              <User className="w-4 h-4" />
              Your Name
            </label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your name"
              className="w-full bg-[#1e1e1e] border-gray-800 text-white focus:border-emerald-400 focus:ring-emerald-400"
              required
            />
          </div>
          
          <div>
            <label htmlFor="message" className=" text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Your Message
            </label>
            <Textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Please share your thoughts or suggestions"
              className="w-full bg-[#1e1e1e] border-gray-800 text-white min-h-[200px] focus:border-emerald-400 focus:ring-emerald-400"
              required
            />
          </div>
          
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full flex justify-center items-center py-3 rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50"
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
        </form>
        
        {successMessage && (
          <div
            className={`mt-6 p-4 rounded-md ${
              successMessage.includes('Failed') 
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