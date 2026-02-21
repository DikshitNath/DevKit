# 🚀 DevKit – All‑In‑One Developer Toolbox

**DevKit** is a full‑stack, open‑source toolkit designed to help developers build, debug and prototype faster. It combines a modern React/Vite front‑end with an Express.js/MongoDB back‑end and integrates AI‑powered helpers to make everyday tasks easier.

> _"A Swiss Army knife for developers, inside your browser."_

---

## ✨ Features

| Available | Tool | Description |
|-----------|------|-------------|
| ✅ | **API Tester** | Send authenticated requests, set headers/body, view responses, track history and get AI‑generated explanations. |
| ✅ | **Snippet Manager** | Create, edit and organize code snippets with language tags, search, syntax colors and Monaco editor. Publish snippets publicly. |
| ✅ | **JWT Decoder** | Inspect JSON Web Tokens (header, payload, expiration). |
| ✅ | **AI Generators** | Auto‑generate JSON request bodies, explain API responses and create code snippets using Google Gemini/GenAI. |
| 🔜 | **JSON Formatter** | Pretty‑print, validate and diff JSON. |
| 🔜 | **Regex Tester** | Live regex evaluation with match highlighting and documentation. |
| 🔜 | **Color Palette** | Generate and convert between color formats. |

*Tools marked 🔜 are planned for future releases.*


## 🗂️ Project Structure

```
├── frontend/       # React application (Vite + JSX)
│   ├── public/
│   ├── src/
│   │   ├── components/      # UI pieces (ApiTester, SnippetManager, etc.)
│   │   ├── context/         # Auth & Theme providers
│   │   ├── pages/           # Routes: Home, Login, Register, tools
│   │   └── utils/           # API helpers and local state managers
│   ├── package.json
│   └── vite.config.js
└── server/         # Express.js API server
    ├── middleware/   # JWT auth, etc.
    ├── models/       # Mongoose schemas (User, Snippet)
    ├── routes/       # auth, snippets, ai endpoints
    ├── index.js      # entry point
    ├── package.json
    └── .env          # environment variables (not checked in)
```


## 🛠️ Technology Stack

- **Frontend:** React, Vite, React Router, Axios, Monaco Editor, Fuse.js
- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT, bcrypt, cookie‑parser
- **AI:** Google GenAI (Gemini) via `@google/genai` (can be swapped for OpenAI)
- **Styling:** Inline CSS with responsive layout and dark/light themes


## 🏁 Getting Started

### Prerequisites

- Node.js 18+ (npm included)
- MongoDB instance (local or cloud)
- Optional: Gemini / OpenAI API key for AI features

### Clone repository

```bash
git clone https://github.com/<your-org>/devkit.git
cd devkit
```

### Configure environment variables

Create a `.env` file in `/server`:

```env
MONGO_URI=mongodb://localhost/devkit
JWT_SECRET=supersecret123
GEMINI_API_KEY=your_gemini_key_here   # or OPENAI_API_KEY if using OpenAI
PORT=3000
```

### Install & run the backend

```bash
cd server
npm install
npm run dev        # start with nodemon (port 3000 by default)
```

### Install & run the frontend

```bash
cd ../frontend
npm install
npm run dev        # launches Vite dev server on http://localhost:5173
```

> The React app proxies `/api` requests to `http://localhost:3000` by default.


## 🔌 API Reference

All endpoints are prefixed with `/api` when called from the frontend. Authentication is handled via an httpOnly JWT cookie; you do not need to manually attach tokens when using the provided client utilities.

### Authentication

| Method | Endpoint             | Description               | Request Body                             | Response Example |
|--------|----------------------|---------------------------|-------------------------------------------|------------------|
| POST   | `/api/auth/register` | Register a new account    | `{ "username","email","password" }`       | `201 { "message": "User created successfully" }` |
| POST   | `/api/auth/login`    | Log in and set cookie     | `{ "email","password" }`                  | `200 { "message": "...", "user": {...} }` |
| POST   | `/api/auth/logout`   | Clear authentication      | _none_                                    | `200 { "message": "Logged out successfully" }` |
| GET    | `/api/auth/me`       | Get current user          | _none_ (cookie sent automatically)        | `200 { "user": { id, username, email } }` |

