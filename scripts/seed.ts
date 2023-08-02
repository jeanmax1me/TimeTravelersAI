const { PrismaClient } = require("@prisma/client");

const db = new PrismaClient({
    log: ['query'],
});

async function main() {
    try {
await db.category.createMany({
    data: [
        {name: 'Celebrities'},
        {name: 'Artists'},
        {name: 'Movies & TV'},
        {name: 'Scientists'},
        {name: 'Politicians'},
        {name: 'Philosophy'},
    ],
});
    } catch(error) {
        console.error("Error seeding default categories", error);
    } finally {
        await db.$disconnect();
    }
}

main();