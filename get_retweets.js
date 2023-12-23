const axios = require('axios');
const dfd = require('danfojs-node');
const fs = require('fs');

const url = 'https://twitter154.p.rapidapi.com/tweet/retweets';
const urlContinuation = 'https://twitter154.p.rapidapi.com/tweet/retweets/continuation';

const headers = {
  'X-RapidAPI-Key': '6ec7934ea2msh8a8cb22698520c3p1f877djsn745040c35697',
  'X-RapidAPI-Host': 'twitter154.p.rapidapi.com'
};

const allRetweets = [];
let continuationToken = '';
const tweetId = '1349129669258448897';
const querystring = { tweet_id: tweetId, limit: '1000' };

const fetchData = async (url, queryString) => {
  try {
    const response = await axios.get(url, { headers, params: queryString });
    const jsonResponse = response.data;
    console.log('JSON Resp:' + JSON.stringify(jsonResponse));

    allRetweets.push(...jsonResponse['retweets']);

    console.log(jsonResponse['retweets'].length);
    console.log(allRetweets.length);

    if ('continuation_token' in jsonResponse) {
      continuationToken = jsonResponse['continuation_token'];
    } else {
      console.log('continuation_token not present');
    }

    return Promise.resolve(jsonResponse);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
};

const fetchAllRetweets = async () => {
  const initialResponse = await fetchData(url, querystring);

  while (continuationToken !== '') {
    const continuationQueryString = {
      tweet_id: tweetId,
      continuation_token: continuationToken,
      limit: '10'
    };

    try {
      const jsonResponse = await fetchData(urlContinuation, continuationQueryString);

      if ('retweets' in jsonResponse) {
        allRetweets.push(...jsonResponse['retweets']);
      }

      console.log(jsonResponse['retweets'].length);
      console.log(allRetweets);

      const oldToken = continuationToken;

      if ('continuation_token' in jsonResponse) {
        continuationToken = jsonResponse['continuation_token'];
      } else {
        continuationToken = '';
        console.log('continuation_token not present, breaking out of the loop');
      }

      if (oldToken === continuationToken) {
        console.log('search exhausted, same token repeating');
        break;
      }
    } catch (error) {
      console.error(error);
      break;
    }
  }
};

fetchAllRetweets().then(() => {
  // Assuming `all_retweets` is an array of retweet objects
  const retweetersDf = new dfd.DataFrame(allRetweets);

  // Convert the DataFrame to a JSON object
  dfd.toJSON(retweetersDf, { filePath: "./testOutput_retweets.json"});

  // Save the JSON data to a file
//   console.log(jsonData);
//   fs.writeFileSync('raga_amritkaal_tweet_retweeters_data.json', jsonData);
});
