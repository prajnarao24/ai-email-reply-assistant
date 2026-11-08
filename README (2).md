# AI Email Reply Assistant

A Chrome extension that generates context-aware email replies **inside Gmail**, powered by a **Java Spring Boot** backend and Google's **Gemini API**.

Open an email, click Reply, choose a tone and length, and the AI drafts a response in the reply box. You can edit it before sending. The extension never sends emails automatically.

<!-- Add screenshots here, for example: -->
<!-- ![AI Reply panel in Gmail](screenshots/panel.png) -->

## How it works

```
Gmail  ->  Chrome Extension  ->  Spring Boot REST API  ->  Gemini API
(JS/CSS)      (reads email,        (validates input,       (writes the
              sends request)        builds prompt)           reply)
                    ^                                          |
                    +------------- reply text -----------------+
```

1. The extension adds a panel (tone, length, extra instruction, **AI Reply** button) next to Gmail's Send button.
2. On click, it reads the email being replied to and sends it as JSON to `POST /api/email/generate`.
3. The backend validates the request, builds a prompt and calls the Gemini API.
4. The generated reply comes back and is typed into Gmail's reply box.

## Features

- AI reply generation based on the received email
- Tone selection: Professional, Friendly, Formal, Casual
- Reply length: Short, Medium, Detailed
- Optional extra instruction (for example, "mention I'm free on Friday")
- Input validation with clear `400` error messages
- Global exception handling (`400` for bad input, `500` for server or API failures)
- CORS configured so the extension can call the backend
- API key kept on the backend, never in the extension or the repository

## Tech stack

| Area | Technology |
| --- | --- |
| Backend | Java 21, Spring Boot, Maven |
| AI | Google Gemini API |
| Extension | JavaScript, HTML, CSS, Chrome Manifest V3 |
| Communication | REST API (JSON over HTTP) |

## Project structure

```
EmailReplyGenerator/
├── backend/
│   ├── src/main/java/com/emailgenerator/email_reply_generator/
│   │   ├── EmailReplyGeneratorApplication.java
│   │   ├── controller/EmailController.java        # receives HTTP requests
│   │   ├── service/GeminiService.java             # validation, prompt, Gemini call
│   │   ├── model/EmailRequest.java                # request data (JSON -> object)
│   │   └── exception/GlobalExceptionHandler.java  # clean error responses
│   ├── src/main/resources/application.properties
│   ├── .env.example
│   └── pom.xml
└── chrome-extension/
    ├── manifest.json
    ├── content.js
    └── styles.css
```

## API

**POST** `/api/email/generate`

Request body:

```json
{
  "emailContent": "Can we meet tomorrow?",
  "tone": "friendly",
  "length": "short",
  "extraInstruction": "mention I'm free after 3 PM"
}
```

| Field | Required | Allowed values |
| --- | --- | --- |
| `emailContent` | yes | text, up to 5000 characters |
| `tone` | yes | `professional`, `friendly`, `formal`, `casual` |
| `length` | yes | `short`, `medium`, `detailed` |
| `extraInstruction` | no | text, up to 300 characters |

Response: the generated reply as plain text.
Invalid input returns `400` with a message. Other failures return `500`.

## Run it locally

### Prerequisites

- JDK 21 or newer
- IntelliJ IDEA (or any IDE with Maven support)
- A free Gemini API key from [Google AI Studio](https://aistudio.google.com)
- Google Chrome

### 1. Start the backend

1. Go to the `backend` folder, copy `.env.example` and rename the copy to `.env`.
2. Open `.env` and put your key in it:
   ```
   GEMINI_API_KEY=your_real_key
   ```
3. Open the `backend` folder in IntelliJ and run `EmailReplyGeneratorApplication`.
4. Wait for `Tomcat started on port 8080`.

The `.env` file is listed in `.gitignore`, so your key is never uploaded.

You can also set `GEMINI_API_KEY` as a normal environment variable instead of using `.env`.

### 2. Load the extension

1. Open `chrome://extensions` in Chrome.
2. Turn on **Developer mode**.
3. Click **Load unpacked** and select the `chrome-extension` folder.
4. Open Gmail, open an email and click **Reply**. The AI panel appears next to the Send button.

### Quick API test (PowerShell)

```powershell
Invoke-RestMethod -Uri http://localhost:8080/api/email/generate -Method Post -ContentType "application/json" -Body '{"emailContent":"Can we meet tomorrow?","tone":"friendly","length":"short"}'
```

## Security notes

- The Gemini API key lives only on the backend (environment variable or `.env`).
- Only the text of the email being replied to is sent to the backend.
- Replies are always reviewed by the user. Emails are never sent automatically.
- CORS is currently open (`*`) for development. For production, restrict it to the extension's origin.

## Future improvements

- Deploy the backend over HTTPS and point the extension to the hosted URL
- Save reply history in a database (Spring Data JPA)
- Rate limiting to protect the API key
- Unit tests with JUnit and Mockito
- Reply language option and "summarize email" button
- Publish the extension on the Chrome Web Store

## Author

Prajna Rao
