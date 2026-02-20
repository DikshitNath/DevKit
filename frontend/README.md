# API Tester Component

A lightweight, interactive React component for testing HTTP APIs with a modern dark UI. Built with React, Axios, and Tailwind CSS.

## Features

✨ **HTTP Methods Support** - GET, POST, PUT, PATCH, DELETE  
🔧 **Custom Headers** - Add/remove request headers dynamically  
📝 **Request Body** - JSON body editor for POST/PUT/PATCH requests  
⚡ **Response Viewer** - Pretty-printed JSON responses with status codes  
⏱️ **Performance Metrics** - Request time tracking (milliseconds)  
🌐 **Proxy Support** - Automatic proxy routing for localhost requests  
🎨 **Dark Theme** - Modern violet-accented dark UI using Tailwind CSS  
❌ **Error Handling** - JSON validation and network error display  

## Component Structure

```
ApiTester/
├── index.jsx           # Main component (state management & UI)
├── HeadersEditor.jsx   # Dynamic header key-value editor
├── BodyEditor.jsx      # JSON request body textarea
└── ResponseViewer.jsx  # Response display with status & timing
```

## Installation

### Dependencies

```bash
npm install axios react-json-pretty
```

### Tailwind CSS

Ensure Tailwind CSS is configured in your project. This component uses utilities like `bg-gray-950`, `text-violet-400`, etc.

## Usage

```jsx
import ApiTester from './components/ApiTester'

export default function App() {
  return <ApiTester />
}
```

## Component Features Breakdown

### Main Component (`index.jsx`)

**State Management:**
- `url` - API endpoint URL
- `method` - HTTP method (GET, POST, PUT, PATCH, DELETE)
- `headers` - Array of key-value header objects
- `body` - JSON request body
- `response` - API response object
- `loading` - Request in-progress state
- `error` - Error messages
- `timeTaken` - Request duration in milliseconds

**Core Functionality:**
- Validates JSON body before submission
- Tracks request execution time
- Handles both successful and error responses
- Displays error response bodies on HTTP errors

### Headers Editor (`HeadersEditor.jsx`)

Add, edit, and remove custom HTTP headers:
- Dynamic row management
- Key-value pair inputs
- Remove button for each header
- Add new header button

### Body Editor (`BodyEditor.jsx`)

JSON request body editor with:
- Multi-line textarea
- JSON placeholder example
- Monospace font for code readability

### Response Viewer (`ResponseViewer.jsx`)

Displays API responses with:
- Status code and status text
- Color-coded status (green for 2xx, red for errors)
- Response time in milliseconds
- Pretty-printed JSON formatting via react-json-pretty

## Utility Functions (`src/utils/apiTester.js`)

### `sendRequest(options)`

Sends an API request with automatic proxy handling.

**Parameters:**
```javascript
{
  url: string,          // API endpoint
  method: string,       // HTTP method
  headers: Array,       // [{ key, value }, ...]
  body: string          // JSON string (optional)
}
```

**Features:**
- **Localhost Detection**: Automatically routes `localhost:3000` and `127.0.0.1` requests through local proxy
- **Proxy Fallback**: Non-local requests go through `/proxy` endpoint
- **JSON Parsing**: Validates and parses request body
- **Error Handling**: Throws clear errors for invalid JSON
- **Credentials**: Includes credentials for localhost requests

**Returns:**
```javascript
{
  status: number,
  statusText: string,
  data: any,
  timeTaken: number     // milliseconds
}
```

## How It Works

### Local Requests (Localhost)
1. Detects if URL contains `localhost` or `127.0.0.1`
2. Strips the domain portion
3. Sends request with `withCredentials: true`
4. Tracks response time

### Remote Requests
1. Sends to `/proxy` endpoint
2. Proxy endpoint handles the actual API call
3. Returns response data

## Example Usage

### GET Request
```
Method: GET
URL: https://jsonplaceholder.typicode.com/users
Headers: (none needed)
Body: (empty)
```

### POST Request
```
Method: POST
URL: https://jsonplaceholder.typicode.com/posts
Headers:
  - key: Content-Type
    value: application/json
Body:
{
  "title": "Test Post",
  "body": "This is a test",
  "userId": 1
}
```

## Styling

All styles use **Tailwind CSS** with a dark theme:
- Background: `bg-gray-950` / `bg-gray-900`
- Text: `text-white` / `text-gray-400`
- Accent Color: `text-violet-400` / `bg-violet-600`
- Borders: `border-gray-700`

Customize by modifying the className values in the JSX files.

## Error Handling

- **Invalid JSON**: Shows "Invalid JSON in request body" error
- **Network Errors**: Displays error message in red
- **HTTP Errors**: Shows the error response status and body
- **Missing URL**: Send button is disabled

## Browser Support

Works in all modern browsers supporting:
- ES6+ JavaScript
- React 16.8+ (hooks)
- Axios

## Dependencies Summary

| Package | Version | Purpose |
|---------|---------|---------|
| `react` | - | Component framework |
| `axios` | - | HTTP client |
| `react-json-pretty` | - | Response formatting |
| `tailwind` | - | Styling |

