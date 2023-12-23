const axios = require('axios');
const dfd = require('danfojs-node');
const fs = require('fs');

const url = "https://twitter154.p.rapidapi.com/user/following";
const url_continuation = "https://twitter154.p.rapidapi.com/user/following/continuation";


const headers = {
  "X-RapidAPI-Key": "6ec7934ea2msh8a8cb22698520c3p1f877djsn745040c35697",
  "X-RapidAPI-Host": "twitter154.p.rapidapi.com"
};

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

    const fetchMoreUsers = () => {
      const continuationParams = { "user_id": user_id, "continuation_token": continuation_token, "limit": "20"};

      return axios.get(url_continuation, { headers, params: continuationParams })
        .then((response) => {
          const json_response = response.data;
          console.log(json_response['continuation_token']);

          if ('results' in json_response) {
            all_users.push(...json_response['results']);
          }

          console.log(json_response['results'].length);
          console.log(all_users.length);

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
    dfd.toJSON(usersDf, {filePath: "./test_output_following.json"});

    // Save the JSON data to a file
    // fs.writeFileSync("user_following_data.json", jsonData);

    console.log("Data saved to user_following_data.json");
  })
  .catch((error) => {
    console.error(error);
  });
