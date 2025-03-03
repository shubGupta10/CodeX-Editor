"use client"

import { Button } from '@/components/ui/button'
import React, { useRef, useEffect } from 'react'
import { ArrowRight, Code,  Terminal, Zap, BrainCircuit, Palette, Sparkles, GitBranch, Laptop, Check, Star,   Play, Pause, Code2Icon, MessageSquareCode, FileCode, SendHorizontal, CheckCircle2, Languages, Code2, Lightbulb } from 'lucide-react'
import { useRouter } from 'next/navigation'

function Home() {
  return (
    <div className="bg-[#1e1e1e] text-white min-h-screen overflow-hidden">
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-emerald-500/10 blur-[100px] rounded-full z-0"></div>
      <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-emerald-500/10 blur-[100px] rounded-full z-0"></div>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <HeroSection />
        <AboutSection />
        <FeatureSection />
        <AIFeaturesSection />
        <CTASection/>
      </main>
    </div>
  )
}

function VideoPlayer({ src, fallbackImage, className }: { src: string; fallbackImage: string; className: string }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [isHovering, setIsHovering] = React.useState(false);

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleEnded = () => {
      setIsPlaying(false);
    };

    video.addEventListener('ended', handleEnded);
    return () => {
      video.removeEventListener('ended', handleEnded);
    };
  }, []);

  return (
    <div
      className={`relative ${className}`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-cover rounded-lg"
        poster={fallbackImage}
        muted
        playsInline
      >
        <source src={src} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {(isHovering || !isPlaying) && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg transition-opacity hover:bg-black/40"
          aria-label={isPlaying ? "Pause video" : "Play video"}
        >
          <div className="p-3 bg-emerald-500 rounded-full text-white">
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </div>
        </button>
      )}
    </div>
  );
}

function HeroSection() {
  const router = useRouter();

  return (
    <div className="py-12 md:py-20 flex flex-col md:flex-row items-center">
      <div className="flex-1 text-left md:pr-12 mb-8 md:mb-0">
        <div className="inline-flex items-center px-3 py-1 mb-6 rounded-full bg-emerald-900/30 border border-emerald-500/20 text-emerald-400 text-sm">
          <Star size={14} className="mr-1" /> Feature-Rich Code Playground
        </div>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-tight">
          <span className="relative">
            Modern Code <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">Editor</span>
          </span>
        </h1>

        <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-xl">
          CodeX is a code editor with smart suggestions to help you write code more efficiently.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Button onClick={() => router.push("/editor")} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-5 text-lg rounded-md flex items-center group transition-all">
            Try CodeX
            <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
          </Button>

          <Button onClick={() => router.push("/editor")} variant="outline" className="border-gray-700 hover:bg-gray-300 hover:border-gray-600 text-black px-6 py-5 text-lg rounded-md">
            View Demo
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center text-gray-400 text-sm gap-y-2">
          <span className="flex items-center">
            <Check size={16} className="text-emerald-400 mr-1 flex-shrink-0" /> AI-powered assistant
          </span>
          <span className="hidden sm:block mx-2">•</span>
          <span className="flex items-center">
            <Check size={16} className="text-emerald-400 mr-1 flex-shrink-0" /> Secure code execution environment
          </span>
        </div>
      </div>

      <div className="flex-1 w-full max-w-2xl mx-auto md:max-w-3xl relative">
        <div className="absolute -inset-6 bg-emerald-500/20 rounded-2xl blur-xl"></div>
        <div className="relative overflow-hidden rounded-xl border border-gray-800 shadow-2xl">
          <div className="absolute top-0 left-0 right-0 h-10 bg-[#252525] flex items-center px-4 z-10">
            <div className="flex space-x-2">
              <div className="w-4 h-4 rounded-full bg-red-500"></div>
              <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
              <div className="w-4 h-4 rounded-full bg-green-500"></div>
            </div>
          </div>
          <div className="pt-10">
            <VideoPlayer
              src="https://res.cloudinary.com/dkp6hsvoy/video/upload/v1741006974/iie9bysa6ykg51fk8ior.mp4"
              fallbackImage="https://res.cloudinary.com/dkp6hsvoy/image/upload/v1741011264/codex-images/sicmrhfqdj0l4cemawiq.png"
              className="relative z-20 rounded-xl w-full h-full object-contain"
            />
          </div>
        </div>
      </div>

    </div>
  )
}

