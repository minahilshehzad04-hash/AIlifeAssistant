'use client'

import { motion } from "framer-motion"
import { ArrowRight, Brain, CheckCircle, Calendar, Sparkles, Zap, MessageSquare } from "lucide-react"
import Link from "next/link"

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  }

  const itemVariants = {
    hidden: { y: 30, opacity: 0, filter: "blur(10px)" },
    visible: {
      y: 0,
      opacity: 1,
      filter: "blur(0px)",
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const },
    },
  }

  const floatVariants = {
    animate: {
      y: [0, -15, 0],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  }

  const features = [
    {
      icon: <CheckCircle className="w-5 h-5 text-emerald-400" />,
      title: "Task Mastery",
      description: "Intelligent prioritization to keep your day flowing smoothly.",
      color: "from-emerald-500/20 to-emerald-500/0",
    },
    {
      icon: <Brain className="w-5 h-5 text-purple-400" />,
      title: "RAG Memory",
      description: "A second brain that remembers every note and context.",
      color: "from-purple-500/20 to-purple-500/0",
    },
    {
      icon: <Calendar className="w-5 h-5 text-blue-400" />,
      title: "Daily Curation",
      description: "AI-generated morning briefs to set your intentions.",
      color: "from-blue-500/20 to-blue-500/0",
    },
    {
      icon: <MessageSquare className="w-5 h-5 text-pink-400" />,
      title: "Natural Chat",
      description: "Talk to your life admin as you would to a real assistant.",
      color: "from-pink-500/20 to-pink-500/0",
    },
  ]

  return (
    <div className="relative min-h-screen bg-[#05050a] text-slate-50 selection:bg-indigo-500/30 overflow-hidden font-sans">
      {/* Complex Ambient Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-indigo-600/20 blur-[150px] rounded-full mix-blend-screen animate-pulse duration-[10s]" />
        <div className="absolute top-[20%] -right-[20%] w-[60%] h-[60%] bg-purple-900/30 blur-[180px] rounded-full mix-blend-screen" />
        <div className="absolute -bottom-[20%] left-[20%] w-[50%] h-[50%] bg-blue-900/20 blur-[150px] rounded-full mix-blend-screen" />
        {/* Subtle noise overlay for texture */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
      </div>

      <main className="relative z-10 w-full max-w-7xl px-6 pt-32 pb-24 mx-auto">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="flex flex-col lg:flex-row items-center justify-between gap-16"
        >
          {/* Left Column: Copy */}
          <div className="flex-1 flex flex-col items-start text-left space-y-8 max-w-3xl">
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-[0_0_15px_rgba(255,255,255,0.05)]"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-medium text-slate-300 tracking-wide uppercase">Next-Gen Productivity</span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-6xl sm:text-7xl lg:text-8xl font-extrabold tracking-tighter leading-[1.1]"
            >
              <span className="text-white">Your Life,</span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                Orchestrated.
              </span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-xl text-slate-400 font-light leading-relaxed max-w-xl"
            >
              Offload your mental clutter to an AI that remembers everything, organizes your tasks, and helps you plan your days with absolute clarity.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-5 pt-4 w-full sm:w-auto"
            >
              <Link href="/login" className="w-full sm:w-auto">
                <button className="relative group w-full flex items-center justify-center space-x-2 bg-white text-black px-8 py-4 rounded-full font-semibold transition-all hover:scale-105 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-200 to-purple-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="relative z-10 flex items-center gap-2">
                    Start for free <ArrowRight className="w-4 h-4" />
                  </span>
                </button>
              </Link>
              <Link href="/dashboard" className="w-full sm:w-auto">
                <button className="w-full flex items-center justify-center space-x-2 bg-transparent border border-white/20 hover:bg-white/10 text-white px-8 py-4 rounded-full font-semibold transition-all hover:border-white/40 backdrop-blur-sm">
                  <span>Enter Dashboard</span>
                </button>
              </Link>
            </motion.div>
          </div>

          {/* Right Column: Abstract Visual/Mockup */}
          <motion.div 
            variants={itemVariants}
            className="flex-1 w-full relative hidden lg:flex justify-center"
          >
            <motion.div 
              variants={floatVariants}
              animate="animate"
              className="relative w-[450px] h-[550px] rounded-[2.5rem] bg-slate-900/40 border border-white/10 backdrop-blur-2xl shadow-2xl shadow-indigo-500/10 overflow-hidden p-6 flex flex-col gap-4"
            >
              {/* Fake UI Elements */}
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-400/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400/80" />
                </div>
                <div className="text-xs text-slate-500">AI Assistant</div>
              </div>
              
              <div className="flex flex-col gap-4 flex-1">
                <div className="self-end max-w-[80%] bg-indigo-500/20 text-indigo-100 text-sm p-3 rounded-2xl rounded-tr-sm border border-indigo-500/20">
                  Can you summarize my notes from yesterday?
                </div>
                <div className="self-start max-w-[90%] bg-white/5 text-slate-200 text-sm p-4 rounded-2xl rounded-tl-sm border border-white/5 shadow-inner">
                  <p className="mb-2"><Sparkles className="inline w-4 h-4 mr-1 text-indigo-400" /> Certainly. Yesterday you noted:</p>
                  <ul className="list-disc pl-4 space-y-1 text-slate-400">
                    <li>Finalize the Q3 marketing budget.</li>
                    <li>Call Sarah about the weekend trip.</li>
                    <li>Read chapter 4 of the new design book.</li>
                  </ul>
                </div>
                
                <div className="mt-auto bg-white/5 border border-white/10 rounded-xl p-4 flex justify-between items-center backdrop-blur-md">
                  <div className="text-slate-500 text-sm">Type your message...</div>
                  <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                    <ArrowRight className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* Floating glowing orb behind mockup */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/30 rounded-full blur-[80px] -z-10" />
          </motion.div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-32 w-full"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -8, scale: 1.02 }}
              className="relative group p-8 rounded-[2rem] bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.1] hover:bg-white/[0.04] transition-all duration-300 overflow-hidden"
            >
              {/* Subtle hover gradient inside card */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out`} />
              
              <div className="relative z-10 flex flex-col gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-slate-100 tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-slate-400 leading-relaxed text-sm">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </main>

      <footer className="relative z-10 w-full py-8 border-t border-white/5 mt-20 text-center">
        <p className="text-slate-600 text-sm tracking-wide">
          © 2026 AI Life Admin. Crafted with precision.
        </p>
      </footer>
    </div>
  )
}
