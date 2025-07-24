const { Pool } = require("pg");
const db = require("./db");
const { User, Poll, PollOption, Vote, VotingRank } = require("./index");

const seed = async () => {
  try {
    db.logging = false;
    await db.sync({ force: true }); // Drop and recreate tables

    const users = await User.bulkCreate([
      {
        username: "Tran",
        passwordHash: User.hashPassword("tran123"),
        email: "tran@example.com",
        displayName: "Tran Vo",
        firstName: "Tran",
        lastName: "Vo",
        img: "https://cdn2.thecatapi.com/images/MTY3ODIyMQ.jpg",
        isAdmin: true,
        isDisable: false
      },
      {
        username: "Flo",
        passwordHash: User.hashPassword("flo123"),
        email: "flo@example.com",
        displayName: "Florencio Rendon",
        firstName: "Florencio",
        lastName: "Rendon",
        img: "https://cdn2.thecatapi.com/images/MTY3ODIyMg.jpg",
        isAdmin: false,
        isDisable: false
      },
      {
        username: "Olivia",
        passwordHash: User.hashPassword("olivia123"),
        email: "olivia@example.com",
        displayName: "Olivia Wilson-Simmonds",
        firstName: "Olivia",
        lastName: "Wilson-Simmonds",
        img: "https://cdn2.thecatapi.com/images/MTY3ODIyMw.jpg",
        isAdmin: false,
        isDisable: false
      },
      {
        username: "Hai",
        passwordHash: User.hashPassword("hai123"),
        email: "hai@example.com",
        displayName: "Hailia Sommerville",
        firstName: "Hailia",
        lastName: "Sommerville",
        img: "https://cdn2.thecatapi.com/images/MTY3ODIyNA.jpg",
        isAdmin: false,
        isDisable: false
      }
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
      Tran: users[0],
      Flo: users[1],
      Olivia: users[2],
      Hai: users[3],
    };

    for (const poll of pollData) {
      const created = await Poll.create({
        ...poll,
        deadline,
        userId: userMap[poll.userKey].id,
      })
      createdPolls[poll.key] = created;
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
    // const votes = await Vote.bulkCreate([
    //   {
    //     userId: users[1].id,
    //     pollId: createdPolls.anime.id
    //   },
    //   {
    //     userId: users[2].id,
    //     pollId: createdPolls.movie.id
    //   },
    //   {
    //     userId: users[1].id,
    //     pollId: createdPolls.bbq.id
    //   },
    //   {
    //     userId: users[2].id,
    //     pollId: createdPolls.authRequired.id
    //   },
    //   {
    //     userId: users[1].id,
    //     pollId: createdPolls.restricited.id
    //   },
    // ])


    // const optionMap = {};
    // PollOptions.forEach((option) => {
    //   optionMap[option.optionText] = option;
    // });

    // const ranks = await VotingRank.bulkCreate([
    //   {
    //     voteId: votes[0].id,
    //     pollOptionId: optionMap["Demon Slayer"].id,
    //     rank: 1,
    //   },
    //   {
    //     voteId: votes[0].id,
    //     pollOptionId: optionMap["One Piece"].id,
    //     rank: 3,
    //   },
    //   {
    //     voteId: votes[0].id,
    //     pollOptionId: optionMap["AOT"].id,
    //     rank: 4,
    //   },
    //   {
    //     voteId: votes[0].id,
    //     pollOptionId: optionMap["Devil May Cry"].id,
    //     rank: 6
    //   },
    //   {
    //     voteId: votes[0].id,
    //     pollOptionId: optionMap["Castlevania"].id,
    //     rank: 5
    //   },
    //   {
    //     voteId: votes[0].id,
    //     pollOptionId: optionMap["Naruto"].id,
    //     rank: 2
    //   },
    // ]);



    console.log(`👤 Created ${users.length} users`);
    users.forEach(u => {
      console.log(`- ${u.username}: id=${u.id}, email=${u.email}, displayName=${u.displayName}, isAdmin=${u.isAdmin}, isDisable=${u.isDisable}`);
    });
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