function AboutSection() {
  return (
    <div id="about" className="w-full py-12 sm:py-16 md:py-20 lg:py-24 flex flex-col items-center scroll-mt-16 px-4 sm:px-6 md:px-8">
      <div className="text-center mb-8 sm:mb-10 md:mb-12 lg:mb-16 w-full max-w-4xl mx-auto">
        <div className="inline-flex items-center px-3 py-1 mb-3 sm:mb-4 rounded-full bg-emerald-900/30 border border-emerald-500/20 text-emerald-400 text-xs sm:text-sm">
          ABOUT CODEX
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">
          A Better Way to <span className="text-emerald-400">Code</span>
        </h2>
        <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-xs sm:max-w-lg md:max-w-2xl mx-auto">
          I'm building tools to make coding more intuitive and efficient
        </p>
      </div>

      <div className="relative w-full max-w-7xl">
        <div className="relative w-full">
          {/* Background gradient effect - responsive sizing */}
          <div className="absolute -inset-4 sm:-inset-6 md:-inset-8 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 blur-xl sm:blur-2xl rounded-2xl z-0"></div>
          <div className="absolute rounded-xl bg-gradient-to-r from-emerald-500/30 to-transparent z-10"></div>

          {/* Increased video size for mobile */}
          <div className="w-full h-auto">
            <VideoPlayer
              src="https://res.cloudinary.com/dkp6hsvoy/video/upload/v1741006974/iie9bysa6ykg51fk8ior.mp4"
              fallbackImage="https://res.cloudinary.com/dkp6hsvoy/image/upload/v1741011264/codex-images/sicmrhfqdj0l4cemawiq.png"
              className="relative z-20 rounded-xl w-full h-full object-cover"
            />
          </div>

          {/* Feature cards - hidden on mobile and tablets, visible on desktop (lg) */}
          <div className="hidden lg:flex absolute bottom-8 right-8 flex-col gap-4 z-30">
            {/* Code Suggestions */}
            <div className="bg-[#252525] border border-gray-800 p-4 rounded-lg shadow-xl max-w-xs transform transition-transform hover:scale-105">
              <div className="flex items-start">
                <div className="text-emerald-400 bg-emerald-400/10 p-2 rounded-lg mr-3 flex-shrink-0">
                  <Zap size={20} />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Code Suggestions</h4>
                  <p className="text-gray-400 text-sm">Get helpful completion suggestions as you type</p>
                </div>
              </div>
            </div>

            {/* Code Converter */}
            <div className="bg-[#252525] border border-gray-800 p-4 rounded-lg shadow-xl max-w-xs transform transition-transform hover:scale-105">
              <div className="flex items-start">
                <div className="text-emerald-400 bg-emerald-400/10 p-2 rounded-lg mr-3 flex-shrink-0">
                  <Code size={20} />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Code Converter</h4>
                  <p className="text-gray-400 text-sm">Seamlessly translate your code between languages</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureSection() {
  const features = [
    {
      title: "Multi-Language Support",
      description: "Write and collaborate in multiple programming languages with seamless integration.",
      icon: <GitBranch size={24} />,
    },
    {
      title: "Syntax Highlighting",
      description: "Enhanced readability with clear visual distinction between code elements.",
      icon: <Palette size={24} />,
    },
    {
      title: "Code Converter",
      description: "Convert your code into any language using AI withing some seconds.",
      icon: <Code2Icon size={24} />,
    },
    {
      title: "Smart Code Assistance",
      description: "AI-powered suggestions to speed up coding and reduce errors.",
      icon: <BrainCircuit size={24} />,
    },
    {
      title: "Intelligent Code Completion",
      description: "Predictive suggestions based on common patterns for faster development.",
      icon: <Zap size={24} />,
    },
    {
      title: "Optimized Performance",
      description: "Designed for speed and efficiency, even with large projects.",
      icon: <Sparkles size={24} />,
    },
  ];


  return (
    <div id="features" className="py-16 md:py-20 scroll-mt-16">
      <div className="text-center mb-12 md:mb-16">
        <div className="inline-flex items-center px-3 py-1 mb-4 rounded-full bg-emerald-900/30 border border-emerald-500/20 text-emerald-400 text-sm">
          FEATURES
        </div>
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
          Tools to Help You <span className="text-emerald-400">Code Better</span>
        </h2>
        <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
          Designed to make your coding workflow smoother and more productive
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {features.map((feature, index) => (
          <div
            key={index}
            className="group p-6 md:p-8 rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-900/20"
          >
            <div className="flex items-center mb-4">
              <div className="p-3 rounded-lg bg-emerald-400/10 text-emerald-400 mr-4 flex-shrink-0">
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

function AIFeaturesSection() {
  return (
    <div id="ai-features" className="py-16 md:py-24 scroll-mt-16">
      <div className="text-center mb-12 md:mb-16">
        <div className="inline-flex items-center px-3 py-1 mb-4 rounded-full bg-emerald-900/30 border border-emerald-500/20 text-emerald-400 text-sm">
          AI-POWERED FEATURES
        </div>
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
          Supercharge Your Workflow with <span className="text-emerald-400">AI</span>
        </h2>
        <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
          CodeX integrates powerful AI capabilities to make you more productive
        </p>
      </div>

      <div className="space-y-52">
        <CodeConverterFeature />
        <AICodeAssistantFeature />
        <CodeSuggestionFeature />
      </div>
    </div>
  );
}

function CodeConverterFeature() {
  return (
    <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
      <div className="w-full lg:w-3/4 xl:w-2/3 order-2 lg:order-1">
        <div className="relative">
          <div className="absolute -inset-6 bg-emerald-500/20 rounded-2xl blur-xl"></div>
          <div className="relative overflow-hidden rounded-xl border border-gray-800 shadow-2xl">
            <VideoPlayer
              src="https://res.cloudinary.com/dkp6hsvoy/video/upload/v1741008565/codeConverterNewVideo664654656_vckobr.mp4"
              fallbackImage="https://res.cloudinary.com/dkp6hsvoy/image/upload/v1741011263/codex-images/gcbcc5dapgmq7rhwnv5l.png"
              className="bg-emerald-500 w-full h-auto object-cover"
            />
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 order-1 lg:order-2">
        <div className="inline-flex items-center px-3 py-1 mb-4 rounded-full bg-emerald-900/30 border border-emerald-500/20 text-emerald-400 text-sm">
          <Code2 size={16} className="mr-2" /> CODE CONVERTER
        </div>
        <h3 className="text-2xl md:text-3xl font-bold mb-4">
          Translate Your Code Between Languages Instantly
        </h3>
        <p className="text-gray-300 mb-6">
          Need your JavaScript in Python? PHP in Go? Our AI-powered code converter seamlessly translates your code between languages while preserving functionality and following best practices.
        </p>

        <div className="space-y-4">
          <div className="flex items-start">
            <div className="p-2 rounded-lg bg-emerald-400/10 text-emerald-400 mr-3 flex-shrink-0">
              <Zap size={18} />
            </div>
            <div>
              <h4 className="font-semibold">Lightning Fast</h4>
              <p className="text-gray-400 text-sm">Convert entire files or code snippets in seconds</p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="p-2 rounded-lg bg-emerald-400/10 text-emerald-400 mr-3 flex-shrink-0">
              <Languages size={18} />
            </div>
            <div>
              <h4 className="font-semibold">Multiple Language Support</h4>
              <p className="text-gray-400 text-sm">Python, JavaScript, TypeScript, Java, C#, PHP, Go, and more</p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="p-2 rounded-lg bg-emerald-400/10 text-emerald-400 mr-3 flex-shrink-0">
              <CheckCircle2 size={18} />
            </div>
            <div>
              <h4 className="font-semibold">Maintains Functionality</h4>
              <p className="text-gray-400 text-sm">Preserves logic and behavior across languages</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AICodeAssistantFeature() {
  return (
    <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
      <div className="w-full lg:w-1/2">
        <div className="inline-flex items-center px-3 py-1 mb-4 rounded-full bg-emerald-900/30 border border-emerald-500/20 text-emerald-400 text-sm">
          <BrainCircuit size={16} className="mr-2" /> AI CODE ASSISTANT
        </div>
        <h3 className="text-2xl md:text-3xl font-bold mb-4">
          Your Intelligent Coding Partner
        </h3>
        <p className="text-gray-300 mb-6">
          Get help with bugs, optimizations, and code reviews from an AI assistant that understands your codebase. Ask questions in natural language and receive contextually relevant solutions.
        </p>

        <div className="space-y-4">
          <div className="flex items-start">
            <div className="p-2 rounded-lg bg-emerald-400/10 text-emerald-400 mr-3 flex-shrink-0">
              <MessageSquareCode size={18} />
            </div>
            <div>
              <h4 className="font-semibold">Context-Aware</h4>
              <p className="text-gray-400 text-sm">Gets insights from your entire file or project</p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="p-2 rounded-lg bg-emerald-400/10 text-emerald-400 mr-3 flex-shrink-0">
              <Terminal size={18} />
            </div>
            <div>
              <h4 className="font-semibold">Natural Language Interface</h4>
              <p className="text-gray-400 text-sm">Ask questions or request help in plain English</p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="p-2 rounded-lg bg-emerald-400/10 text-emerald-400 mr-3 flex-shrink-0">
              <FileCode size={18} />
            </div>
            <div>
              <h4 className="font-semibold">Code Explanations</h4>
              <p className="text-gray-400 text-sm">Get complex code explained in simple terms</p>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-3/4 xl:w-2/3">
        <div className="relative">
          <div className="absolute -inset-6 bg-emerald-500/20 rounded-2xl blur-xl"></div>
          <div className="relative overflow-hidden rounded-xl border border-gray-800 shadow-2xl">
            <VideoPlayer
              src="https://res.cloudinary.com/dkp6hsvoy/video/upload/v1741006806/u80sbe8yvs7mqe3i56hc.mp4"
              fallbackImage="https://res.cloudinary.com/dkp6hsvoy/image/upload/v1741011263/codex-images/qqmhkm8psuu7e1gmwtdp.png"
              className="bg-emerald-500 w-full h-auto aspect-video"
            />
          </div>
        </div>
      </div>


    </div>
  );
}

function CodeSuggestionFeature() {
  return (
    <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
      <div className="w-full lg:w-3/4 xl:w-2/3 order-2 lg:order-1">
        <div className="relative">
          <div className="absolute -inset-6 bg-emerald-500/20 rounded-2xl blur-xl"></div>
          <div className="relative overflow-hidden rounded-xl border border-gray-800 shadow-2xl">
            <VideoPlayer
              src="https://res.cloudinary.com/dkp6hsvoy/video/upload/v1741006801/kwnwulnclj17ob76zpoh.mp4"
              fallbackImage="https://res.cloudinary.com/dkp6hsvoy/image/upload/v1741011263/codex-images/dsgf0npbuax4tujqk8yw.png"
              className="bg-emerald-500 w-full h-auto aspect-video object-cover"
            />
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 order-1 lg:order-2">
        <div className="inline-flex items-center px-3 py-1 mb-4 rounded-full bg-emerald-900/30 border border-emerald-500/20 text-emerald-400 text-sm">
          <Sparkles size={16} className="mr-2" /> CODE SUGGESTIONS
        </div>
        <h3 className="text-2xl md:text-3xl font-bold mb-4">
          Smart Completion That Understands Your Code
        </h3>
        <p className="text-gray-300 mb-6">
          Get intelligent code suggestions as you type. Our AI analyzes your codebase to suggest relevant functions, methods, and code blocks that fit your specific context.
        </p>

        <div className="space-y-4">
          <div className="flex items-start">
            <div className="p-2 rounded-lg bg-emerald-400/10 text-emerald-400 mr-3 flex-shrink-0">
              <Lightbulb size={18} />
            </div>
            <div>
              <h4 className="font-semibold">Context-Aware Suggestions</h4>
              <p className="text-gray-400 text-sm">Gets smarter the more you code in your project</p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="p-2 rounded-lg bg-emerald-400/10 text-emerald-400 mr-3 flex-shrink-0">
              <Zap size={18} />
            </div>
            <div>
              <h4 className="font-semibold">Complete Functions & Blocks</h4>
              <p className="text-gray-400 text-sm">Suggests entire functions, not just single lines</p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="p-2 rounded-lg bg-emerald-400/10 text-emerald-400 mr-3 flex-shrink-0">
              <Code2 size={18} />
            </div>
            <div>
              <h4 className="font-semibold">Best Practice Recommendations</h4>
              <p className="text-gray-400 text-sm">Follows coding standards and patterns in your codebase</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CTASection() {
  const router = useRouter();
  return (
    <section id="cta" className="w-full py-16 md:py-24 px-4 sm:px-6 md:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="relative overflow-hidden rounded-2xl border border-gray-800 p-8 md:p-12">
          <div className="relative flex flex-col items-center text-center">
            {/* Simple Tagline */}
            <div className="inline-flex items-center px-3 py-1 mb-4 rounded-full bg-emerald-900/30 border border-emerald-500/20 text-emerald-400 text-sm">
              A better way to write code
            </div>

            {/* Headline */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              Try <span className="text-emerald-400">CodeX</span> and see for yourself
            </h2>

            {/* Description */}
            <p className="text-lg text-gray-300 mb-8 max-w-2xl">
              CodeX helps you write code with smart suggestions and a built-in code converter. Give it a shot and let me know what you think!
            </p>

            {/* CTA Button */}
            <div onClick={() => router.push("/editor")} className="flex flex-col sm:flex-row gap-4">
              <button className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition duration-300 transform hover:scale-105 shadow-lg hover:shadow-emerald-500/20">
                Try CodeX
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}



export default Home