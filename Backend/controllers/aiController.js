const axios = require("axios");

exports.askAI = async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || prompt.trim() === "") {
      return res.status(400).json({ error: "Prompt is required" });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "GEMINI_API_KEY missing in .env" });
    }

    console.log("🔵 Calling Gemini 2.5 Flash...");

    const response = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        contents: [
          {
            parts: [
              { text: prompt }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024
        }
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY
        }
      }
    );

    const reply =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response generated";

    console.log("🟢 Gemini Success");

    return res.status(200).json({ reply });

  } catch (err) {
    console.error("🔥 GEMINI ERROR");

    if (err.response) {
      console.error(err.response.data);
      return res.status(500).json({
        error: err.response.data?.error?.message || "Gemini API failed"
      });
    }

    console.error(err.message);
    return res.status(500).json({ error: "AI request failed" });
  }
};