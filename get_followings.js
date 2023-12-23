const axios = require('axios');
const dfd = require('danfojs-node');
const fs = require('fs');

const getFollowing = async () => {
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

  try {
    const processResponse = (response) => {
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
    };

    const fetchMoreUsers = async () => {
      const continuationParams = { "user_id": user_id, "continuation_token": continuation_token, "limit": "20" };

      const response = await axios.get(url_continuation, { headers, params: continuationParams });
      processResponse(response);

      const old_token = continuation_token;
      if ('continuation_token' in response.data) {
        continuation_token = response.data['continuation_token'];
      } else {
        continuation_token = "";
        console.log("continuation_token not present, breaking out of the loop");
      }

      if (old_token === continuation_token) {
        console.log("search exhausted, same token repeating");
        return;
      }

      await fetchMoreUsers();
    };

    const initialResponse = await axios.get(url, { headers, params });
    processResponse(initialResponse);

    await fetchMoreUsers();

    // Assuming `all_users` is an array of user objects

    // Create a DataFrame from the array of users
    // const usersDf = new dfd.DataFrame(all_users);

    // // Convert the DataFrame to a JSON object
    // dfd.toJSON(usersDf, { filePath: "./test_output_following.json" });

    // // Save the JSON data to a file
    // console.log("Data saved to test_output_following.json");
  } catch (error) {
    console.error(error);
  }

  return all_users;
};

// Call the function to start the process
module.exports = getFollowing;
