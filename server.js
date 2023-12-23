// server.js
const express = require("express");
const app = express();
const port = 5000;
const getTweets = require("./get_tweets");
const getReTweets = require("./get_retweets");
const getFollowing = require("./get_followings");
const getFollowers = require("./get_followers");
const dfd = require("danfojs-node");
// Middleware to parse JSON requests
app.use(express.json());

// Define your API endpoints and functions
app.get("/api/get_tweets", async (req, res) => {
  try {
    const tweets = await getTweets();
    console.log(tweets);
    const hashtagDf = new dfd.DataFrame(tweets);

    // Convert the DataFrame to a JSON object
     dfd.toJSON(hashtagDf, { filePath: "./testOutput_tweets.json" });

    res.status(200).send("Tweets processed successfully");
  } catch (error) {
    console.error("Error processing tweets:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/api/get_retweets", async (req, res) => {
  try {
    const retweets = await getReTweets();
    console.log(retweets);

    const hashtagDf = new dfd.DataFrame(retweets);
    dfd.toJSON(hashtagDf, { filePath: "./testOutput_retweets.json" });
    res.status(200).send("Tweets processed successfully");

  } catch (err) {
    console.error("Error processing tweets:", err);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/api/get_followings", async (req, res) => {
  try {
    const folllowings = await getFollowing();
    console.log(folllowings);
    const hashtagDf = new dfd.DataFrame(folllowings);
    dfd.toJSON(hashtagDf, { filePath: "./testOutput_followings.json" });
    res.status(200).send("Tweets processed successfully");

  } catch (err) {
    console.error("Error processing tweets:", err);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/api/get_followers", async (req, res) => {
  try {
    const followers = await getFollowers();
    console.log(followers);
    const hashtagDf = new dfd.DataFrame(followers);
    dfd.toJSON(hashtagDf, { filePath: "./testOutput_followers.json" });
    res.status(200).send("Tweets processed successfully");

  } catch (err) {
    console.error("Error processing tweets:", err);
    res.status(500).send("Internal Server Error");
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
