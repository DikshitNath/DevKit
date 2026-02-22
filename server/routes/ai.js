const express = require("express");
const { GoogleGenAI } = require("@google/genai");

const router = express.Router();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

router.post("/generate-body", async (req, res) => {
  const { description } = req.body;
  if (!description)
    return res.status(400).json({ error: "Description is required" });

  try {
    const prompt = `Generate a JSON request body for: "${description}".
    Return ONLY valid JSON, no explanation, no markdown, no code blocks. Just raw JSON.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    const clean = response.text
      .trim()
      .replace(/```json|```/g, "")
      .trim();
    JSON.parse(clean);
    res.json({ body: clean });
  } catch (err) {
    console.error("Gemini error:", err);
    res.status(500).json({ error: err.message });
  }
});

router.post("/explain-response", async (req, res) => {
  const { request, response } = req.body;
  if (!response) return res.status(400).json({ error: "Response is required" });

  try {
    const prompt = `
You are a senior backend engineer explaining an API response to a developer.

I made the following API request:

**Request**
- Method: ${request.method}
- URL: ${request.url}

**Response**
- Status: ${response.status} ${response.statusText}
- Body:
\`\`\`json
${JSON.stringify(response.data, null, 2).slice(0, 2000)}
\`\`\`

Your task:

Generate a clear explanation in Markdown format.

Structure your explanation exactly like this:

# API Response Explanation

## 1. Overall Meaning
Explain in simple, clear English what this response represents.

## 2. Status Analysis
- Is this a success or error response?
- What does the status code indicate?

## 3. Key Fields Breakdown
Explain important top-level fields:
- Field name
- Data type (if obvious)
- What it represents

## 4. Nested Data (if present)
Explain any nested objects or arrays briefly.

## 5. Final Verdict
State clearly whether this looks correct or if something seems wrong.

Rules:
- Keep it concise.
- Use Markdown headings and bullet points.
- Be developer-friendly.
- Do NOT repeat the full JSON unnecessarily.
- Avoid overly verbose explanations.
`;

    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    res.json({ explanation: result.text });
  } catch (err) {
    console.error("Gemini error:", err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/generate-snippet', async (req, res) => {
  const { prompt, language } = req.body
  if (!prompt) return res.status(400).json({ error: 'Prompt is required' })

  try {
    const aiPrompt = `Generate a clean, well-commented ${language} code snippet for: "${prompt}".
    Return ONLY the code itself, no explanation, no markdown, no code blocks. Just raw code.`

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: aiPrompt
    })

    const code = response.text.trim().replace(/```[\w]*\n?|```/g, '').trim()
    res.json({ code })
  } catch (err) {
    console.error('Gemini error:', err)
    res.status(500).json({ error: err.message })
  }
})

router.post('/explain-json', async (req, res) => {
  const { json } = req.body
  if (!json) return res.status(400).json({ error: 'JSON is required' })
  try {
    const prompt = `Analyze this JSON and explain it in simple terms:

${json}

Explain:
1. What this JSON represents overall
2. The structure and key fields
3. Any patterns or notable things about the data

Keep it concise and developer-friendly. Use markdown formatting.`

    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt })
    res.json({ explanation: response.text })
  } catch (err) {
    console.error('Gemini error:', err)
    res.status(500).json({ error: err.message })
  }
})

router.post('/generate-json', async (req, res) => {
  const { description } = req.body
  if (!description) return res.status(400).json({ error: 'Description is required' })
  try {
    const prompt = `Generate a JSON object for: "${description}".
Return ONLY valid JSON, no explanation, no markdown, no code blocks. Just raw JSON.`

    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt })
    const clean = response.text.trim().replace(/```json|```/g, '').trim()
    JSON.parse(clean)
    res.json({ json: clean })
  } catch (err) {
    console.error('Gemini error:', err)
    res.status(500).json({ error: err.message })
  }
})

module.exports = router;
