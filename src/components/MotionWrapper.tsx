"use client";

import { motion, HTMLMotionProps } from "framer-motion";

interface MotionWrapperProps extends HTMLMotionProps<"div"> {
    children: React.ReactNode;
    delay?: number;
    direction?: "up" | "down" | "left" | "right" | "none";
}

export function MotionWrapper({
    children,
    delay = 0,
    direction = "none",
    className,
    ...props
}: MotionWrapperProps) {
    const directions = {
        up: { y: 20 },
        down: { y: -20 },
        left: { x: 20 },
        right: { x: -20 },
        none: { x: 0, y: 0 }
    };

    return (
        <motion.div
            initial={{
                opacity: 0,
                ...directions[direction]
            }}
            whileInView={{
                opacity: 1,
                x: 0,
                y: 0
            }}
            viewport={{ once: true }}
            transition={{
                duration: 0.6,
                delay: delay,
                ease: [0.21, 0.47, 0.32, 0.98]
            }}
            className={className}
            {...props}
        >
            {children}
        </motion.div>
    );
}
