const { Pool } = require("pg");
const db = require("./db");
const { User, Poll, PollOption } = require("./index");

const seed = async () => {
  try {
    db.logging = false;
    await db.sync({ force: true }); // Drop and recreate tables

    const users = await User.bulkCreate([
      { username: "admin", passwordHash: User.hashPassword("admin123") },
      { username: "user1", passwordHash: User.hashPassword("user111") },
      { username: "user2", passwordHash: User.hashPassword("user222") },
    ]);

    // deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),

    const pollData = [
      {
        key: "anime",
        title: "Best Anime?",
        description: "Rank your favorite animes!",
        participants: 0,
        status: "published",

      },
      {
        key: "movie",
        title: "Best Movie?",
        description: "Rank your favorite movies!",
        participants: 0,
        status: "published",
      },
      {
        key: "bbq",
        title: "Best BBQ Item?",
        description: "Rank your favorite BBQ food!",
        status: "published",
      },
      {
        key: "authRequired",
        title: "authRequired true",
        description: "?",
        participants: 0,
        status: "published",
        authRequired: true,
      },
      {
        key: "restricited",
        title: "restricted true",
        description: "Rank your favorite anime of all time!",
        participants: 0,
        status: "published",
        restricted: true,
      },
    ];

    const createdPoll = {};
    const deadline = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

    for (const poll of pollData) {
      const created = await Poll.create({
        ...poll,
        deadline,
        user_id: someUser_id,
      })
      createdPoll[poll.key] = created;
    }



    const PollOptions = await PollOption.bulkCreate([
      {
        optionText: "Demon Slayer",
        position: 1,
      },
      {
        optionText: "One Piece",
        position: 2,
      },
      {
        optionText: "AOT",
        position: 3,
      },
      {
        optionText: "Naruto",
        position: 4,
      },
      {
        optionText: "Devil May Cry",
        position: 5,
      },
      {
        optionText: "Castlevania",
        position: 6,
      },
      {
        optionText: ""
      },
      {
        optionText: "One Piece"
      },
      {
        optionText: "One Piece"
      },
      {
        optionText: "One Piece"
      },
      {
        optionText: "One Piece"
      },
      {
        optionText: "One Piece"
      },
      {
        optionText: "One Piece"
      },
      {
        optionText: "One Piece"
      },
      {
        optionText: "One Piece"
      },
      {
        optionText: "One Piece"
      },
      {
        optionText: "One Piece"
      },
      {
        optionText: "One Piece"
      },
      {
        optionText: "One Piece"
      },
      {
        optionText: "One Piece"
      },
      {
        optionText: "One Piece"
      },
      {
        optionText: "One Piece"
      },
      {
        optionText: "One Piece"
      },

    ])

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
