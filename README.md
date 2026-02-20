# Developer Tools AI API Tester

This repository contains a lightweight full‑stack developer tool designed to simplify API exploration and debugging. It combines an Express backend that leverages Google Gemini AI with a rich React-based frontend that acts as an API playground.

The core idea is to let developers craft arbitrary HTTP requests, examine responses, and augment their workflow with AI assistance: automatically generating JSON request bodies or producing human-friendly explanations of responses. It's essentially a mini‑Postman with AI smarts.

The project is organised into two main parts:

- `server/` – Express backend that interfaces with the Google GenAI SDK and exposes two tiny endpoints for body generation and response explanation.
- `frontend/` – React + Vite app that provides a browser‑based API tester UI with modular components, theming, history management, and AI helpers.

---

## 📁 Project Structure

```
frontend/
  ├── public/              # static assets
  ├── src/
  │   ├── components/      # UI pieces (ApiTester panel, editors, etc.)
  │   ├── context/         # React contexts (theme)
  │   └── utils/           # helper modules (aiService, apiTester, history)
  ├── package.json
  └── vite.config.js

server/
  ├── routes/
  │   └── ai.js            # AI-related endpoints
  ├── index.js             # Express entry point
  ├── package.json
  └── .env                 # environment variables (not committed)
```

> The frontend proxies `/api` requests to the backend during development (see `vite.config.js`).

---

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+ (both projects)
- A Google Cloud API key with access to the Gemini model.

### Server

```bash
cd server
npm install
# create a .env file containing:
# GEMINI_API_KEY=<your-key>
# PORT=4000 (optional)
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# open http://localhost:5173 in your browser
```

The React UI will let you craft arbitrary requests and view responses, with AI helpers to generate request bodies or explain returned data.

---

## 🔌 API Endpoints
All endpoints are prefixed with `/api/ai` on the server. When running the frontend locally, calls go to `http://localhost:5173/api/ai/...` which is proxied to `http://localhost:4000/api/ai/...`.

### `POST /api/ai/generate-body`
Generates a sample JSON request body based on a short description.

- **Request**
  ```json
  {
    "description": "Create a new user with name and email"
  }
  ```

- **Response (200 OK)**
  ```json
  {
    "body": "{\"name\": \"John Doe\", \"email\": \"john@example.com\"}"
  }
  ```

- **Errors**
  - `400` if `description` is missing.
  - `500` on AI/Google API failure.

### `POST /api/ai/explain-response`
Returns a Markdown explanation of an HTTP response, given the original request metadata.

- **Request**
  ```json
  {
    "request": {
      "method": "POST",
      "url": "https://api.example.com/users"
    },
    "response": {
      "status": 201,
      "statusText": "Created",
      "data": { "id": 123, "name": "Jane" }
    }
  }
  ```

- **Response (200 OK)**
  ```json
  {
    "explanation": "# API Response Explanation\n\n## 1. Overall Meaning\nThis response indicates that a new user resource was successfully created..."
  }
  ```

- **Errors**
  - `400` if `response` is missing.
  - `500` on AI/Google API failure.


---

## 🖥️ Frontend Behavior

The React app (`frontend/src`) is structured to keep logic and presentation modular.

### 📦 Core Frontend Modules

- **`apiTester.js`** – generic HTTP client powered by Axios; manages local proxying, header normalization, JSON parsing, error handling, and request timing. It abstracts away the network details so components can remain focused on UI state.

- **`aiService.js`** – a thin service layer that calls the backend AI endpoints (`/generate-body` and `/explain-response`) using the same axios instance configured for credentials.

- **`historyManager.js`** – simple wrapper around `localStorage` responsible for persisting an array of past requests. Used by the history panel to allow users to re‑run or inspect previous interactions.

- **React Context (`ThemeContext.jsx`)** – provides a light/dark theme toggle that components consume to adjust styling. The theme selection is also saved in `localStorage`.

### 🧩 UI Components (in `src/components/ApiTester`)

Each part of the request/response workflow is encapsulated in its own component:

- `MethodSelector.jsx` – dropdown for choosing HTTP verbs (GET, POST, etc.).
- `HeadersEditor.jsx` – dynamic form for adding/removing request headers.
- `BodyEditor.jsx` – textarea for entering raw JSON body with validation and AI body generation button.
- `AIPanel.jsx` – sidebar controls for invoking the AI helpers and displaying generated text or explanations.
- `ResponseViewer.jsx` – formatted display of the status, headers, body, and timing of the last response. Supports raw JSON rendering.
- `HistoryPanel.jsx` – lists saved requests from `historyManager`; clicking an entry populates the request form.

The main `App.jsx` component ties everything together, maintaining the current request state and passing callbacks down to children. Styling is handled by simple CSS files (`App.css`, `index.css`) and a `theme.js` file provides common color variables.

### 🎯 User Workflow
1. **Compose a request**: select method, enter URL, add headers, and type (or auto‑generate) a JSON body.
2. **Send the request**: click the send button; the response viewer updates with status, time, and data.
3. **Use AI helpers**: either generate a body from plain text or explain the received response in Markdown.
4. **Review history**: revisit previous requests via the history panel and replay them instantly.

This design keeps the UI responsive and stateful without relying on external libraries like Redux—everything is managed via React hooks and context.

---

## 🧪 Examples

Below are some sample interactions you can try once the app is running:

1. **Generate a request body**
   - Type `Create a product with name, price, and inStock flag` in the description field
   - Click "Generate Body" to receive JSON you can drop into the body editor.

2. **Send a test request**
   - Method: `GET`, URL: `https://jsonplaceholder.typicode.com/posts/1`
   - Click "Send" – you should see a 200 response with post data.

3. **Explain a response**
   - After sending any request, click "Explain Response" to get a formatted AI breakdown.

---

## ⚙️ Environment Variables

Create a `server/.env` file with:

```
GEMINI_API_KEY=your_google_api_key_here
PORT=4000             # optional
```

No frontend-specific environment is required since it proxies when running locally.

---

## 🚀 Deployment Notes

- You may deploy the backend to any Node‑friendly host (Heroku, Vercel serverless functions, etc.).
- The frontend can be built with `npm run build` and served as static assets; ensure the `/api` proxy or URL is adjusted for production.

---

## 📝 License

[MIT](LICENSE) (or specify appropriate license)

---

Feel free to expand on this README as the project grows!