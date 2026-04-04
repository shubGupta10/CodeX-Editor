"use client";

import React, { useState } from "react";
import { Check, Zap, Shield, Star, Globe, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PLAN_CONFIG } from "@/lib/plans";
import { motion } from "framer-motion";

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(false);

  const plans = [
    {
      name: "free",
      price: "$0",
      description: "Ideal for individual developers and students starting out.",
      features: [
        `${PLAN_CONFIG.free.aiMaxRequests} AI completions per day`,
        `${PLAN_CONFIG.free.conversionLimit} Code-to-Code conversions`,
        `${PLAN_CONFIG.free.maxFiles} Project workspace limit`,
        "Standard execution speeds",
        "Public code sharing",
      ],
      cta: "Current Plan",
      highlight: false,
      comingSoon: false,
    },
    {
      name: "pro",
      price: isAnnual ? "$49" : "$5",
      period: isAnnual ? "/year" : "/month",
      description: "Maximum power and unlimited potential for pros.",
      features: [
        `${PLAN_CONFIG.pro.aiMaxRequests} AI completions per day`,
        `${PLAN_CONFIG.pro.conversionLimit} Unlimited conversions`,
        `${PLAN_CONFIG.pro.maxFiles} Project workspace limit`,
        "100MB Isolated Cloud Storage",
        "Project downloading & Export",
      ],
      cta: "Coming Soon",
      highlight: true,
      comingSoon: true,
    }
  ];

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-white pt-24 pb-20 overflow-hidden relative">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-emerald-500/10 to-transparent blur-3xl -z-10 opacity-30" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/15 border-emerald-500/20 mb-4 px-4 py-1 text-sm rounded-full font-medium">
              Flexible Pricing
            </Badge>
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-white via-white to-gray-500 bg-clip-text text-transparent">
              Elevate Your Coding <br /> with <span className="text-emerald-400">CodeX Pro</span>
            </h1>
            <p className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
              Choose the plan that fits your workflow. Unlock advanced AI assistance and unlimited code execution.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex items-center justify-center mt-10 gap-4"
          >
            <span className={`text-sm font-medium ${!isAnnual ? 'text-white' : 'text-gray-500'}`}>Monthly</span>
            <button 
              onClick={() => setIsAnnual(!isAnnual)}
              className="w-14 h-7 bg-[#252525] rounded-full p-1 relative transition-colors border border-gray-800"
            >
              <div className={`w-5 h-5 bg-emerald-500 rounded-full shadow-lg transition-transform duration-200 ${isAnnual ? 'translate-x-7' : 'translate-x-0'}`} />
            </button>
            <span className={`text-sm font-medium ${isAnnual ? 'text-white' : 'text-gray-500'}`}>
                Yearly <span className="text-emerald-400 text-xs ml-1 font-bold">Save 20%</span>
            </span>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, idx) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, x: idx === 0 ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + idx * 0.1, duration: 0.5 }}
              className="relative group"
            >
              {plan.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <Badge className="bg-emerald-500 text-black hover:bg-emerald-400 font-bold px-4 py-1.5 rounded-full shadow-xl shadow-emerald-500/20">
                    MOST POPULAR
                  </Badge>
                </div>
              )}
              
              <Card className={`h-full flex flex-col bg-[#252525] border-gray-800 transition-all duration-300 hover:border-emerald-500/30 group-hover:shadow-2xl group-hover:shadow-emerald-500/5 overflow-hidden ${plan.highlight ? 'ring-1 ring-emerald-500/20' : ''}`}>
                <CardHeader className="p-8">
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-xl bg-white/5 border border-white/10 ${plan.highlight ? 'text-emerald-400' : 'text-gray-400'}`}>
                      {plan.name === 'free' ? <Zap className="h-6 w-6" /> : <Star className="h-6 w-6" />}
                    </div>
                  </div>
                  <CardTitle className="text-2xl font-bold capitalize text-white mb-2">{plan.name}</CardTitle>
                  <CardDescription className="text-gray-400 line-clamp-2 min-h-[40px] text-[15px]">
                    {plan.description}
                  </CardDescription>
                  <div className="mt-8 flex items-baseline gap-1">
                    <span className="text-5xl font-extrabold text-white">{plan.price}</span>
                    <span className="text-gray-400 font-medium">{plan.period || ''}</span>
                  </div>
                </CardHeader>
                
                <CardContent className="flex-grow p-8 pt-0">
                  <div className="space-y-4">
                    {plan.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center">
                          <Check className="h-3 w-3 text-emerald-400" />
                        </div>
                        <span className="text-gray-300 text-sm whitespace-nowrap">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
                
                <CardFooter className="p-8 pt-0">
                  <Button 
                    className={`w-full h-12 text-[15px] font-bold rounded-xl transition-all duration-200 shadow-lg ${
                      plan.comingSoon 
                        ? 'bg-white/5 text-gray-500 border border-white/5 cursor-not-allowed hover:bg-white/5' 
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/10 group-hover:scale-[1.02]'
                    }`}
                    disabled={plan.comingSoon}
                  >
                    {plan.cta}
                    {!plan.comingSoon && <ArrowRight className="ml-2 h-4 w-4" />}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="mt-20 text-center"
        >
            <p className="text-gray-500 text-sm mb-6 uppercase tracking-widest font-bold">Everything you need to code at the speed of thought</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 opacity-40">
                <div className="flex flex-col items-center gap-2">
                    <Globe className="h-5 w-5" />
                    <span className="text-xs font-mono">Global Access</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                    <Shield className="h-5 w-5" />
                    <span className="text-xs font-mono">Secure Exec</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                    <Star className="h-5 w-5" />
                    <span className="text-xs font-mono">Top Tier AI</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                    <Zap className="h-5 w-5" />
                    <span className="text-xs font-mono">No Latency</span>
                </div>
            </div>
        </motion.div>
      </div>
    </div>
  );
}
