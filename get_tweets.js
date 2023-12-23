const axios = require('axios');
const dfd = require('danfojs-node');
const fs = require('fs');
const { format } = require('path');

async function searchByHashtag() {
  const url = 'https://twitter154.p.rapidapi.com/search/search';
  const urlContinuation = 'https://twitter154.p.rapidapi.com/search/search/continuation';
  const headers = {
    'X-RapidAPI-Key': '6ec7934ea2msh8a8cb22698520c3p1f877djsn745040c35697',
    'X-RapidAPI-Host': 'twitter154.p.rapidapi.com'
  };
  const allTweets = [];
  const zeroTweetsCountLimit = 1;
  let continuationToken = '';
  const query = 'nit srinagar';

  // ... (rest of the code remains unchanged)
  const startDate = new Date('2023-11-27');
  const endDate = new Date('2023-11-30');
  
  // Initialize an empty array
  const dateList = [];
  
  // Loop through the range of dates and append to the array
  let currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    dateList.push(currentDate.toISOString().split('T')[0]);
    currentDate.setDate(currentDate.getDate() + 1);
  }


  for (let i = 0; i < 5; i++) {
    console.log('date:', dateList[i]);

    let zeroTweetCounts = 0;

    if (i < dateList.length - 1) {
      continuationToken = '';
      const queryString = {
        query,
        section: 'latest',
        min_retweets: '0',
        min_likes: '0',
        limit: '20',
        start_date: dateList[i],
        language: 'en',
        end_date: dateList[i + 1]
      };

      try {
        const response = await axios.get(url, { headers, params: queryString });
        const jsonResponse = response.data;

        if ('continuation_token' in jsonResponse) {
          continuationToken = jsonResponse.continuation_token;
        } else {
          console.log('continuation_token was not present');
          continue;
        }

        // console.log(jsonResponse.continuation_token);

        allTweets.push(...jsonResponse.results);

        // console.log(jsonResponse.results.length);
        // console.log(allTweets.length);

        if (jsonResponse.results.length === 0) {
          zeroTweetCounts += 1;
        }

        const fetchMoreTweets = async () => {
          if (zeroTweetCounts >= zeroTweetsCountLimit) {
            console.log('Not finding any tweets');
            return;
          }

          const continuationQueryString = {
            query,
            continuation_token: continuationToken,
            section: 'latest',
            min_retweets: '0',
            min_likes: '0',
            limit: '20',
            start_date: dateList[i],
            language: 'en',
            end_date: dateList[i + 1]
          };

          try {
            const response = await axios.get(urlContinuation, { headers, params: continuationQueryString });
            const jsonResponse = response.data;

            // console.log(jsonResponse.continuation_token);

            if ('results' in jsonResponse) {
              allTweets.push(...jsonResponse.results);
            }

            // console.log(jsonResponse.results.length);
            console.log(allTweets);

            if (jsonResponse.results.length === 0) {
              zeroTweetCounts += 1;
            }

            const oldToken = continuationToken;
            if ('continuation_token' in jsonResponse) {
              continuationToken = jsonResponse.continuation_token;
            } else {
              continuationToken = '';
              console.log('continuation_token not present, breaking out of the loop');
            }

            if (oldToken === continuationToken) {
              console.log('search exhausted, same token repeating');
              return;
            }
            
            await fetchMoreTweets();
          } catch (error) {
            console.error(error);
          }
        };

        await fetchMoreTweets();
      } catch (error) {
        console.error(error);
      }
    }
  }

  // Assuming `all_tweets` is an array of tweet objects
  const hashtagDf = new dfd.DataFrame(allRetweets);

  // Convert the DataFrame to a JSON object
  dfd.toJSON(hashtagDf, { filePath: "./testOutput_hashtag.json"});
}

// Call the async function
searchByHashtag().catch(error => console.error(error));
