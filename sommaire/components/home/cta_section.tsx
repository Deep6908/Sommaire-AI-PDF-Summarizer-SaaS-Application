import Link from "next/link";
import { Button } from "../ui/button";
import { ArrowRight } from "lucide-react";
import { MotionSection, MotionDiv, MotionH2, MotionP } from "../common/motion-wrapper";
import { itemVariants } from "@/utils/constants";
import { buttonVariants } from "./hero_section";
import BgGradient from "../common/bg_gradient";

export default function CTASection() {
    return (
        <MotionSection
        variants={itemVariants}
        initial='hidden'
        animate='visible'
        className="relative bg-gray-50 py-12">

            <div className="py-12 lg:py-24 max-w-5xl mx-auto px-4 sm:px-6 
            lg:px-8">
                <div className="flex flex-col items-center justify-center
                space-y-4 text-center">
                    <div className="space-y-2">
                        <MotionH2 
                        initial={{y:20, opacity: 0}}
                        transition={{duration: 0.5, delay: 0.2}}
                        whileInView={{y: 0, opacity: 1}}
                        className="text-3xl font-bold tracking-tighter
                        sm:text-4xl md:text-5xl">
                            Ready to Save Hours of Reading Time?
                        </MotionH2>
                        <MotionP 
                        initial={{y:20, opacity: 0}}
                        transition={{duration: 0.5, delay: 0.2}}
                        whileInView={{y: 0, opacity: 1}}
                        className="mx-auto max-w-[700px] text-gray-500 md:text-xl/relaxed
                        lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                            Transform lengthy documents into clear,
                            actionable insights with our AI-powered summarizer
                        </MotionP>
                    </div>
                    <div className="flex flex-col gap-2 min-[400px]:flex-row
                    justify-center">
                        <MotionDiv
                        variants={itemVariants} 
                        whileHover={{ scale: 1.05 }}
                        >
                            <Button 
                            size="lg"
                            variant={'link'} 
                            className="w-full min-[400px]
                            :w-auto bg-linear-to-r from-slate-900 to-rose-500
                            hover:from-rose-500 hover:to-slate-900 rounded-2xl font-bold shadow-lg
                            transition-all duration-300
                            flex items-center justify-center">

                            <Link href="/#pricing" 
                            className="flex items-center justify-center text-white">
                            Get Started{' '} 
                            <ArrowRight className="ml-2 h-2 w-4 animate-pulse"/>
                            </Link>
                            </Button>
                        </MotionDiv>
                    </div>
                </div>
            </div>
        </MotionSection>
    );
}