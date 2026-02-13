import fs from "fs/promises";
import path from "path";

export interface NewsItem {
    id: string;
    title: string;
    excerpt: string;
    content: string;
    date: string;
    image: string;
    status: "Draft" | "Published" | "Archived";
}

const dataFilePath = path.join(process.cwd(), "src/data/news.json");

export async function getNews(): Promise<NewsItem[]> {
    try {
        const data = await fs.readFile(dataFilePath, "utf8");
        return JSON.parse(data);
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code === "ENOENT") {
            // if file doesn't exist, return empty array
            return [];
        }
        console.error("Error reading news data:", error);
        return [];
    }
}

export async function getNewsById(id: string): Promise<NewsItem | undefined> {
    const news = await getNews();
    return news.find((item) => item.id === id);
}

export async function createNews(item: Omit<NewsItem, "id">): Promise<NewsItem> {
    const news = await getNews();
    const newItem: NewsItem = {
        ...item,
        id: Date.now().toString(), // Simple ID generation
    };
    news.push(newItem);
    await fs.writeFile(dataFilePath, JSON.stringify(news, null, 2));
    return newItem;
}

export async function updateNews(id: string, updates: Partial<Omit<NewsItem, "id">>): Promise<NewsItem | null> {
    const news = await getNews();
    const index = news.findIndex((item) => item.id === id);

    if (index === -1) return null;

    const updatedItem = { ...news[index], ...updates };
    news[index] = updatedItem;

    await fs.writeFile(dataFilePath, JSON.stringify(news, null, 2));
    return updatedItem;
}

export async function deleteNews(id: string): Promise<boolean> {
    const news = await getNews();
    const filteredNews = news.filter((item) => item.id !== id);

    if (news.length === filteredNews.length) return false;

    await fs.writeFile(dataFilePath, JSON.stringify(filteredNews, null, 2));
    return true;
}
