require("dotenv").config();
const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function generateLesson(module_title) {
  const prompt = `
      You are an expert course designer.
      Generate a lesson for the module titled "${module_title}".
      Each module should be an object with:
        - "title": Lesson Title (string, max 10 words).
        - "content":
        an array of :
        1. A detailed explanation of the lesson.(Notes)
        2. Youtube video link (string).
        3. (4/5) MCQ with 4 options (A, B, C, D) and the correct answer.
      Each object in the array MUST strictly follow this schema:
        {
          "title": "Lesson Title (string, max 10 words)",
          "content": [
            "notes" : "Detailed explanation of the lesson (Notes)",
            "link" : "YouTube video link (string)",
            [
              {
                "question": "MCQ Question Number 1",
                "options": { "A": "...", "B": "...", "C": "...", "D": "..." },
                "answer": "A"
              }
            ]
          ]
        }
      Return ONLY a valid JSON lesson object with title and array of content.
      Do not include any extra text, commentary, or formatting — just the JSON.
      Make sure the JSON is well-formed and valid. Donot have to give JSON formatting, just the JSON object.
      There is no limit on the number of modules, but make sure they are relevant to the course title.
    `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.1,
      responseMimeType: "application/json",
    },
  });

  let rawJsonText = response.candidates[0].content.parts[0].text;
  // Remove any ```json or ``` wrappers from the response
  rawJsonText = rawJsonText.replace(/```json\s*|```/g, "").trim();

  let lessons;
  let parsed = JSON.parse(rawJsonText);

  return parsed;
}

module.exports = generateLesson;