> The `login` route sets a cookie named `token` that is sent on subsequent `/api` calls.



### Snippets

All snippet routes require authentication.

| Method | Endpoint            | Description                        | Body                                               | Notes |
|--------|---------------------|------------------------------------|----------------------------------------------------|-------|
| GET    | `/api/snippets`     | List user's snippets              | _none_                                            | returns array |
| GET    | `/api/snippets/public` | List public snippets           | _none_                                            | anyone can access |
| GET    | `/api/snippets/:id` | Retrieve single snippet           | _none_                                            | |
| POST   | `/api/snippets`     | Create new snippet                | `{ title, code, language?, tags?, isPublic? }`    | returns created doc |
| PUT    | `/api/snippets/:id` | Update existing snippet           | same as POST body                                 | user must own snippet |
| DELETE | `/api/snippets/:id` | Delete snippet                    | _none_                                            | user must own snippet |

```bash
# create
curl -X POST http://localhost:3000/api/snippets \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"title":"Example","code":"console.log(1);","tags":["js"]}'
```


### AI & Utilities

These endpoints power the API tester and snippet generator features.

| Method | Endpoint                   | Description                                  | Request Body                                    |
|--------|----------------------------|----------------------------------------------|------------------------------------------------|
| POST   | `/api/ai/generate-body`    | Generate JSON request body from description  | `{ description: "create user payload" }`      |
| POST   | `/api/ai/explain-response` | Return markdown explanation of a response    | `{ request, response }`                        |
| POST   | `/api/ai/generate-snippet` | Generate code snippet from prompt           | `{ prompt, language }`                         |

Example:

```bash
curl -X POST http://localhost:3000/api/ai/explain-response \
  -H "Content-Type: application/json" \
  -d '{"request":{ "method":"GET","url":"https://..."},"response":{ "status":200,"data":{...}}}'
```

Response:

```json
{ "explanation": "# API Response Explanation\n\n## 1. Overall Meaning\n..." }
```

---

## 🎯 Frontend Walkthrough

The React application serves as both the UI and a thin client for the backend API.

### Navigation

- **Home** – marketing landing page with links to tools.
- **API Tester** – build and send HTTP requests across domains.
- **Snippet Manager** – CRUD interface backed by Monaco editor.
- **Login/Register** – user authentication.
- Footer and theme toggle are global components.

### API Tester

Features:

- Enter URL, method, headers, JSON body.
- Click **Send** to issue request; if the URL points to `localhost:3000` it is proxied through the server, allowing cookies to be included and AI analysis to occur.
- History panel retains up to 50 past requests.
- AI panel can generate request bodies or explain server responses (powered by `/api/ai` routes).


### Snippet Manager

- Sidebar displays user's snippets with search and filters.
- Create/edit snippets with Monaco editor, specify language, tags, and visibility.
- Public snippets are viewable by anyone via `/api/snippets/public`.
- AI code generator integrates with the server (`/api/ai/generate-snippet`).

### Authentication Flow

- Register with username, email and password.
- Upon login, a JWT cookie is stored; `AuthContext` fetches `/api/auth/me` to populate user state.
- Logout clears cookie and resets context.

### Utilities

- `authService.js`, `snippetService.js`, `apiTester.js`, and `aiService.js` encapsulate HTTP interactions.
- `historyManager.js` persists API Tester logs in `localStorage`.

---

## 💡 Development Notes

- Themes are toggled via `ThemeContext` and inline style objects.
- All components use functional React hooks.
- Server uses `authMiddleware` to guard private routes.
- Snippet schema: `user`, `title`, `code`, `language`, `tags`, `isPublic`.
- AI routes use Google Gemini; swapable by changing environment key and minor logic.

---

## 🧪 Running Tests & Linting

_(Add commands or notes here if tests/linting exist — currently none.)_

---

## 📦 Deployment

- Build frontend with `npm run build` (Vite).
- Serve static files from `/server` or deploy separately.
- Ensure environment variables are set in production.
- MongoDB Atlas recommended for hosted database.

---

## 🤝 Contributing

1. Fork the repo.
2. Create a branch for your feature/fix.
3. Open a PR with a clear description.
4. Make sure new features are documented here.

---

## 📄 License

This project is licensed under the **MIT License**. See `LICENSE` file for details.
