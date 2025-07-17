const db = require("./db");
const { User, Poll, PollOption } = require("./index");

const seed = async () => {
  try {
    db.logging = false;
    await db.sync({ force: true });

    const users = await User.bulkCreate([
      { username: "admin", passwordHash: User.hashPassword("admin123") },
      { username: "user1", passwordHash: User.hashPassword("user111") },
      { username: "user2", passwordHash: User.hashPassword("user222") },
      { username: "pollmaster", passwordHash: User.hashPassword("polls123") },
    ]);

    console.log(`👤 Created ${users.length} users`);

    const now = new Date();
    const polls = await Poll.bulkCreate([
      {
        title: "What's your favorite programming language?",
        description: "Let us know what your fav language is",
        creator_id: users[0].id,
        status: "published",
        endAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        allowAnonymous: true,
        publishedAt: now,
      },
      {
        title: "Best time for team meetings?",
        description: "Lets find a time that works for everyone",
        creator_id: users[1].id, 
        status: "published",
        endAt: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), 
        allowAnonymous: false,
        publishedAt: now,
      },
      {
        title: "Weekend activity preferences",
        description: "What should we do this weekend?",
        creator_id: users[2].id, 
        status: "published",
        endAt: new Date(now.getTime() + 2 * 60 * 60 * 1000), 
        allowAnonymous: true,
        publishedAt: now,
      },
      {
        title: "Office lunch options",
        description: "Vote for next weeks catered lunch",
        creator_id: users[3].id, 
        status: "published",
        endAt: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
        allowAnonymous: false,
        publishedAt: now,
      },
      {
        title: "Project deadline preference",
        description: "When should we target the release?",
        creator_id: users[0].id, 
        status: "published",
        endAt: new Date(now.getTime() + 24 * 60 * 60 * 1000),
        allowAnonymous: false,
        publishedAt: now,
      },
      {
        title: "Ended Poll Example",
        description: "This poll has already ended",
        creator_id: users[1].id, 
        status: "closed",
        endAt: new Date(now.getTime() - 24 * 60 * 60 * 1000), 
        allowAnonymous: true,
        publishedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      },
    ]);

    console.log(`📊 Created ${polls.length} polls`);

    const pollOptions = await PollOption.bulkCreate([
      // Options for "What's your favorite programming language?"
      { text: "JavaScript", position: 1, poll_id: polls[0].id },
      { text: "Python", position: 2, poll_id: polls[0].id },
      { text: "Java", position: 3, poll_id: polls[0].id },
      { text: "C++", position: 4, poll_id: polls[0].id },
      
      // Options for "Best time for team meetings?"
      { text: "9:00 AM", position: 1, poll_id: polls[1].id },
      { text: "1:00 PM", position: 2, poll_id: polls[1].id },
      { text: "3:00 PM", position: 3, poll_id: polls[1].id },
      
      // Options for "Weekend activity preferences"
      { text: "Hiking", position: 1, poll_id: polls[2].id },
      { text: "Movie night", position: 2, poll_id: polls[2].id },
      { text: "Board games", position: 3, poll_id: polls[2].id },
      { text: "Cooking together", position: 4, poll_id: polls[2].id },
      
      // Options for "Office lunch options"
      { text: "Pizza", position: 1, poll_id: polls[3].id },
      { text: "Chinese food", position: 2, poll_id: polls[3].id },
      { text: "Sandwiches", position: 3, poll_id: polls[3].id },
      { text: "Mexican food", position: 4, poll_id: polls[3].id },
      
      // Options for "Project deadline preference"
      { text: "End of this month", position: 1, poll_id: polls[4].id },
      { text: "Next month", position: 2, poll_id: polls[4].id },
      { text: "In 6 weeks", position: 3, poll_id: polls[4].id },
      
      // Options for "Ended Poll Example"
      { text: "Option A", position: 1, poll_id: polls[5].id },
      { text: "Option B", position: 2, poll_id: polls[5].id },
      { text: "Option C", position: 3, poll_id: polls[5].id },
    ]);

    console.log(`📝 Created ${pollOptions.length} poll options`);

    console.log("🌱 Seeded the database successfully!");
    console.log("\n📊 Sample polls created:");
    polls.forEach((poll, index) => {
      const timeLeft = poll.endAt > now ? 
        `${Math.ceil((poll.endAt - now) / (1000 * 60 * 60 * 24))} days left` : 
        'Ended';
      console.log(`  ${index + 1}. "${poll.title}" - ${timeLeft}`);
    });

  } catch (error) {
    console.error("Error seeding database:", error);
    if (error.message.includes("does not exist")) {
      console.log("\n🤔🤔🤔 Have you created your database??? 🤔🤔🤔");
    }
  }
  db.close();
};

seed();