import Image from "next/image";
import { LucideIcon } from "lucide-react";
import { MotionWrapper } from "./MotionWrapper";

interface ServiceCardProps {
    title: string;
    description: string;
    icon?: LucideIcon;
    image?: string;
    delay?: number;
}

export function ServiceCard({ title, description, icon: Icon, image, delay = 0 }: ServiceCardProps) {
    return (
        <MotionWrapper direction="up" delay={delay}>
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 hover-lift h-full flex flex-col group transition-soft">
                <div className="relative h-48 w-full overflow-hidden">
                    {image ? (
                        <Image
                            src={image}
                            alt={title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                    ) : Icon ? (
                        <div className="w-full h-full bg-green-50 flex items-center justify-center">
                            <Icon className="w-12 h-12 text-green-600" />
                        </div>
                    ) : null}
                    {/* Overlay for text legibility if needed, but here we place text below */}
                </div>
                <div className="p-6 flex flex-col flex-grow text-center items-center">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-green-600 transition-colors uppercase tracking-tight">{title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
                </div>
            </div>
        </MotionWrapper>
    );
}
