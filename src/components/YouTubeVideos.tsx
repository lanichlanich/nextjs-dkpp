import { MotionWrapper } from "./MotionWrapper";
import { Youtube, ExternalLink } from "lucide-react";

async function getYouTubeVideos() {
    try {
        const channelId = "UChQfH0_JETtHg_BrEYg1EuA";
        const response = await fetch(
            `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`,
            { next: { revalidate: 3600 } } // Revalidate every hour
        );

        if (!response.ok) return [];

        const xml = await response.text();

        // Simple regex parsing for the entry elements
        const entries = xml.match(/<entry>([\s\S]*?)<\/entry>/g) || [];

        return entries.slice(0, 4).map(entry => {
            const videoId = entry.match(/<yt:videoId>(.*?)<\/yt:videoId>/)?.[1];
            const title = entry.match(/<title>(.*?)<\/title>/)?.[1];

            return {
                id: videoId,
                title: title,
                url: `https://www.youtube.com/watch?v=${videoId}`,
                thumbnail: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`
            };
        });
    } catch (error) {
        console.error("Error fetching YouTube videos:", error);
        return [];
    }
}

export async function YouTubeVideos() {
    const videos = await getYouTubeVideos();

    if (videos.length === 0) return null;

    return (
        <section id="youtube" className="py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <MotionWrapper direction="down" className="text-center mb-16">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <Youtube className="w-8 h-8 text-red-600" />
                        <h2 className="text-3xl font-bold text-gray-900">Video Terbaru</h2>
                    </div>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Pantau kegiatan kami melalui kanal YouTube resmi DKPP Kabupaten Indramayu.
                    </p>
                </MotionWrapper>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {videos.map((video, index) => (
                        <MotionWrapper
                            key={video.id}
                            direction="up"
                            delay={index * 0.1}
                            className="group"
                        >
                            <a
                                href={video.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                            >
                                <div className="relative aspect-video overflow-hidden">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={video.thumbnail}
                                        alt={video.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-300 flex items-center justify-center">
                                        <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-50 group-hover:scale-100">
                                            <Youtube className="w-6 h-6 text-white" />
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 min-h-[40px] group-hover:text-red-600 transition-colors">
                                        {video.title}
                                    </h3>
                                    <div className="mt-3 flex items-center text-xs text-gray-500 font-medium">
                                        <span>Lihat di YouTube</span>
                                        <ExternalLink className="w-3 h-3 ml-1" />
                                    </div>
                                </div>
                            </a>
                        </MotionWrapper>
                    ))}
                </div>

                <MotionWrapper direction="up" delay={0.4} className="mt-12 text-center">
                    <a
                        href="https://www.youtube.com/@dkppindramayu"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-6 py-3 bg-red-600 text-white font-bold rounded-full hover:bg-red-700 transition-all shadow-lg hover:shadow-red-200"
                    >
                        <Youtube className="w-5 h-5 mr-2" />
                        Kunjungi Channel YouTube
                    </a>
                </MotionWrapper>
            </div>
        </section>
    );
}
