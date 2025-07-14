const db = require("./db");
const { User } = require("./index");
const { Polls } = require("./index.js")

const seed = async () => {
  try {
    db.logging = false;
    await db.sync({ force: true }); // Drop and recreate tables

    const users = await User.bulkCreate([
      { username: "admin", passwordHash: User.hashPassword("admin123") },
      { username: "user1", passwordHash: User.hashPassword("user111") },
      { username: "user2", passwordHash: User.hashPassword("user222") },
    ]);

    const polls = await Polls.bulkCreate([
      {
        user_id: users[0].id,
        title: "What is your favorite programming language?",
        description: "Vote for the language you love the most!",
        isActive: true,
      },
      {
        user_id: users[1].id,
        title: "Do you prefer remote or inperson work?",
        description: "Let us settle this once and for all.",
        isActive: true,
      },
      {
        user_id: users[2].id,
        title: "Whats your favorite resturant?",
        description: "Vote yes or no for an offsite trip.",
        isActive: false,
      },
    ]);
   
    console.log(`👤 Created ${users.length} users and ${polls.length}`);

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
