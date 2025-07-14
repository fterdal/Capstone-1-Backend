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
        userkey: "user1",

      },
      {
        key: "movie",
        title: "Best Movie?",
        description: "Rank your favorite movies!",
        participants: 0,
        status: "published",
        userKey: "user2",
      },
      {
        key: "bbq",
        title: "Best BBQ Item?",
        description: "Rank your favorite BBQ food!",
        status: "published",
        userKey: "user1"
      },
      {
        key: "authRequired",
        title: "authRequired true",
        description: "?",
        participants: 0,
        status: "published",
        authRequired: true,
        userKey: "user2"

      },
      {
        key: "restricited",
        title: "restricted true",
        description: "Rank your favorite anime of all time!",
        participants: 0,
        status: "published",
        restricted: true,
        userKey: "user1"

      },
    ];

    const createdPolls = {};
    const deadline = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

    const userMap = {
      admin: users[0],
      user1: users[1],
      user2: users[2],
    };

    for (const poll of pollData) {
      const created = await Poll.create({
        ...poll,
        deadline,
        user_id: userMap[poll.userKey].id,
      })
      createdPolls[poll.key] = created;
      console.log(createdPolls.anime.id)
    };



    const PollOptions = await PollOption.bulkCreate([
      {
        optionText: "Demon Slayer",
        position: 1,
        poll_id: createdPolls.anime.id,
      },
      {
        optionText: "One Piece",
        position: 2,
        poll_id: createdPolls.anime.id,
      },
      {
        optionText: "AOT",
        position: 3,
        poll_id: createdPolls.anime.id,
      },
      {
        optionText: "Naruto",
        position: 4,
        poll_id: createdPolls.anime.id,
      },
      {
        optionText: "Devil May Cry",
        position: 5,
        poll_id: createdPolls.anime.id,
      },
      {
        optionText: "Castlevania",
        position: 6,
        poll_id: createdPolls.anime.id,
      },
      {
        optionText: "Die Hard",
        poll_id: createdPolls.movie.id
      },
      {
        optionText: "Die Hard 2",
        poll_id: createdPolls.movie.id,
      },
      {
        optionText: "Twilight",
        poll_id: createdPolls.movie.id,
      },
      {
        optionText: "Spiderverse",
        poll_id: createdPolls.movie.id,
      },
      {
        optionText: "Pork Ribs",
        poll_id: createdPolls.bbq.id,
      },
      {
        optionText: "Hot Dog",
        poll_id: createdPolls.bbq.id,
      },
      {
        optionText: "Cheeseburger",
        poll_id: createdPolls.bbq.id,
      },
      {
        optionText: "Suasage",
        poll_id: createdPolls.bbq.id,
      },
      {
        optionText: "a",
        poll_id: createdPolls.authRequired.id,
      },
      {
        optionText: "b",
        poll_id: createdPolls.authRequired.id,
      },
      {
        optionText: "c",
        poll_id: createdPolls.authRequired.id,
      },
      {
        optionText: "d",
        poll_id: createdPolls.authRequired.id,
      },
      {
        optionText: "1",
        poll_id: createdPolls.restricited.id,
      },
      {
        optionText: "2",
        poll_id: createdPolls.restricited.id,
      },
      {
        optionText: "3",
        poll_id: createdPolls.restricited.id,

      },
      {
        optionText: "4",
        poll_id: createdPolls.restricited.id,

      },

    ])

    console.log(`👤 Created ${users.length} users`);
    console.log(`Created ${createdPolls.length} polls`)

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
