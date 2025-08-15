// import OpenAI from "openai";
// import { playAudio } from "openai/helpers/audio";
require("dotenv").config(); // Ensure dotenv is configured to load environment variables
const { config } = require("dotenv");
const OpenAI = require("openai");
const { playAudio } = require("openai/helpers/audio");
// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY, // Store in .env
// });

// async function main() {
//   const response = await openai.audio.speech.create({
//     model: "gpt-4o-mini-tts",
//     voice: "coral",
//     input: "Today is a wonderful day to build something people love!",
//     // `instructions` is not a valid param in TTS API — remove it
//     format: "wav", // Correct param is `format` not `response_format`
//   });

//   const buffer = Buffer.from(await response.arrayBuffer());
//   await playAudio(buffer); // Plays audio in supported environments
// }

// main();

// import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: "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",
});

const response = openai.responses.create({
  model: "gpt-4o-mini",
  input: "write a haiku about ai",
  store: true,
});

response.then((result) => console.log(result.output_text));