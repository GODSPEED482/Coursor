require("dotenv").config();
const {google} = require("googleapis");

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

const youtube = google.youtube({
  version: "v3",
  auth: GOOGLE_API_KEY
});

async function getVideos() {
  const res = await youtube.search.list({
    part: "snippet",
    q: "install jdk",
    maxResults: 5,
  });
  console.log(res.data.items);
}

getVideos();