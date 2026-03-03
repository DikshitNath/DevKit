  ![DevKit](https://ik.imagekit.io/myBlogApp/devkit-logo.svg)

  # DevKit – All‑In‑One Developer Toolbox

  **DevKit** is a full‑stack, open‑source toolkit designed to help developers build, debug and prototype faster. It combines a modern React/Vite front‑end with an Express.js/MongoDB back‑end and integrates AI‑powered helpers to make everyday tasks easier.

  > _"A Swiss Army knife for developers, inside your browser."_

  ---

  [![React](https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react&logoColor=black)](https://react.dev)
  [![Vite](https://img.shields.io/badge/Vite-5-646cff?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
  [![Monaco](https://img.shields.io/badge/Monaco_Editor-latest-0078d4?style=flat-square&logo=visualstudiocode&logoColor=white)](https://microsoft.github.io/monaco-editor/)

  ## ✨ Features

  ### Developer Tools

  | Available | Tool | Description | Features |
  |-----------|------|-------------|----------|
  | ✅ | **API Tester** | Test REST APIs with full control over requests | Send HTTP requests with custom headers, body, and auth • View formatted responses • Track request history (up to 50) • AI-powered response explanations • Authentication support |
  | ✅ | **Snippet Manager** | Create, organize, and share code snippets | Monaco editor with syntax highlighting • Multiple language support • Tag-based organization • Full-text search with Fuse.js • Public/private snippets • Share via public URLs |
  | ✅ | **JSON Formatter** | Format, validate, and analyze JSON data | Pretty-print & minify • Interactive tree explorer • Search across keys and values • Statistics (keys, types, depth, file size) • Import/export functionality • Customizable indentation |
  | ✅ | **Regex Tester** | Write and test regular expressions | Live matching with real-time highlighting • Capture groups extraction • Regex flags (g, i, m, s) • Preset patterns (email, URL, phone, IP, etc.) • AI-powered pattern generation & explanation |
  | ✅ | **JWT Decoder** | Inspect and analyze JSON Web Tokens | Decode header, payload, signature • View all token claims • Expiration tracking with countdown • Timestamp conversion to readable dates • Copy utilities for claims |
  | ✅ | **Color Palette Generator** | Create and manage color schemes | Multiple harmony modes (complementary, triadic, analogous, monochromatic, split-complementary) • HSL/RGB/Hex conversion • Base color picker with HSL sliders • Save up to 8 custom palettes • Export as CSS :root variables • AI palette generation |

  ### Authentication Features

  | Feature | Description |
  |---------|-----------|
  | **Traditional Auth** | Register with email/password, login, logout |
  | **Forgot Password** | OTP-based password reset via email (6-digit code, 10-minute expiry) |
  | **Google OAuth 2.0** | One-click login with Google account |
  | **Password Strength** | Real-time indicator during registration and password reset |
  | **Profile Management** | Update username, email, and password securely |
  | **Account Deletion** | Permanently delete account and all associated data |
  | **JWT Security** | HttpOnly cookies with 7-day expiration, secure CORS |

  ### AI-Powered Features

  | Feature | Description |
  |---------|-----------|
  | **Response Explanation** | Auto-generate markdown explanations of API responses |
  | **Snippet Generation** | Create code snippets from natural language descriptions |
  | **JSON Generation** | Generate sample JSON payloads from text descriptions |
  | **Regex Assistance** | Generate regex patterns from descriptions or explain existing patterns |
  | **Palette AI** | Generate color palettes from mood/theme descriptions |

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

  ### Frontend
  - **Core:** React 19, Vite 7, React Router 7
  - **Editors:** Monaco Editor (@monaco-editor/react)
  - **UI & Styling:** Responsive CSS, dark/light theme support, Tailwind CSS
  - **State Management:** React Context (AuthContext, ThemeContext)
  - **Data & Search:** Fuse.js (fuzzy search), @uiw/react-json-view (JSON visualization)
  - **Utilities:** Axios (HTTP), react-hot-toast (notifications), react-markdown (Markdown rendering)

  ### Backend
  - **Server:** Node.js, Express 5
  - **Database:** MongoDB (Mongoose ODM)
  - **Authentication:** JWT, bcrypt, Passport.js (local + Google OAuth)
  - **Email:** Nodemailer (OTP delivery)
  - **AI:** Google GenAI (@google/genai, Gemini API) — swappable with OpenAI
  - **Middleware:** CORS, cookie-parser, express-session
  - **Security:** httpOnly cookies, password hashing, OTP expiration, token validation

  ### Styling & Theming
  - Inline CSS with theme variables
  - Dark mode & light mode support
  - Responsive layout (mobile, tablet, desktop)
  - Font: IBM Plex Sans (body), IBM Plex Mono (code)


  ## 🏁 Getting Started

  ### Prerequisites

  - Node.js 18+ (npm included)
  - MongoDB instance (local or cloud, e.g., MongoDB Atlas)
  - Gemini API key (or OpenAI key as alternative) for AI features
  - Google OAuth credentials (optional, for OAuth login) – [Get OAuth 2.0 credentials](https://console.developers.google.com/)
  - Email service configuration for OTP delivery (Nodemailer configured with SMTP)

  ### Clone repository

  ```bash
  git clone https://github.com/<your-org>/devkit.git
  cd devkit
  ```

  ### Configure environment variables

  Create a `.env` file in `/server`:

  ```env
  # Database
  MONGO_URI=mongodb://localhost/devkit          # Local: mongodb://localhost/devkit | Cloud: mongodb+srv://user:pass@cluster.mongodb.net/devkit

  # JWT & Security
  JWT_SECRET=supersecret123                     # Long random string for JWT signing
  SESSION_SECRET=another_secret_here            # Separate secret for express-session

  # AI API
  GEMINI_API_KEY=your_gemini_key_here          # OR OPENAI_API_KEY=your_openai_key
  # AI_MODEL=gemini-pro                         # Optional: specify model name

  # Google OAuth (optional, for "Login with Google")
  GOOGLE_CLIENT_ID=your_google_client_id
  GOOGLE_CLIENT_SECRET=your_google_client_secret
  GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

  # Email Service (for OTP delivery)
  EMAIL_HOST=smtp.gmail.com                     # SMTP server
  EMAIL_PORT=587                                # SMTP port
  EMAIL_USER=your_email@gmail.com               # Sender email
  EMAIL_PASSWORD=your_app_password              # App-specific password (not your regular password)
  EMAIL_FROM=noreply@devkit.com                 # Display name/address

  # Server & Client
  PORT=3000                                     # Server port
  CLIENT_URL=http://localhost:5173              # Frontend URL (for CORS)
  NODE_ENV=development                          # development | production
  ```

  **Notes:**
  - For Gmail: Enable "Less secure app access" or use an [App Password](https://support.google.com/accounts/answer/185833)
  - For MongoDB local: Ensure MongoDB is running (`mongod` or `systemctl start mongod`)
  - Google OAuth: Set up at [Google Cloud Console](https://console.cloud.google.com/) > create OAuth 2.0 credential
  - Keep secrets secure; never commit `.env` to version control

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

  | Method | Endpoint                    | Description                         | Request Body                                | Response Example |
  |--------|-----------------------------|------------------------------------|---------------------------------------------|------------------|
  | POST   | `/api/auth/register`        | Register a new account              | `{ "username","email","password" }`         | `201 { "message": "User created successfully" }` |
  | POST   | `/api/auth/login`           | Log in and set cookie               | `{ "email","password" }`                    | `200 { "message": "...", "user": {...} }` |
  | POST   | `/api/auth/logout`          | Clear authentication                | _none_                                      | `200 { "message": "Logged out successfully" }` |
  | GET    | `/api/auth/me`              | Get current user                    | _none_ (cookie sent automatically)          | `200 { "user": { id, username, email } }` |
  | POST   | `/api/auth/forgot-password` | Request OTP for password reset      | `{ "email" }`                               | `200 { "message": "OTP sent" }` |
  | POST   | `/api/auth/verify-otp`      | Verify OTP and get reset token      | `{ "email", "otp" }`                        | `200 { "resetToken": "..." }` |
  | POST   | `/api/auth/reset-password`  | Complete password reset             | `{ "resetToken", "newPassword" }`           | `200 { "message": "Password updated successfully" }` |
  | PUT    | `/api/auth/profile`         | Update profile or password          | `{ "username", "email", "currentPassword", "newPassword" }` | `200 { "message": "...", "user": {...} }` |
  | DELETE | `/api/auth/delete-account`  | Delete user account and data        | `{ "password" }` (optional for OAuth users) | `200 { "message": "Account deleted successfully" }` |
  | GET    | `/api/auth/google`          | Initiate Google OAuth flow          | _none_                                      | Redirects to Google |
  | GET    | `/api/auth/google/callback` | Google OAuth callback               | _none_ (handled by Passport)                | Sets cookie & redirects to home |

  **Authentication Features:**
  - **Email/Password Registration** – Traditional account signup with email confirmation
  - **OTP-Based Password Reset** – 6-digit code sent via email, valid for 10 minutes
  - **Google OAuth 2.0** – One-click login with Google account (optional, can be skipped)
  - **Password Strength Indicator** – Real-time feedback on password strength during registration and reset
  - **Account Deletion** – Users can permanently delete their account and all associated data
  - **JWT Cookies** – Secure httpOnly cookies set on login, automatically sent with subsequent requests



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
  - **Login/Register** – user authentication with form validation and password strength indicator.
  - **API Tester** – build and send HTTP requests across domains.
  - **Snippet Manager** – CRUD interface backed by Monaco editor.
  - **JSON Formatter** – tree explorer, syntax highlighting, statistics and import/export.
  - **Regex Tester** – live pattern testing with presets and AI-powered explanations.
  - **JWT Decoder** – decode and inspect tokens with expiration tracking.
  - **Color Palette** – generate harmonies with multiple modes and color format conversion.
  - Footer and theme toggle are global components (dark/light mode support).

  ### API Tester

  The API Tester allows developers to test REST APIs with full control over requests and responses.

  **Key Features:**
  - Enter URL, HTTP method (GET, POST, PUT, DELETE, etc.), custom headers, and JSON body.
  - Click **Send** to issue requests; if the URL targets `localhost:3000`, it's proxied through the server (allowing cookies and authentication to work).
  - **History Panel** – retains up to 50 past requests with method, URL, and status code for quick reference.
  - **Response Viewer** – displays status code, response headers, and formatted JSON/text response body.
  - **AI Panel** – generate request bodies from descriptions or explain server responses using Gemini AI.
  - **Authentication** – automatically sends JWT cookie with requests, supports custom Authorization headers.
  - **Cross-Origin Support** – test external APIs via CORS proxy, useful for development.


  ### Snippet Manager

  A feature-rich code snippet manager with syntax highlighting, search, and sharing.

  **Key Features:**
  - **Sidebar** – displays user's snippets with full-text search powered by Fuse.js, language filters.
  - **Monaco Editor** – professional code editor with syntax highlighting for 50+ languages and 15+ themes.
  - **Create/Edit** – specify title, code, language, tags (comma-separated), and visibility (private/public).
  - **Public Sharing** – publish snippets publicly; others can browse them via `/api/snippets/public`.
  - **AI Code Generator** – describe what you want and Gemini AI generates code snippets in your selected language.
  - **Tagging System** – organize and discover snippets via tags.
  - **Quick Actions** – copy to clipboard, delete, and toggle public/private visibility.


  ### JSON Formatter (JSONForge)

  A powerful JSON editor and analyzer with multiple views and export options.

  **Key Features:**
  - **Paste or Upload** – input JSON directly or load from file.
  - **Tree Explorer** – interactive, collapsible view of JSON structure with expandable nodes, search across keys and values.
  - **Code View** – syntax-highlighted, formatted JSON with customizable indentation (2 spaces, 4 spaces, or tabs).
  - **Statistics** – see counts of objects, arrays, keys, value types, maximum depth, and file size in bytes.
  - **Actions:**
    - Prettify (auto-format with proper indentation)
    - Minify (remove all whitespace)
    - Sort keys alphabetically
    - Import from file
    - Download formatted JSON
  - **Validation** – syntax errors are caught and reported before export.
  - **Search** – find any key or value in large JSON documents with highlighting.


  ### Regex Tester

  A comprehensive regular expression testing platform with live matching and AI assistance.

  **Key Features:**
  - **Live Matching** – as you type the pattern, all matches highlight in the test string with distinct colors.
  - **Flags** – toggle `g` (global), `i` (case-insensitive), `m` (multiline), `s` (dotall).
  - **Presets** – quick-load common patterns (Email, URL, Phone, IP address, Hex Color, Date, and more).
  - **Capture Groups** – view and copy extracted groups from matches.
  - **AI Explain** – describe a regex pattern and Gemini AI explains what it does.
  - **AI Generate** – describe what you want to match and AI generates the regex pattern.
  - **Match Details** – see match count, position (index), matched text, and all capture groups.


  ### JWT Decoder

  Inspect and analyze JSON Web Tokens with visual separation of components.

  **Key Features:**
  - **Paste JWT** – input any encoded token (automatically validates format).
  - **Auto-decode** – displays Header, Payload, and Signature sections separated and color-coded.
  - **Claim Table** – view all token claims with descriptions:
    - Standard claims: `iss` (issuer), `sub` (subject), `aud` (audience), `exp` (expiration), `iat` (issued at), `nbf` (not before)
    - Custom claims: displayed with their values
  - **Expiry Tracking** – shows if token is valid or expired with countdown timer.
  - **Timestamp Conversion** – Unix timestamps automatically converted to readable dates (ISO 8601).
  - **Copy Utilities** – copy individual claims, entire sections, or the full token with one click.
  - **Visual Indicators** – color-coded sections for easy navigation.


  ### Color Palette Generator

  A professional color palette design and management tool.

  **Key Features:**
  - **Color Picker** – visual picker to select a base color, adjust H (hue), S (saturation), L (lightness) with sliders.
  - **Harmony Modes** – generate color schemes using color theory:
    - Complementary (opposite colors)
    - Triadic (three equally spaced colors)
    - Analogous (adjacent colors)
    - Monochromatic (single color, different shades)
    - Split Complementary (base + two colors adjacent to complement)
  - **Format Conversion** – view and copy colors in Hex, RGB, or HSL formats.
  - **Quick Picks** – 12 built-in color samples for fast exploration (reds, blues, greens, pastels, etc.).
  - **Save Palettes** – bookmark up to 8 custom palettes for quick recall and reuse.
  - **Export CSS** – generate `:root` CSS variables with one click for use in projects.
  - **AI Palette Generator** – describe a mood, theme, or style ("sunset neon", "forest autumn", "cyberpunk") and Gemini AI generates a matching palette.


  ### Authentication Flow

  - **Registration** – Enter username, email, and password; password strength indicator guides input (shows weak/fair/good/strong feedback).
  - **Login** – Email and password authentication; upon success, a JWT cookie is stored (valid for 7 days).
  - **Forgot Password** – Three-step process:
    1. Enter email address
    2. Verify 6-digit OTP sent to email (valid for 10 minutes)
    3. Create new password with strength indicator
  - **Google OAuth** – Click "Login with Google" to authenticate via OAuth 2.0 (skips password requirement).
  - **Account Deletion** – Users can permanently delete their account from the Profile page (requires password confirmation for traditional accounts).
  - `AuthContext` fetches `/api/auth/me` on app load to restore user state.
  - **Logout** – Clears cookie and resets user context.

  ### Frontend Utilities

  The frontend includes several utility modules for managing API interactions and application state:

  - **`authService.js`** – handles authentication HTTP calls:
    - User registration, login, logout
    - Profile updates and password changes
    - Forgot password, OTP verification, password reset
    - Account deletion (_requires authentication_)
    - Google OAuth callback handling

  - **`snippetService.js`** – manages snippet CRUD operations:
    - Fetch user snippets with filters and search
    - Create, update, delete snippets
    - Toggle public/private visibility
    - AI-powered snippet generation

  - **`apiTester.js`** – encapsulates HTTP request logic:
    - Send requests with custom headers, body, method
    - Proxy requests through the backend for cookie inclusion
    - Format and cache responses

  - **`aiService.js`** – calls Google Gemini AI endpoints:
    - Generate JSON request bodies
    - Explain API responses
    - Generate code snippets
    - Explain/generate regex patterns
    - Generate color palettes

  - **`historyManager.js`** – persists API Tester logs:
    - Store up to 50 requests in `localStorage`
    - Retrieve and search history
    - Clear old entries

  - **UI Components:**
    - `DevKitLogo` – reusable logo component
    - `TerminalLine` – animated terminal-style text (used in hero section)

  ---

  ## 💡 Development Notes

  ### Architecture
  - **Monorepo structure:** Frontend (React) and Backend (Express) in separate folders
  - **Frontend-backend communication:** Axios with automatic cookie inclusion (`withCredentials: true`)
  - **Authentication flow:** JWT cookies with 7-day expiration, httpOnly flag for security
  - **User context restoration:** `AuthContext` fetches `/api/auth/me` on app load to hydrate user state

  ### Key Implementation Details
  - All components use functional React with hooks (no class components)
  - Themes toggled via `ThemeContext` with inline style objects and CSS variables
  - Password reset uses OTP flow: 6-digit code (10 min expiry) → reset token (10 min expiry) → password update
  - Account deletion cascades: deletes user doc from MongoDB, clears JWT cookie, optionally deletes associated snippets
  - Snippet schema fields: `user`, `title`, `code`, `language`, `tags`, `isPublic`, `createdAt`, `updatedAt`
  - User schema fields: `username`, `email`, `password` (hashed with bcrypt), `googleId` (for OAuth), `avatar`
  - AI routes use Google Gemini; easily swappable by changing `GEMINI_API_KEY` to `OPENAI_API_KEY` and adjusting logic
  - Server uses `authMiddleware` to verify JWT tokens on protected routes (validates token signature and expiration)

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
