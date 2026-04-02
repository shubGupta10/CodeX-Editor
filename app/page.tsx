"use client"

import { Button } from "@/components/ui/button"
import React, { useRef, useEffect } from "react"
import {
  ArrowRight,
  Code,
  Terminal,
  Zap,
  BrainCircuit,
  Palette,
  Sparkles,
  GitBranch,
  Check,
  Star,
  Play,
  Pause,
  Code2Icon,
  MessageSquareCode,
  FileCode,
  CheckCircle2,
  Languages,
  Code2,
  Lightbulb,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

function Home() {
  return (
    <div className="bg-[#1e1e1e] text-white min-h-screen overflow-hidden">

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <HeroSection />

        <section className="py-12 text-center">
          <h2 className="text-xl font-semibold mb-4">Start Coding by Language</h2>

          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <a href="/python-online-compiler" className="text-emerald-400 hover:underline">
              Python
            </a>
            <a href="/javascript-online-compiler" className="text-emerald-400 hover:underline">
              JavaScript
            </a>
            <a href="/java-online-compiler" className="text-emerald-400 hover:underline">
              Java
            </a>
            <a href="/typescript-online-compiler" className="text-emerald-400 hover:underline">
              TypeScript
            </a>
          </div>
        </section>

        <FeatureSection />
        <AIFeaturesSection />
        <CTASection />
      </main>
    </div>
  )
}

function VideoPlayer({ src, fallbackImage, className }: { src: string; fallbackImage: string; className: string }) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [isHovering, setIsHovering] = React.useState(false)

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play()
        setIsPlaying(true)
      } else {
        videoRef.current.pause()
        setIsPlaying(false)
      }
    }
  }

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleEnded = () => {
      setIsPlaying(false)
    }

    video.addEventListener("ended", handleEnded)
    return () => {
      video.removeEventListener("ended", handleEnded)
    }
  }, [])

  return (
    <motion.div
      className={`relative ${className}`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      whileHover={{ scale: 1.01 }}
      transition={{ type: "spring" as const, stiffness: 300, damping: 20 }}
    >
      <video ref={videoRef} className="w-full h-full object-cover rounded-lg" poster={fallbackImage} muted playsInline>
        <source src={src} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {(isHovering || !isPlaying) && (
        <motion.button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg transition-opacity hover:bg-black/40"
          aria-label={isPlaying ? "Pause video" : "Play video"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="p-3 bg-emerald-500 rounded-full text-white"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </motion.div>
        </motion.button>
      )}
    </motion.div>
  )
}

function HeroSection() {
  const router = useRouter()

  return (
    <section className="pt-10 pb-20 md:pt-20 md:pb-28 flex flex-col items-center text-center">
      {/* Badge */}
      <motion.div
        className="inline-flex items-center px-4 py-1.5 mb-6 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Star size={14} className="mr-2" /> The Modern Cloud IDE
      </motion.div>

      {/* Headline */}
      <motion.h1
        className="text-6xl sm:text-7xl md:text-8xl lg:text-[92px] font-extrabold tracking-tight mb-8 leading-[1.15] max-w-5xl px-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Start coding instantly <br />
        <span className="text-emerald-400">no setup needed.</span>
      </motion.h1>

      {/* Subtext */}
      <motion.p
        className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        Pick a language, write your code, and hit run. No installs, no config.
        AI helps you debug, convert, and complete as you go.
      </motion.p>

      {/* CTAs */}
      <motion.div
        className="flex flex-col sm:flex-row gap-4 mb-10"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Button
          onClick={() => router.push("/editor")}
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 h-12 text-[15px] font-medium rounded-lg flex items-center justify-center transition-colors"
        >
          Try CodeX
          <ArrowRight className="ml-2" size={16} />
        </Button>

        <Button
          onClick={() => {
            const el = document.getElementById('ai-features');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
          variant="outline"
          className="bg-transparent border-gray-700 text-gray-400 hover:bg-[#252525] hover:text-white h-12 px-8 text-[15px] font-medium rounded-lg transition-colors"
        >
          Watch Demo
        </Button>
      </motion.div>

      {/* Trust line */}
      <motion.p
        className="text-gray-500 text-sm tracking-wide mb-14"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        30+ languages &middot; Zero setup &middot; AI code assist built-in
      </motion.p>

      {/* Product preview */}
      <motion.div
        className="relative w-full max-w-5xl mx-auto"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <div className="w-full relative overflow-hidden rounded-xl border border-gray-800 shadow-2xl bg-[#1e1e1e]">
          <div className="flex items-center h-10 bg-[#252525] px-4 border-b border-gray-800 gap-2">
            <div className="w-3 h-3 rounded-full bg-[#ff5f57]"></div>
            <div className="w-3 h-3 rounded-full bg-[#febc2e]"></div>
            <div className="w-3 h-3 rounded-full bg-[#28c840]"></div>
            <span className="ml-3 text-xs text-gray-500 font-medium">CodeX Editor</span>
          </div>
          <VideoPlayer
            src="https://res.cloudinary.com/dnih6mdkd/video/upload/v1744716480/editorMain_compressed_nbg8p4.mp4"
            fallbackImage="https://res.cloudinary.com/dnih6mdkd/image/upload/v1744920802/hero_vmklzl.png"
            className="w-full h-auto object-cover"
          />
        </div>
      </motion.div>
    </section>
  )
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
      description: "Convert your code into any language using AI within seconds.",
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
  ]

  return (
    <div
      id="features"
      className="py-32 scroll-mt-16 w-full max-w-6xl mx-auto"
    >
      <div className="text-center mb-20">
        <div className="inline-flex items-center px-3 py-1 mb-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium">
          FEATURES
        </div>
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
          Tools to Help You <span className="text-emerald-400">Code Better</span>
        </h2>
        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
          Built to make your coding workflow smoother and more productive.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <div
            key={index}
            className="p-8 rounded-xl bg-[#252525] border border-gray-800 transition-all hover:border-emerald-500/30"
          >
            <div className="flex items-center mb-4">
              <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-500 mr-4 flex-shrink-0">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold tracking-tight">{feature.title}</h3>
            </div>
            <p className="text-gray-400 mt-4 leading-relaxed">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function AIFeaturesSection() {
  return (
    <div id="ai-features" className="py-32 scroll-mt-16 w-full max-w-6xl mx-auto">
      <div className="text-center mb-20">
        <div className="inline-flex items-center px-3 py-1 mb-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium">
          AI-POWERED FEATURES
        </div>
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
          Supercharge Your Workflow with <span className="text-emerald-400">AI</span>
        </h2>
        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
          CodeX integrates powerful AI capabilities to make you more productive.
        </p>
      </div>

      <div className="space-y-40">
        <CodeConverterFeature />
        <AICodeAssistantFeature />
        <CodeSuggestionFeature />
      </div>
    </div>
  )
}

function CodeConverterFeature() {
  return (
    <motion.div
      className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6 }}
    >
      <div className="w-full lg:w-3/5 order-2 lg:order-1">
        <div className="relative overflow-hidden rounded-xl border border-gray-800 bg-[#1e1e1e] shadow-2xl">
          <div className="absolute top-0 left-0 right-0 h-12 bg-[#252525] flex items-center px-6 z-10 border-b border-gray-800">
            <div className="flex space-x-2">
              <div className="w-3 h-3 rounded-full bg-gray-600"></div>
              <div className="w-3 h-3 rounded-full bg-gray-600"></div>
              <div className="w-3 h-3 rounded-full bg-gray-600"></div>
            </div>
          </div>
          <div className="pt-12">
            <VideoPlayer
              src="https://res.cloudinary.com/dnih6mdkd/video/upload/v1744716374/codeConverterNewVideo664654656_tkk4cj.mp4"
              fallbackImage="https://res.cloudinary.com/dnih6mdkd/image/upload/v1744920802/converter_hp9ox2.png"
              className="w-full h-auto object-cover"
            />
          </div>
        </div>
      </div>

      <div className="w-full lg:w-2/5 order-1 lg:order-2">
        <div className="inline-flex items-center px-4 py-1.5 mb-6 rounded-full bg-[#252525] border border-gray-700 text-gray-300 text-sm font-medium">
          <Code2 size={16} className="mr-2 text-emerald-500" /> CODE CONVERTER
        </div>
        <h3 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-6">
          Translate Code Instantly
        </h3>
        <p className="text-lg text-gray-400 mb-10 leading-relaxed">
          Need your JavaScript in Python? PHP in Go? Our AI seamlessly translates your code
          between languages while preserving functionality.
        </p>

        <div className="space-y-8">
          <div className="flex items-start">
            <div className="p-3 rounded-lg bg-[#252525] border border-gray-800 text-emerald-500 mr-5 flex-shrink-0">
              <Zap size={20} />
            </div>
            <div>
              <h4 className="text-base font-semibold tracking-tight text-white/90">Lightning Fast</h4>
              <p className="text-gray-400 mt-1.5 leading-relaxed">Convert entire files or snippets in seconds</p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="p-3 rounded-lg bg-[#252525] border border-gray-800 text-emerald-500 mr-5 flex-shrink-0">
              <Languages size={20} />
            </div>
            <div>
              <h4 className="text-base font-semibold tracking-tight text-white/90">Multiple Language Support</h4>
              <p className="text-gray-400 mt-1.5 leading-relaxed">Wide array of modern supported languages</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function AICodeAssistantFeature() {
  return (
    <motion.div
      className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6 }}
    >
      <div className="w-full lg:w-2/5">
        <div className="inline-flex items-center px-4 py-1.5 mb-6 rounded-full bg-[#252525] border border-gray-700 text-gray-300 text-sm font-medium">
          <BrainCircuit size={16} className="mr-2 text-emerald-500" /> AI CODE ASSISTANT
        </div>
        <h3 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-6">Sidebar Intelligent Assistant</h3>
        <p className="text-lg text-gray-400 mb-10 leading-relaxed">
          Get help with bugs, optimizations, and code reviews from an AI assistant that understands your current file. Ask questions directly in the IDE.
        </p>

        <div className="space-y-8">
          <div className="flex items-start">
            <div className="p-3 rounded-lg bg-[#252525] border border-gray-800 text-emerald-500 mr-5 flex-shrink-0">
              <MessageSquareCode size={20} />
            </div>
            <div>
              <h4 className="text-base font-semibold tracking-tight text-white/90">Context-Aware</h4>
              <p className="text-gray-400 mt-1.5 leading-relaxed">Gets insights from your active file</p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="p-3 rounded-lg bg-[#252525] border border-gray-800 text-emerald-500 mr-5 flex-shrink-0">
              <Terminal size={20} />
            </div>
            <div>
              <h4 className="text-base font-semibold tracking-tight text-white/90">Natural Language Interface</h4>
              <p className="text-gray-400 mt-1.5 leading-relaxed">Request help in plain English alongside your code</p>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-3/5">
        <div className="relative overflow-hidden rounded-xl border border-gray-800 bg-[#1e1e1e] shadow-2xl">
          <div className="absolute top-0 left-0 right-0 h-12 bg-[#252525] flex items-center px-6 z-10 border-b border-gray-800">
            <div className="flex space-x-2">
              <div className="w-3 h-3 rounded-full bg-gray-600"></div>
              <div className="w-3 h-3 rounded-full bg-gray-600"></div>
              <div className="w-3 h-3 rounded-full bg-gray-600"></div>
            </div>
          </div>
          <div className="pt-12">
            <VideoPlayer
              src="https://res.cloudinary.com/dnih6mdkd/video/upload/v1744716110/AIassistant_esvuq9.mp4"
              fallbackImage="https://res.cloudinary.com/dnih6mdkd/image/upload/v1744920802/ai-assiant_cfeqp1.png"
              className="w-full h-auto aspect-video"
            />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function CodeSuggestionFeature() {
  return (
    <motion.div
      className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6 }}
    >
      <div className="w-full lg:w-3/5 order-2 lg:order-1">
        <div className="relative overflow-hidden rounded-xl border border-gray-800 bg-[#1e1e1e] shadow-2xl">
          <div className="absolute top-0 left-0 right-0 h-12 bg-[#252525] flex items-center px-6 z-10 border-b border-gray-800">
            <div className="flex space-x-2">
              <div className="w-3 h-3 rounded-full bg-gray-600"></div>
              <div className="w-3 h-3 rounded-full bg-gray-600"></div>
              <div className="w-3 h-3 rounded-full bg-gray-600"></div>
            </div>
          </div>
          <div className="pt-12">
            <VideoPlayer
              src="https://res.cloudinary.com/dnih6mdkd/video/upload/v1744716284/aiSuggestion_tm1lrq.mp4"
              fallbackImage="https://res.cloudinary.com/dnih6mdkd/image/upload/v1744920803/suggestion_olhkce.png"
              className="w-full h-auto aspect-video object-cover"
            />
          </div>
        </div>
      </div>

      <div className="w-full lg:w-2/5 order-1 lg:order-2">
        <div className="inline-flex items-center px-4 py-1.5 mb-6 rounded-full bg-[#252525] border border-gray-700 text-gray-300 text-sm font-medium">
          <Sparkles size={16} className="mr-2 text-emerald-500" /> CODE SUGGESTIONS
        </div>
        <h3 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-6">
          Smart Completion Within The Editor
        </h3>
        <p className="text-lg text-gray-400 mb-10 leading-relaxed">
          Get intelligent code suggestions as you type. Our AI analyzes your current file to suggest relevant
          methods and code blocks that fit your specific context.
        </p>

        <div className="space-y-8">
          <div className="flex items-start">
            <div className="p-3 rounded-lg bg-[#252525] border border-gray-800 text-emerald-500 mr-5 flex-shrink-0">
              <Lightbulb size={20} />
            </div>
            <div>
              <h4 className="text-base font-semibold tracking-tight text-white/90">Context-Aware</h4>
              <p className="text-gray-400 mt-1.5 leading-relaxed">Gets smarter the more you code</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function CTASection() {
  const router = useRouter()
  return (
    <section id="cta" className="w-full py-40 border-t border-gray-800/50 mt-20">
      <div className="max-w-3xl mx-auto flex flex-col items-center text-center">
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-8">
          Ready to start <span className="text-emerald-400">coding?</span>
        </h2>

        <p className="text-xl text-gray-400 mb-14 max-w-2xl font-normal leading-relaxed">
          CodeX provides lightning fast compilation, rich native environment tooling, and intelligent code assistants out of the box.
        </p>

        <Button
          onClick={() => router.push("/editor")}
          className="px-10 h-14 bg-emerald-600 hover:bg-emerald-500 text-base font-medium transition-colors text-white rounded-lg shadow-xl shadow-emerald-500/10"
        >
          Try CodeX
        </Button>
      </div>
    </section>
  )
}

export default Home
