import 'dotenv/config';
import prisma from '../lib/prisma';
import * as fs from 'fs';
import * as path from 'path';

async function migrate() {
    const dataDir = path.join(process.cwd(), 'src/data');

    // Migrate Users
    const usersPath = path.join(dataDir, 'users.json');
    if (fs.existsSync(usersPath)) {
        const users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
        for (const user of users) {
            await prisma.user.upsert({
                where: { email: user.email },
                update: {
                    ...user,
                    createdAt: new Date(user.createdAt),
                },
                create: {
                    ...user,
                    createdAt: new Date(user.createdAt),
                },
            });
        }
        console.log('Migrated Users');
    }

    // Migrate News
    const newsPath = path.join(dataDir, 'news.json');
    if (fs.existsSync(newsPath)) {
        const news = JSON.parse(fs.readFileSync(newsPath, 'utf8'));
        for (const item of news) {
            await prisma.news.upsert({
                where: { id: item.id },
                update: item,
                create: item,
            });
        }
        console.log('Migrated News');
    }

    // Migrate Profile
    const profilePath = path.join(dataDir, 'profile.json');
    if (fs.existsSync(profilePath)) {
        const profile = JSON.parse(fs.readFileSync(profilePath, 'utf8'));
        await prisma.profile.upsert({
            where: { id: 1 },
            update: profile,
            create: { id: 1, ...profile },
        });
        console.log('Migrated Profile');
    }

    // Migrate Settings
    const settingsPath = path.join(dataDir, 'settings.json');
    if (fs.existsSync(settingsPath)) {
        const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
        for (const role in settings) {
            await prisma.setting.upsert({
                where: { role: role },
                update: settings[role],
                create: { role: role, ...settings[role] },
            });
        }
        console.log('Migrated Settings');
    }
}

migrate()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
