# DeadlineGuard 🛡️

> AI-powered productivity companion that proactively helps you complete tasks before deadlines are missed.

---

## GitHub OAuth2 Setup (one-time, 2 minutes)

1. Go to **https://github.com/settings/applications/new**
2. Fill in:
   - **Application name**: `DeadlineGuard`
   - **Homepage URL**: `http://localhost:8080`
   - **Authorization callback URL**: `http://localhost:8080/login/oauth2/code/github`
3. Click **Register application**
4. Copy **Client ID** and generate a **Client Secret**
5. Paste them into `deadlineguard-api/src/main/resources/application.properties`:
   ```properties
   spring.security.oauth2.client.registration.github.client-id=YOUR_CLIENT_ID
   spring.security.oauth2.client.registration.github.client-secret=YOUR_CLIENT_SECRET
   ```

---

## Quick Start

### 1. Build & Run the Backend

```bash
cd deadlineguard-api
mvn --batch-mode package -DskipTests
java -jar target/deadlineguard-api-1.0.0.jar
```

The API will start at **http://localhost:8080**.  
Demo data is seeded automatically (6 tasks, 4 risk tiers, 1 nudge).

### 2. Run the Frontend

```bash
cd deadlineguard-ui
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## What You'll See Immediately

| Feature | Description |
|---|---|
| **Dashboard** | 6 pre-seeded tasks with live risk scores (CRITICAL → LOW) |
| **Risk Badges** | Color-coded: 🔴 Critical, 🟠 High, 🟡 Medium, 🟢 Low |
| **Nudge Toast** | Critical nudge fires immediately at bottom-right |
| **Task Detail** | Click any task → slide-in panel with subtasks |
| **Subtask Checklist** | Click subtasks to mark complete — risk score updates |
| **AI Draft** | Click "Generate AI Draft" on email/document tasks |
| **Create Task** | Click "New Task" → auto-decomposed into subtasks instantly |
| **Check-In** | Type or speak your plans → parsed into structured tasks |
| **Insights** | Procrastination patterns detected from your task history |

---

## Demo Walkthrough

### 1. Dashboard Overview
- See 6 tasks sorted by risk: 2 CRITICAL, 1 HIGH, 2 MEDIUM, 1 LOW
- The critical "Machine Learning Assignment" task glows red

### 2. Trigger the Risk Engine (Demo Button)
- Click **"Run Risk Engine"** in the top bar
- Risk scores recalculate live; new nudges fire for high-risk tasks

### 3. Create a New Task
- Click **"New Task"** → fill in title (e.g. "Prepare job application")
- Set deadline to tonight, type = EMAIL, importance = 5
- Hit "Create Task" → watch the spinner → subtasks appear instantly

### 4. Open Task Details
- Click any task card → slide-in panel from right
- Check off subtasks → progress bar updates
- For EMAIL tasks → click "Generate AI Draft" → copy-ready email appears

### 5. Morning Check-In
- Navigate to **Check-In** tab
- Type: "I need to email my professor about an extension and finish my algorithms homework"
- Click Submit → 2 tasks extracted and added to dashboard

### 6. Insights
- Navigate to **Insights** tab
- See "Last-Minute Starter", "Coding Effort Underestimation", "Peak Focus Window" cards

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/tasks?userId=1` | Get active tasks sorted by risk |
| POST | `/api/tasks` | Create task (triggers auto-decomposition) |
| PUT | `/api/tasks/{id}` | Update task |
| DELETE | `/api/tasks/{id}` | Delete task |
| PATCH | `/api/subtasks/{id}/complete` | Mark subtask complete |
| GET | `/api/nudges?userId=1` | Get active nudges |
| POST | `/api/nudges/{id}/dismiss` | Dismiss nudge |
| POST | `/api/checkins` | Process check-in transcript |
| POST | `/api/drafts` | Generate AI draft for task |
| GET | `/api/insights?userId=1` | Get procrastination patterns |
| POST | `/api/admin/trigger-risk-engine` | Manually run risk engine (demo) |

## H2 Console
URL: http://localhost:8080/h2-console  
JDBC URL: `jdbc:h2:mem:deadlineguard`  
Username: `sa` | Password: _(blank)_

---

## Adding a Real Claude API Key (When Available)

Edit `deadlineguard-api/src/main/resources/application.properties`:
```properties
claude.api.key=sk-ant-your-real-key-here
```

Then update `ClaudeService.java`: set `USE_MOCK = false` and implement the WebClient call in each method.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Java 8 + Spring Boot 2.7.18 |
| Database | H2 in-memory (zero setup) |
| AI | Mock Claude (drop-in API key upgrade path) |
| Frontend | React 18 + TypeScript + Tailwind CSS 3 |
| State | Zustand + React Query |
| Build | Maven 3 + Vite 5 |
| Voice | Web Speech API (Chrome/Edge) |
