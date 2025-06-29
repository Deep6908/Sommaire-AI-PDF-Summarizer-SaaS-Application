import Link from "next/link";
import { cn } from "@/lib/utils";
import { motion, AnimationGeneratorType } from 'framer-motion';
import { CheckIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";
import { MotionDiv, MotionSection } from "../common/motion-wrapper";
import { containerVariants, itemVariants } from "@/utils/constants";
import BgGradient from "../common/bg_gradient";

type PriceType = {
    id: string;
    name: string;
    price: number;
    description: string;
    items: string[];
    paymentLink: string;
    priceId: string;
};

const listVariant = {
    hidden: { opacity: 0, x: -25},
    visible: { opacity: 1, x: 0, transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
         },
    },
};

const plans = [
    {
        name: 'Basic',
        price: 1,
        description: 'Perfect for occasional use',
        items: [
            '5 PDF summaries per month',
            'Standard processing speed',
            'Email support',
        ],
        id: 'basic',
        paymentLink: '',
        priceId: '',
    },
    {
        name: 'Pro',
        price: 10,
        description: 'For professionals and teams',
        items: [
            'Unlimited PDF summaries',
            'Priority processing',
            '24/7 priority support',
            'Markdown Export',
        ],
        id: 'pro',
        paymentLink: '',
        priceId: '',
    },
];

const PricingCard = ({ name, price, description, items, id, paymentLink }: PriceType) => {
    return (
    <MotionDiv 
    variants={listVariant}
    whileHover={{scale: 1.02}}
    className="relative w-full max-w-lg hover:scale-105
    hover:transition-all duration-300">
        <div className={cn(
        "relative flex flex-col h-full gap-4 lg:gap-8 z-10 p-8 border-[1px] border-gray-500/20 rounded-2xl",
        id === 'pro' && 'border-rose-500 gap-5 border-2'
        )}>
        <MotionDiv 
        variants={listVariant}
        className="flex justify-between items-center gap-4">
            <div>
            <p className="text-lg lg:text-xl font-bold capitalize">{name}</p>
            <p className="text-base-content/80 mt-2">{description}</p>
            </div>    
        </MotionDiv>

        <MotionDiv 
        variants={listVariant}
        className="flex gap-2">
            <p className="text-5xl tracking-tight font-extrabold">$
                {price}</p>
                <div className="flex flex-col justify-end mb-[4px]">
                    <p className="text-xs uppercase font-semibold">USD</p>
                    <p className="text-xs">/month</p>
                </div>
        </MotionDiv>
        <MotionDiv 
        variants={listVariant}
        className="space-y-2.5 leading-relaxed text-base flex-1">
            {items.map((item,idx) => (
                <li key={idx} className="flex items-cente gap-2">
                    <CheckIcon size={18} />
                    <span>{item}</span>
                    </li>
            ))}
        </MotionDiv>
       <MotionDiv 
        variants={listVariant} 
        className="space-y-2 flex justify-center w-full">
            <Link href={paymentLink} className={cn("w-full rounded-full flex items-center justify-center gap-2 bg-linear-to-r from-rose-800 to-rose-500 hover:from-rose-500 hover:to-rose-800 text-white border-2 py-2", 
            id === 'pro' 
            ? 'border-rose-900' 
            : 'border-rose-100 from-rose-400 to-rose-500'
            )}
            >Buy Now <ArrowRight size={18}/>
            </Link>
        </MotionDiv>
         </div>
    </MotionDiv>
    );
};

export default function PricingSection() {
    return (
        <MotionSection 
        variants={containerVariants}
        initial='hidden'
        whileInView='visible'
        viewport={{once: true, margin: '-100px'}}
        className="relative overflow-hidden" 
        id="pricing">

            <div className="py-12 lg:py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 lg:pt-12">
                <MotionDiv 
                variants={itemVariants}
                className="flex items-center justify-center w-full">
                    <h2 className="uppercase font-bold text-xl mb-8 text-rose-500">Pricing</h2>
                </MotionDiv>
                <div className="relative flex justify-center flex-col lg:flex-row items-center lg:items-stretch gap-8">
                    {plans.map((plan) => (
                        <PricingCard key={plan.id} {...plan} />
                    ))}
                </div>
            </div>
        </MotionSection>
    );
}