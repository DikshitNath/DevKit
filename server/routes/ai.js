const express = require("express");
const Groq = require("groq-sdk");

const router = express.Router();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Model to use — swap here if you want to change it globally
// Options: "llama-3.3-70b-versatile" | "llama-3.1-8b-instant" | "mixtral-8x7b-32768"
const MODEL = "llama-3.3-70b-versatile";

// ─── Helper ───────────────────────────────────────────────────────────
async function chat(prompt, systemPrompt = null) {
  const messages = []
  if (systemPrompt) messages.push({ role: "system", content: systemPrompt })
  messages.push({ role: "user", content: prompt })

  const response = await groq.chat.completions.create({
    model: MODEL,
    messages,
    temperature: 0.7,
    max_tokens: 2048,
  })
  return response.choices[0].message.content
}

// ─────────────────────────────────────────────────────────────────────
// POST /api/ai/generate-body
// ─────────────────────────────────────────────────────────────────────
router.post("/generate-body", async (req, res) => {
  const { description } = req.body;
  if (!description)
    return res.status(400).json({ error: "Description is required" });

  try {
    const prompt = `Generate a JSON request body for: "${description}".
Return ONLY valid JSON, no explanation, no markdown, no code blocks. Just raw JSON.`;

    const text = await chat(prompt)
    const clean = text.trim().replace(/```json|```/g, "").trim();
    JSON.parse(clean); // validate
    res.json({ body: clean });
  } catch (err) {
    console.error("Groq error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────
// POST /api/ai/explain-response
// ─────────────────────────────────────────────────────────────────────
router.post("/explain-response", async (req, res) => {
  const { request, response } = req.body;
  if (!response) return res.status(400).json({ error: "Response is required" });

  try {
    const prompt = `
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

Generate a clear explanation in Markdown format structured exactly like this:

# API Response Explanation

## 1. Overall Meaning
Explain in simple, clear English what this response represents.

## 2. Status Analysis
- Is this a success or error response?
- What does the status code indicate?

## 3. Key Fields Breakdown
Explain important top-level fields — name, type, what it represents.

## 4. Nested Data (if present)
Explain any nested objects or arrays briefly.

## 5. Final Verdict
State clearly whether this looks correct or if something seems wrong.

Rules: keep it concise, use Markdown, be developer-friendly, do NOT repeat the full JSON.`;

    const text = await chat(prompt, "You are a senior backend engineer explaining API responses to developers.")
    res.json({ explanation: text });
  } catch (err) {
    console.error("Groq error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────
// POST /api/ai/generate-snippet
// ─────────────────────────────────────────────────────────────────────
router.post('/generate-snippet', async (req, res) => {
  const { prompt, language } = req.body
  if (!prompt) return res.status(400).json({ error: 'Prompt is required' })

  try {
    const text = await chat(
      `Generate a clean, well-commented ${language} code snippet for: "${prompt}".
Return ONLY the code itself, no explanation, no markdown, no code blocks. Just raw code.`
    )
    const code = text.trim().replace(/```[\w]*\n?|```/g, '').trim()
    res.json({ code })
  } catch (err) {
    console.error('Groq error:', err)
    res.status(500).json({ error: err.message })
  }
})

// ─────────────────────────────────────────────────────────────────────
// POST /api/ai/explain-json
// ─────────────────────────────────────────────────────────────────────
router.post('/explain-json', async (req, res) => {
  const { json } = req.body
  if (!json) return res.status(400).json({ error: 'JSON is required' })

  try {
    const text = await chat(
      `Analyze this JSON and explain it in simple terms:

${json.slice(0, 3000)}

Explain:
1. What this JSON represents overall
2. The structure and key fields
3. Any patterns or notable things about the data

Keep it concise and developer-friendly. Use markdown formatting.`
    )
    res.json({ explanation: text })
  } catch (err) {
    console.error('Groq error:', err)
    res.status(500).json({ error: err.message })
  }
})

// ─────────────────────────────────────────────────────────────────────
// POST /api/ai/generate-json
// ─────────────────────────────────────────────────────────────────────
router.post('/generate-json', async (req, res) => {
  const { description } = req.body
  if (!description) return res.status(400).json({ error: 'Description is required' })

  try {
    const text = await chat(
      `Generate a realistic JSON data structure for: "${description}".
Return ONLY valid JSON, no explanation, no markdown, no code blocks. Just raw JSON.`
    )
    const clean = text.trim().replace(/```json|```/g, '').trim()
    JSON.parse(clean) // validate
    res.json({ json: clean })
  } catch (err) {
    console.error('Groq error:', err)
    res.status(500).json({ error: err.message })
  }
})

// ─────────────────────────────────────────────────────────────────────
// POST /api/ai/explain-regex
// ─────────────────────────────────────────────────────────────────────
router.post('/explain-regex', async (req, res) => {
  const { pattern, flags } = req.body
  if (!pattern) return res.status(400).json({ error: 'Pattern required' })

  try {
    const text = await chat(
      `Explain this regex pattern: /${pattern}/${flags || ''}

Break it down:
1. What it matches overall
2. Each part of the pattern explained
3. A practical use case
4. 2-3 example strings that would match

Keep it concise and developer-friendly. Use markdown.`
    )
    res.json({ explanation: text })
  } catch (err) {
    console.error('Groq error:', err)
    res.status(500).json({ error: err.message })
  }
})

// ─────────────────────────────────────────────────────────────────────
// POST /api/ai/generate-regex
// ─────────────────────────────────────────────────────────────────────
router.post('/generate-regex', async (req, res) => {
  const { description } = req.body
  if (!description) return res.status(400).json({ error: 'Description required' })

  try {
    const text = await chat(
      `Generate a regex pattern for: "${description}"

Return ONLY a JSON object like this:
{"pattern": "your-regex-here", "flags": "g", "explanation": "brief one-line explanation"}

No markdown, no code blocks, just raw JSON.`
    )
    const clean = text.trim().replace(/```json|```/g, '').trim()
    res.json(JSON.parse(clean))
  } catch (err) {
    console.error('Groq error:', err)
    res.status(500).json({ error: err.message })
  }
})

// ─────────────────────────────────────────────────────────────────────
// POST /api/ai/generate-palette
// ─────────────────────────────────────────────────────────────────────
router.post('/generate-palette', async (req, res) => {
  const { description } = req.body
  if (!description) return res.status(400).json({ error: 'Description is required' })

  try {
    const text = await chat(
      `Generate a 5-color palette for: "${description}".
Return ONLY a JSON object like this:
{"colors": ["#hex1", "#hex2", "#hex3", "#hex4", "#hex5"]}

No markdown, no code blocks, just raw JSON. Colors must be valid hex codes.`
    )
    const clean = text.trim().replace(/```json|```/g, '').trim()
    res.json(JSON.parse(clean))
  } catch (err) {
    console.error('Groq error:', err)
    res.status(500).json({ error: err.message })
  }
})

module.exports = router;