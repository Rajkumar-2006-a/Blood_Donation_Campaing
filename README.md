# Blood Donation Platform 🩸

A comprehensive Full-Stack Blood Donation Web Application designed to connect blood donors, blood banks, and recipients seamlessly. This platform introduces a modern approach to managing blood inventories, organizing blood camps, and features an integrated AI-powered Chatbot for instant donor discovery and query resolution.

---

## 🌟 Key Functionalities 

### 1. Authentication & Role Management
* **Roles:** Admin, Donor, and Recipient.
* **Standard Login:** Secure registration and login using JWT (JSON Web Tokens) and Bcrypt password hashing.
* **Google OAuth integration:** Users can quickly sign up or log in using their Google account. 
* **Role-Based Access Control:** Distinct views and authority for Admins vs. Users in dashboards.

### 2. Blood Inventory & Donor Search
* **Live Inventory Tracking:** Keep an updated log of available blood units across diverse hospitals and blood banks.
* **Donor Search:** Quickly search for active donors by Blood Group and Location.

### 3. Blood Donation Camps
* **Camp Requests:** Organizations or institutions can submit requests to hold a blood donation camp.
* **Admin Controls:** Admins review proposals and can `Approve` or `Reject` them. 
* **Automated Notifications:** Upon camp approval, eligible donors (matching specific criteria, e.g., registered as a donor with a supported email) automatically receive notification emails.
* **Attendance System:** An integrated attendance module where admins mark donor presence ("Present"/"Absent"), which instantly updates the donor's `donations_count` profile metric securely using database transactions.

### 4. AI-Powered Assistant (Groq SDK)
* **Intent Recognition:** An embedded Llama-3.1 powered engine analyzes natural language requests to classify user intent (e.g., `greeting`, `find_donor`, `eligibility`, `camp`).
* **Smart Donor Locating:** If a user searches for a donor exactly matching a location and none are found, the AI smartly detects the broader district and nearby towns to fulfill the request.
* **Conversational AI:** Gracefully handles general and medical queries regarding blood donations in a conversational manner.

### 5. Frontend & Theming
* **Dark / Light Mode:** A dynamic `ThemeContext` automatically manages UI theme persistence throughout the app.
* **Interactive UI:** Smooth dashboard handling with React Router, distinct User and Admin dashboards, and a specialized Chatbot UI element.

---

## 🛠 Tech Stack

### Frontend
* **React 19** (Vite build engine)
* **React Router DOM** (Routing mechanism)
* **Lucide React** (Iconography)
* **@react-oauth/google** (OAuth2 handling)

### Backend
* **Node.js + Express.js** (API Framework)
* **MySQL2** (Relational Database with Connection Pooling)
* **Bcrypt.js & JWT** (Security and session control)
* **Groq SDK** (AI Intent & Generation Layer via Llama 3 models)
* **EmailJS / Nodemailer** (Transactional emails)

---

## ⚙️ Business Logic & Flow

### User Sign-Up Flow
When a user registers, they define their basic info and set a flag `is_donor`. Admins cannot register via the public form directly. Passwords are salted and hashed. Upon subsequent login, a JWT is generated granting the user either a `donor`, `recipient`, or `admin` role which restricts backend route access.

### The AI Search Engine Logic
When a user interactively asks the chatbot "I need A+ blood in Chennai":
1. **Extraction:** Groq processes the text and replies with an exact JSON string `{"intent": "find_donor", "blood_group": "A+", "location": "Chennai"}`.
2. **First DB Pass:** The backend queries the `users` database for exact location matches.
3. **Fallback Logic:** If no donors exist in Chennai, the script asks Groq to provide the "District" and "Nearby Areas" for 'Chennai'. 
4. **Second DB Pass:** The backend uses the `IN` clause to search the newly formatted broader district array.
5. **Return Data:** The system returns the donor’s contact information directly to the chatbot UI.

### Camp Attendance Logic
Attendance is securely handled using SQL transactions:
1. Admin triggers a presence update.
2. An `INSERT ... ON DUPLICATE KEY UPDATE` is executed into the `attendance` mapping table.
3. The system recalculates exactly how many `Present` records an individual user has to accurately compute total lifetime donations.
4. The `users.donations_count` table is updated respectively.

---

## 🚀 Environment Setup

### 1. Database Setup
Ensure you have a MySQL server running and create a database (default target is `blood_donation_db`).

### 2. Backend Config
Navigate to the `Backend` directory, copy `.env.example` to `.env` (or create one), and fill in these variables:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=blood_donation_db

# Security & Services
JWT_SECRET=your_jwt_secret 
GROQ_API_KEY=your_groq_api_key
```
Start server:
```bash
npm install
npm run start
```

### 3. Frontend Config
Navigate to the `Frontend` directory, create a `.env` file:
```env
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
```
Start frontend:
```bash
npm install
npm run dev
```

---

## 📂 Project Structure

```text
Blood_Donation/
├── Backend/
│   ├── config/          # DB connection configuration (db.js)
│   ├── controllers/     # Business logic handlers (auth, ai, camp, inventory)
│   ├── routes/          # Express route definitions
│   ├── utils/           # Helper scripts (Email dispatchers)
│   ├── server.js        # Backend entry point
│   └── package.json
│
└── Frontend/
    ├── public/          # Static assets
    ├── src/
    │   ├── App.jsx            # Application Router
    │   ├── ThemeContext.jsx   # Context wrapper for Dark/Light mode
    │   ├── ChatBot.jsx        # Conversational UI
    │   ├── Loginpage.jsx      # Base auth component
    │   ├── AdminDashboard.jsx # Admin management portal
    │   ├── UserDashboard.jsx  # standard user portal
    │   └── main.jsx           # React DOM renderer
    ├── index.html
    ├── vite.config.js
    └── package.json
```
