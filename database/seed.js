const db = require("./db");
const { User, Poll } = require("./index");

const seed = async () => {
  try {
    db.logging = false;
    await db.sync({ force: true }); // Drop and recreate tables

    const users = await User.bulkCreate([
      { username: "admin", passwordHash: User.hashPassword("admin123") },
      { username: "user1", passwordHash: User.hashPassword("user111") },
      { username: "user2", passwordHash: User.hashPassword("user222") },
    ]);

    const polls = await Poll.bulkCreate([
      {
        title: "Best Anime?",
        description: "Rank your favorite animes!",
        participants: 0,
        status: "published",
        deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      },
      {
        title: "Best Movie?",
        description: "Rank your favorite movies!",
        participants: 0,
        status: "published",
        deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), 
      },
      {
        title: "Best BBQ Item?",
        description: "Rank your favorite BBQ food!",
        status: "published",
        deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), 
      },
      {
        title: "authRequired true",
        description: "?",
        participants: 0,
        status: "published",
        deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), 
        authRequired: true,
      },
      {
        title: "restricted true",
        description: "Rank your favorite anime of all time!",
        participants: 0,
        status: "published",
        deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        restricted: true, 
      },
    ]);

    console.log(`👤 Created ${users.length} users`);
    console.log(`Created ${polls.length} polls`)

    // Create more seed data here once you've created your models
    // Seed files are a great way to test your database schema!

    console.log("🌱 Seeded the database");
  } catch (error) {
    console.error("Error seeding database:", error);
    if (error.message.includes("does not exist")) {
      console.log("\n🤔🤔🤔 Have you created your database??? 🤔🤔🤔");
    }
  }
  db.close();
};

seed();
