import { Pizza } from "lucide-react"
import { SummaryViewer } from "../summaries/summary-viewer"
import { MotionH3 } from "../common/motion-wrapper";
import { MotionDiv } from "../common/motion-wrapper";

const DEMO_SUMMARY = `# Quick Overview
OS Demystified: Your Guide to How Computers Really Work! 🧠💻
- ✨ This document breaks down the fundamental concepts of Operating Systems, from their core functions to advanced memory management and scheduling.
- 📌 It's your essential guide to understanding the invisible brain behind your computer's operations.

# 📘 Document Details
- 📂 Type: Technical Primer / Educational Guide
- 👥 For: Tech Enthusiasts, Computer Science Students, Curious Users

# 🔍 Key Highlights
- ⭐ The OS manages all computer resources, hiding complexity and providing a user-friendly environment.
- 🚀 Different OS types (batch, multitasking, real-time, distributed) cater to diverse computing needs.
- 📈 Key components like the Kernel, User Space, and System Calls enable seamless interaction between hardware and applications.

# 🌍 Why It Matters
- 🌍 An Operating System is the invisible conductor that orchestrates every task on your computer, from launching apps to managing memory and ensuring data security. It's the critical layer that makes complex hardware usable and efficient, preventing chaos and enabling the smooth, concurrent execution of multiple programs. Without a robust OS, software would be cumbersome, and computing as we know it would be impossible.

# 📌 Main Points
- 💡 The OS acts as a resource manager and an interface between the user and hardware, abstracting underlying complexities.
- 🛠️ Modern OS designs leverage concepts like multi-threading, virtual memory, and sophisticated scheduling to maximize performance and responsiveness.
- 📊 Efficient memory management techniques like paging and segmentation are crucial for running large applications and preventing fragmentation.

# 🔧 Pro Tips
- ✅ Understand the distinction between processes and threads to grasp how modern applications achieve parallelism and responsiveness.
- 🧩 Recognize critical sections and synchronization issues (like race conditions and deadlocks) to design robust, error-free multi-threaded programs.
- 🏁 Leverage the concept of virtual memory; it allows your computer to run programs larger than its physical RAM by intelligently using secondary storage.

# 📚 Key Terms to Know
- 📝 Kernel: The core part of the OS that directly interacts
`

export default function DemoSection() {
    return (
      <section className="relative">
            <div className="py-12 lg:py-24 max-w-5xl mx-auto
            px-4 sm:px-6 lg:px-8 lg:pt-12">
            <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 -top-40
            -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-30"
            >
            <div
              style={{
                clipPath:
                    'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
              }}
              className="relative left-[calc(50%-11rem)] aspect-1155/678
              w-[36.125rem] -translate-x-1/2 rotate-[30deg]
              bg-linear-to-br from-emerald-500 via-teal-500 to-cyan-500 
              opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72rem]"
              />
            </div>
            <div className="flex flex-col items-center text-center
            space-y-4">
                <div className="inline-flex items-center justify-center p-2
                rounded-2xl bg-gray-100/80 backdrop-blur-xs border
                border-gray-500/20 mb-4">
                <Pizza className="w-6 h-6 text-rose-500" />
                </div>
                <div className="text-center mb-16">
                <MotionH3 initial={{y:20, opacity: 0}}
                transition={{duration: 0.5, delay: 0.2}}
                whileInView={{y: 0, opacity: 1}}
                className="font-bold text-3xl max-w-2xl mx-auto px-4
                sm:px-6">
                    Watch how Sommaire transforms <span className="bg-linear-to-r from-rose-500
                    to-rose-700 bg-clip-text text-transparent"> this OS Course PDF </span> 
                        into an easy-to-read summary!
                </MotionH3>
                </div>
               </div>
              <div className="flex justify-center items-center px-2
              sm:px-4 lg:px-6">
                {/** Summary Viewer **/}
                <MotionDiv initial={{opacity: 0}}
                whileInView={{opacity: 1}}
                transition={{duration: 0.5}}
                >
                <SummaryViewer summary={DEMO_SUMMARY}/>
                </MotionDiv>
              </div>
        </div>
    </section>
    );
}