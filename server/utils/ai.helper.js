require("dotenv").config();
const { GoogleGenAI } = require("@google/genai");
 
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});


async function generateModules( course_title ) {
  try {
    const prompt = `
      You are an expert course designer.
      Generate anything from [5-10] modules for the course titled "${course_title}".
      Each module should be an object with:
        - "title": Lesson Title (string, max 10 words).
        - "description": A concise explanation of the lesson (string, max 30 words).
      Return ONLY a valid JSON array of these module objects.
      Do not include any extra text, commentary, or formatting — just the JSON.
      The CODE BLOCK should be formatted 
      Make sure the JSON is well-formed and valid.
      There is no limit on the number of modules, but make sure they are relevant to the course title.
    `;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }], // Added the required contents format
      generationConfig: {
        temperature: 0.1,
        responseMimeType: "application/json", 
      },
    });

    let rawJsonText = response.candidates[0].content.parts[0].text;

    rawJsonText = rawJsonText.replace(/```json\s*|```/g, '').trim();

    // console.log("Cleaned AI response text:", rawJsonText);

    let modules;
    try {
      // Now we can successfully parse the clean JSON string
      modules = JSON.parse(rawJsonText);
    } catch (err) {
      throw new Error("Failed to parse AI response as JSON: " + rawJsonText);
    }

    if (!Array.isArray(modules) || !modules.every(m => m.title && m.description)) {
      throw new Error("Response is not in the expected module array format.");
    }

    return modules;
  } catch (error) {
    console.error("Error generating modules:", error.message);
    return [];
  }
}

module.exports = generateModules;
