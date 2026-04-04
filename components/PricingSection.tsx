"use client";

import React, { useState } from "react";
import { Check, Zap, Star, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PLAN_CONFIG } from "@/lib/plans";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function PricingSection() {
    const [isAnnual, setIsAnnual] = useState(false);
    const router = useRouter();

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
            cta: "Get Started",
            highlight: false,
            comingSoon: false,
            link: "/editor"
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
            link: "/pricing"
        }
    ];

    return (
        <section id="pricing" className="py-32 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="inline-flex items-center px-3 py-1 mb-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium">
                        READY TO SCALE?
                    </div>
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
                        Choose the Plan That <span className="text-emerald-400">Works for You</span>
                    </h2>
                    
                    <div className="flex items-center justify-center mt-8 gap-4">
                        <span className={`text-sm font-medium ${!isAnnual ? 'text-white' : 'text-gray-500'}`}>Monthly</span>
                        <button 
                            onClick={() => setIsAnnual(!isAnnual)}
                            className="w-12 h-6 bg-[#252525] rounded-full p-1 relative transition-colors border border-gray-800"
                        >
                            <div className={`w-4 h-4 bg-emerald-500 rounded-full shadow-lg transition-transform duration-200 ${isAnnual ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                        <span className={`text-sm font-medium ${isAnnual ? 'text-white' : 'text-gray-500'}`}>Yearly <Badge className="ml-2 bg-emerald-500/10 text-emerald-400 border-none text-[10px]">-20%</Badge></span>
                    </div>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                {plans.map((plan, idx) => (
                    <motion.div
                        key={plan.name}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.1, duration: 0.5 }}
                        className="relative group"
                    >
                        {plan.highlight && (
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                                <Badge className="bg-emerald-500 text-black hover:bg-emerald-400 font-bold px-4 py-1.5 rounded-full shadow-xl shadow-emerald-500/20 border-none">
                                    MOST POPULAR
                                </Badge>
                            </div>
                        )}
                        
                        <Card className={`h-full flex flex-col bg-[#252525] border-gray-800 transition-all duration-300 hover:border-emerald-500/30 group-hover:shadow-2xl group-hover:shadow-emerald-500/5 ${plan.highlight ? 'ring-1 ring-emerald-500/20' : ''}`}>
                            <CardHeader className="p-8">
                                <CardTitle className="text-xl font-bold capitalize text-white mb-2">{plan.name}</CardTitle>
                                <CardDescription className="text-gray-400 text-sm">{plan.description}</CardDescription>
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
                                            <span className="text-gray-300 text-sm">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                            
                            <CardFooter className="p-8 pt-0">
                                <Button 
                                    onClick={() => router.push(plan.link)}
                                    className={`w-full h-12 text-[15px] font-bold rounded-xl transition-all duration-200 border-none ${
                                        plan.comingSoon 
                                            ? 'bg-white/5 text-gray-500 cursor-not-allowed hover:bg-white/5' 
                                            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/10'
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
        </section>
    );
}
