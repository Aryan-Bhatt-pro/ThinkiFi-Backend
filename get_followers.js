const axios = require('axios');
const dfd = require('danfojs-node');
const fs = require('fs');

const url = "https://twitter154.p.rapidapi.com/user/followers";
const url_continuation = "https://twitter154.p.rapidapi.com/user/followers/continuation";

const headers = {
  "X-RapidAPI-Key": "6ec7934ea2msh8a8cb22698520c3p1f877djsn745040c35697",
  "X-RapidAPI-Host": "twitter154.p.rapidapi.com"
};

const zero_tweets_count_limit = 2;
let zero_tweet_counts = 0;
const all_users = [];
let continuation_token = "";

const user_id = '96479162';
const params = { "user_id": user_id, "limit": "20" };

axios.get(url, { headers, params })
  .then((response) => {
    const json_response = response.data;
    console.log(json_response['continuation_token']);

    all_users.push(...json_response['results']);

    console.log(json_response['results'].length);
    console.log(all_users.length);

    if ('continuation_token' in json_response) {
      continuation_token = json_response['continuation_token'];
    } else {
      console.log("continuation_token was not present");
    }

    if (json_response['results'].length === 0) {
      zero_tweet_counts += 1;
    }

    const fetchMoreUsers = () => {
      if (zero_tweet_counts >= zero_tweets_count_limit) {
        console.log("Not finding any tweets");
        return Promise.resolve();
      }

      const continuationParams = { "user_id": user_id, "continuation_token": continuation_token, "limit": "20" };

      return axios.get(url_continuation, { headers, params: continuationParams })
        .then((response) => {
          const json_response = response.data;
          console.log(json_response['continuation_token']);

          if ('results' in json_response) {
            all_users.push(...json_response['results']);
          }

          console.log(json_response['results'].length);
          console.log(all_users.length);

          if (json_response['results'].length === 0) {
            zero_tweet_counts += 1;
          }

          const old_token = continuation_token;
          if ('continuation_token' in json_response) {
            continuation_token = json_response['continuation_token'];
          } else {
            continuation_token = "";
            console.log("continuation_token not present, breaking out of the loop");
          }

          if (old_token === continuation_token) {
            console.log("search exhausted, same token repeating");
            return Promise.resolve();
          }

          return fetchMoreUsers();
        });
    };

    return fetchMoreUsers();
  })
  .then(() => {
    // Assuming `all_users` is an array of user objects

    // Create a DataFrame from the array of users
    const usersDf = new dfd.DataFrame(all_users);

    // Convert the DataFrame to a JSON object
    dfd.toJSON(usersDf, {filePath: "./testOutput_followers.json"});

    // Save the JSON data to a file
  })
  .catch((error) => {
    console.error(error);
  });
