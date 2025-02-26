"use client"

import { Button } from '@/components/ui/button'
import Image from 'next/image'
import React from 'react'
import { ArrowRight, Code, Lock, Terminal, Zap, BrainCircuit, Palette, Sparkles, GitBranch, Laptop, Check, Star, Download, Users } from 'lucide-react'
import { useRouter } from 'next/navigation'

function Home() {
  const router = useRouter()
  return (
    <div className="bg-[#1e1e1e] text-white min-h-screen overflow-hidden">
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-emerald-500/10 blur-[100px] rounded-full z-0"></div>
      <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-emerald-500/10 blur-[100px] rounded-full z-0"></div>
      
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <HeroSection/>
        <AboutSection/>
        <FeatureSection/>
        <CTASection/>
        <Footer/>
      </main>
    </div>
  )
}

function HeroSection(){
  const router = useRouter();
  return(
    <div className="py-16 md:py-24 flex flex-col md:flex-row items-center">
      <div className="flex-1 text-left md:pr-12">
        <div className="inline-flex items-center px-3 py-1 mb-6 rounded-full bg-emerald-900/30 border border-emerald-500/20 text-emerald-400 text-sm">
          <Star size={14} className="mr-1" /> New code assistance features
        </div>
        
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 leading-tight">
          <span className="relative">
            Modern Code <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">Editor</span>
          </span>
        </h1>
        
        <p className="text-xl text-gray-300 mb-8 max-w-xl">
          CodeX is a code editor with smart suggestions to help you write code more efficiently.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Button onClick={() => router.push("/auth/register")} className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-6 text-lg rounded-md flex items-center group transition-all">
            Try CodeX
            <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
          </Button>
          
          <Button variant="outline" className="border-gray-700 hover:bg-gray-300 text-black px-8 py-6 text-lg rounded-md">
            View Demo
          </Button>
        </div>
        
        <div className="flex items-center text-gray-400 text-sm">
          <Check size={16} className="text-emerald-400 mr-1" /> Early access available
          <span className="mx-2">•</span>
          <Check size={16} className="text-emerald-400 mr-1" /> Free during beta
        </div>
      </div>
      
      <div className="flex-1 mt-12 md:mt-0 relative">
        <div className="absolute -inset-4 bg-emerald-500/20 rounded-2xl blur-xl"></div>
        <div className="relative overflow-hidden rounded-xl border border-gray-800 shadow-2xl">
          <div className="absolute top-0 left-0 right-0 h-8 bg-[#252525] flex items-center px-4">
            <div className="flex space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
          </div>
          <div className="pt-8">
            <Image
              src="/homeimg.png"
              alt="CodeX Editor Interface"
              width={600}
              height={400}
              className="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function AboutSection(){
  return (
    <div className="py-20 md:py-28 flex flex-col items-center">
      <div className="text-center mb-16">
        <div className="inline-flex items-center px-3 py-1 mb-4 rounded-full bg-emerald-900/30 border border-emerald-500/20 text-emerald-400 text-sm">
          ABOUT CODEX
        </div>
        <h2 className="text-3xl md:text-5xl font-bold mb-6">
          A Better Way to <span className="text-emerald-400">Code</span>
        </h2>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          I'm building tools to make coding more intuitive and efficient
        </p>
      </div>

      <div className="relative w-full max-w-5xl h-96 md:h-[600px] mx-auto">
        <div className="absolute -inset-8 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 blur-2xl rounded-2xl z-0"></div>
        <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-emerald-500/30 to-transparent z-10"></div>
        <Image
          src="/homeimg.png"
          alt="CodeX Editor Interface"
          layout="fill"
          objectFit="contain"
          className="relative z-20 rounded-xl"
        />
        
        <div className="absolute -bottom-6 -right-6 bg-[#252525] border border-gray-800 p-4 rounded-lg shadow-xl z-30 max-w-xs">
          <div className="flex items-start">
            <div className="text-emerald-400 bg-emerald-400/10 p-2 rounded-lg mr-3">
              <Zap size={20} />
            </div>
            <div>
              <h4 className="font-semibold mb-1">Code suggestions</h4>
              <p className="text-gray-400 text-sm">Get helpful completion suggestions as you type</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function FeatureSection(){
  const features = [
    {
      title: "Code Assistance",
      description: "Get helpful code suggestions based on what you're typing to help speed up common coding tasks.",
      icon: <BrainCircuit size={24} />
    },
    {
      title: "Version Control",
      description: "Built-in support for tracking changes to your code and collaborating with others.",
      icon: <GitBranch size={24} />
    },
    {
      title: "Smart Completions",
      description: "Intelligent code completions that learn from common patterns to offer relevant suggestions.",
      icon: <Zap size={24} />
    },
    {
      title: "Syntax Highlighting",
      description: "Clear visual distinction between different code elements makes your code easier to read and understand.",
      icon: <Palette size={24} />
    },
    {
      title: "Cross-Platform",
      description: "Use CodeX on different devices with a consistent experience across platforms.",
      icon: <Laptop size={24} />
    },
    {
      title: "Performance Focus",
      description: "Built for speed and responsiveness, even when working with larger codebases.",
      icon: <Sparkles size={24} />
    }
  ];

  return(
    <div className="py-20">
      <div className="text-center mb-16">
        <div className="inline-flex items-center px-3 py-1 mb-4 rounded-full bg-emerald-900/30 border border-emerald-500/20 text-emerald-400 text-sm">
          FEATURES
        </div>
        <h2 className="text-3xl md:text-5xl font-bold mb-6">
          Tools to Help You <span className="text-emerald-400">Code Better</span>
        </h2>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          Designed to make your coding workflow smoother and more productive
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <div 
            key={index} 
            className="group p-8 rounded-xl bg-gradient-to-b from-[#252525] to-[#222] border border-gray-800 hover:border-emerald-500/50 transition-all duration-300 hover:translate-y-[-4px] hover:shadow-lg hover:shadow-emerald-900/20"
          >
            <div className="flex items-center mb-4">
              <div className="p-3 rounded-lg bg-emerald-400/10 text-emerald-400 mr-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold">{feature.title}</h3>
            </div>
            <p className="text-gray-400 group-hover:text-gray-300 transition-colors mt-4">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

function CTASection(){
  return (
    <div className="py-20 my-10">
      <div className="max-w-4xl mx-auto text-center relative">
        <div className="absolute -inset-10 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 blur-3xl rounded-full z-0"></div>
        <div className="relative z-10 bg-gradient-to-b from-[#252525] to-[#222] border border-gray-800 rounded-2xl p-12 shadow-2xl">
          <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 bg-emerald-500 text-[#1e1e1e] font-bold px-6 py-2 rounded-full text-sm">
            BETA ACCESS
          </div>
          
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Ready to try <span className="text-emerald-400">CodeX</span>?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join our beta program and help shape the future of coding tools.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-8">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-6 text-lg rounded-md w-full sm:w-auto flex items-center justify-center">
              <Download size={20} className="mr-2" />
              Download Beta
            </Button>
            <Button className="bg-transparent border border-emerald-500 text-white hover:bg-emerald-900/20 px-8 py-6 text-lg rounded-md w-full sm:w-auto flex items-center justify-center">
              <Users size={20} className="mr-2" />
              Join Waitlist
            </Button>
          </div>
          
          <p className="text-gray-400 text-sm">Free during beta • We welcome your feedback</p>
        </div>
      </div>
    </div>
  )
}

function Footer(){
  return (
    <footer className="py-12 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <h2 className="text-2xl font-bold flex items-center">
              <Code className="mr-2 text-emerald-400" /> CodeX
            </h2>
            <p className="text-gray-400 mt-2">© 2025 CodeX. All rights reserved.</p>
          </div>
          
          <div className="flex flex-wrap justify-center md:justify-end gap-6 md:gap-8">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">About</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Features</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Documentation</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Blog</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Home