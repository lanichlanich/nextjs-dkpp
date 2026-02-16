"use client";

import { Share2, Link as LinkIcon, Facebook, Twitter, Mail } from "lucide-react";
import { useState } from "react";
import Swal from "sweetalert2";

interface SocialShareProps {
    title: string;
    url: string;
}

export function SocialShare({ title, url }: SocialShareProps) {
    const [copied, setCopied] = useState(false);

    const fullUrl = typeof window !== "undefined" ? window.location.origin + url : "";
    const encodedUrl = encodeURIComponent(fullUrl);
    const encodedTitle = encodeURIComponent(title);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(fullUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);

        Swal.fire({
            title: "Tautan Disalin!",
            text: "Tautan berita telah disalin ke papan klip.",
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
            toast: true,
            position: "top-end",
        });
    };

    const shareLinks = [
        {
            name: "WhatsApp",
            icon: <Share2 className="w-5 h-5" />,
            url: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
            color: "bg-green-500 hover:bg-green-600",
        },
        {
            name: "Facebook",
            icon: <Facebook className="w-5 h-5" />,
            url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
            color: "bg-blue-600 hover:bg-blue-700",
        },
        {
            name: "Twitter",
            icon: <Twitter className="w-5 h-5" />,
            url: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
            color: "bg-sky-500 hover:bg-sky-600",
        },
        {
            name: "Email",
            icon: <Mail className="w-5 h-5" />,
            url: `mailto:?subject=${encodedTitle}&body=${encodedUrl}`,
            color: "bg-gray-600 hover:bg-gray-700",
        },
    ];

    return (
        <div className="flex flex-wrap items-center gap-3 py-6 border-t border-b border-gray-100 my-8">
            <span className="text-sm font-bold text-gray-500 uppercase tracking-wider mr-2">Bagikan:</span>

            {shareLinks.map((link) => (
                <a
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center justify-center w-10 h-10 rounded-full text-white transition-all transform hover:scale-110 shadow-sm ${link.color}`}
                    title={`Bagikan ke ${link.name}`}
                >
                    {link.icon}
                </a>
            ))}

            <button
                onClick={copyToClipboard}
                className={`flex items-center justify-center w-10 h-10 rounded-full transition-all transform hover:scale-110 shadow-sm ${copied ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                title="Salin Tautan"
            >
                <LinkIcon className="w-5 h-5" />
            </button>
        </div>
    );
}
