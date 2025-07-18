const { Pool } = require("pg");
const db = require("./db");
const { User, Poll, PollOption, Vote, VotingRank } = require("./index");

const seed = async () => {
  try {
    db.logging = false;
    await db.sync({ force: true }); // Drop and recreate tables

    const users = await User.bulkCreate([
      {
        username: "admin",
        passwordHash: User.hashPassword("admin123"),
      },
      {
        username: "user1",
        passwordHash: User.hashPassword("user111")
      },
      {
        username: "user2",
        passwordHash: User.hashPassword("user222")
      },
    ]);

    // deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),

    const pollData = [
      {
        key: "anime",
        title: "Best Anime?",
        description: "Rank your favorite animes!",
        participants: 0,
        status: "draft",
        userKey: "user1",

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
    const deadline = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3days

    const userMap = {
      admin: users[0],
      user1: users[1],
      user2: users[2],
    };

    for (const poll of pollData) {
      const created = await Poll.create({
        ...poll,
        deadline,
        userId: userMap[poll.userKey].id,
      })
      createdPolls[poll.key] = created;
      // console.log(createdPolls.anime.id)
    };



    const PollOptions = await PollOption.bulkCreate([
      {
        optionText: "Demon Slayer",
        position: 1,
        pollId: createdPolls.anime.id,
      },
      {
        optionText: "One Piece",
        position: 2,
        pollId: createdPolls.anime.id,
      },
      {
        optionText: "AOT",
        position: 3,
        pollId: createdPolls.anime.id,
      },
      {
        optionText: "Naruto",
        position: 4,
        pollId: createdPolls.anime.id,
      },
      {
        optionText: "Devil May Cry",
        position: 5,
        pollId: createdPolls.anime.id,
      },
      {
        optionText: "Castlevania",
        position: 6,
        pollId: createdPolls.anime.id,
      },
      {
        optionText: "Die Hard",
        pollId: createdPolls.movie.id
      },
      {
        optionText: "Die Hard 2",
        pollId: createdPolls.movie.id,
      },
      {
        optionText: "Twilight",
        pollId: createdPolls.movie.id,
      },
      {
        optionText: "Spiderverse",
        pollId: createdPolls.movie.id,
      },
      {
        optionText: "Pork Ribs",
        pollId: createdPolls.bbq.id,
      },
      {
        optionText: "Hot Dog",
        pollId: createdPolls.bbq.id,
      },
      {
        optionText: "Cheeseburger",
        pollId: createdPolls.bbq.id,
      },
      {
        optionText: "Suasage",
        pollId: createdPolls.bbq.id,
      },
      {
        optionText: "a",
        pollId: createdPolls.authRequired.id,
      },
      {
        optionText: "b",
        pollId: createdPolls.authRequired.id,
      },
      {
        optionText: "c",
        pollId: createdPolls.authRequired.id,
      },
      {
        optionText: "d",
        pollId: createdPolls.authRequired.id,
      },
      {
        optionText: "1",
        pollId: createdPolls.restricited.id,
      },
      {
        optionText: "2",
        pollId: createdPolls.restricited.id,
      },
      {
        optionText: "3",
        pollId: createdPolls.restricited.id,

      },
      {
        optionText: "4",
        pollId: createdPolls.restricited.id,

      },

    ]);


    // vote ---> envelope
    const votes = await Vote.bulkCreate([
      {
        userId: users[1].id,
        pollId: createdPolls.anime.id
      },
      {
        userId: users[2].id,
        pollId: createdPolls.movie.id
      },
      {
        userId: users[1].id,
        pollId: createdPolls.bbq.id
      },
      {
        userId: users[2].id,
        pollId: createdPolls.authRequired.id
      },
      {
        userId: users[1].id,
        pollId: createdPolls.restricited.id
      },
    ])


    const optionMap = {};
    PollOptions.forEach((option) => {
      optionMap[option.optionText] = option;
    });

    const ranks = await VotingRank.bulkCreate([
      {
        voteId: votes[0].id,
        pollOptionId: optionMap["Demon Slayer"].id,
        rank: 1,
      },
      {
        voteId: votes[0].id,
        pollOptionId: optionMap["One Piece"].id,
        rank: 3,
      },
      {
        voteId: votes[0].id,
        pollOptionId: optionMap["AOT"].id,
        rank: 4,
      },
      {
        voteId: votes[0].id,
        pollOptionId: optionMap["Devil May Cry"].id,
        rank: 6
      },
      {
        voteId: votes[0].id,
        pollOptionId: optionMap["Castlevania"].id,
        rank: 5
      },
      {
        voteId: votes[0].id,
        pollOptionId: optionMap["Naruto"].id,
        rank: 2
      },
    ]);



    console.log(`👤 Created ${users.length} users`);
    console.log(`Created ${Object.keys(createdPolls).length} polls`);
    console.log(`🧾 Created ${PollOptions.length} poll options`);
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
