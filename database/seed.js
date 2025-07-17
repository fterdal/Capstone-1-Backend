const db = require("./db");
const { User, Polls, PollOption } = require("./index");

const seed = async () => {
  try {
    db.logging = false;
    await db.sync({ force: true }); // Drop and recreate tables

    // Create users
    const users = await User.bulkCreate([
      { username: "admin", passwordHash: User.hashPassword("admin123") },
      { username: "user1", passwordHash: User.hashPassword("user111") },
      { username: "user2", passwordHash: User.hashPassword("user222") },
    ]);

    // Create polls
    const polls = await Polls.bulkCreate([
      {
        user_id: users[0].id,
        title: "What is your favorite programming language?",
        description: "Vote for the language you love the most!",
        status: "published", // test view logic
        isActive: true,
      },
      {
        user_id: users[1].id,
        title: "Do you prefer remote or in-person work?",
        description: "Let us settle this once and for all.",
        isActive: true,
      },
      {
        user_id: users[2].id,
        title: "What's your favorite restaurant?",
        description: "Vote yes or no for an offsite trip.",
        isActive: false,
      },
    ]);

    // Options for the first poll
    await PollOption.bulkCreate([
      { text: "JavaScript", pollId: polls[0].id, votes: 3 },
      { text: "Python", pollId: polls[0].id, votes: 2 },
      { text: "C++", pollId: polls[0].id, votes: 1 },
    ]);

    console.log(`👤 Created ${users.length} users and ${polls.length} polls`);
    console.log("🌱 Seeded the database");
  } catch (error) {
    console.error("Error seeding database:", error);
    if (error.message.includes("does not exist")) {
      console.log("\n🤔🤔🤔 Have you created your database??? 🤔🤔🤔");
    }
  } finally {
    db.close();
  }
};

seed();
