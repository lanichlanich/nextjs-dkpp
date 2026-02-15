import prisma from "./prisma";

export interface NewsItem {
    id: string;
    title: string;
    excerpt: string;
    content: string;
    date: string;
    image: string;
    status: string;
}

export async function getNews(): Promise<NewsItem[]> {
    try {
        return await prisma.news.findMany({
            orderBy: { date: 'desc' }
        }) as NewsItem[];
    } catch (error) {
        console.error("Error reading news data:", error);
        return [];
    }
}

export async function getNewsById(id: string): Promise<NewsItem | undefined> {
    try {
        const item = await prisma.news.findUnique({
            where: { id }
        });
        return item as NewsItem | undefined;
    } catch (error) {
        console.error("Error getting news by id:", error);
        return undefined;
    }
}

export async function createNews(item: Omit<NewsItem, "id">): Promise<NewsItem> {
    return await prisma.news.create({
        data: item
    }) as NewsItem;
}

export async function updateNews(id: string, updates: Partial<Omit<NewsItem, "id">>): Promise<NewsItem | null> {
    try {
        return await prisma.news.update({
            where: { id },
            data: updates
        }) as NewsItem;
    } catch (error) {
        console.error("Error updating news:", error);
        return null;
    }
}

export async function deleteNews(id: string): Promise<boolean> {
    try {
        await prisma.news.delete({
            where: { id }
        });
        return true;
    } catch (error) {
        console.error("Error deleting news:", error);
        return false;
    }
}
