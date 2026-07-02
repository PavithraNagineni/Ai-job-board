# ⚡ TalentAI — AI-Powered Job Board

A full-stack MERN application with OpenAI integration for intelligent candidate-job matching and auto-generated personalised cover letters.

## Tech Stack
- **Frontend:** React.js, React Router v6, Axios, React Hot Toast
- **Backend:** Node.js, Express.js
- **Database:** MongoDB + Mongoose ODM
- **Auth:** JWT (JSON Web Tokens) + bcryptjs
- **AI:** OpenAI GPT-3.5 API (matching, cover letters, job descriptions)

## Features

### For Candidates
- Browse and search job listings (by keyword, type, location)
- AI Match Score — instant compatibility score (0–100) with strengths & gap analysis
- AI Cover Letter Generator — personalised, tone-selectable cover letters
- Apply to jobs and track application status

### For Employers
- Post jobs with AI-assisted job description writing
- Dashboard with all listings, applicant counts, and status management
- View applicants ranked by AI match score
- Update application status: Pending → Reviewing → Shortlisted → Hired/Rejected

## Project Structure
```
ai-job-board/
├── backend/
│   ├── models/         # User, Job, Application
│   ├── routes/         # auth, jobs, applications, ai
│   ├── middleware/     # JWT protect, employerOnly, candidateOnly
│   └── server.js
└── frontend/
    └── src/
        ├── pages/      # Home, Login, Register, Jobs, JobDetail, PostJob, Dashboard, Profile, Applications
        ├── components/ # Navbar
        ├── context/    # AuthContext
        └── utils/      # api.js
```

## Setup Instructions

### 1. Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI, JWT secret, and OpenAI API key
npm run dev
```

### 2. Frontend
```bash
cd frontend
npm install
npm start
```

### 3. MongoDB
Make sure MongoDB is running locally, or use a MongoDB Atlas connection string in `.env`.

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | - | Register user |
| POST | /api/auth/login | - | Login |
| GET | /api/auth/me | ✓ | Get current user |
| PUT | /api/auth/profile | ✓ | Update profile |
| GET | /api/jobs | - | List all jobs |
| GET | /api/jobs/:id | - | Get single job |
| POST | /api/jobs | Employer | Create job |
| PUT | /api/jobs/:id | Employer | Update job |
| DELETE | /api/jobs/:id | Employer | Delete job |
| GET | /api/jobs/employer/mine | Employer | My jobs |
| POST | /api/applications | Candidate | Apply to job |
| GET | /api/applications/mine | Candidate | My applications |
| GET | /api/applications/job/:jobId | Employer | Job applicants |
| PUT | /api/applications/:id/status | Employer | Update status |
| POST | /api/ai/match | ✓ | AI match score |
| POST | /api/ai/cover-letter | ✓ | Generate cover letter |
| POST | /api/ai/job-description | ✓ | Generate job description |

## Environment Variables
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/ai-job-board
JWT_SECRET=your_super_secret_jwt_key
OPENAI_API_KEY=sk-...
```

## Pages (8 React pages)
1. **/** — Homepage with features & stats
2. **/register** — Role-select signup (Candidate or Employer)
3. **/login** — Login
4. **/jobs** — Job listings with search & filter
5. **/jobs/:id** — Job detail with AI match + cover letter + apply
6. **/post-job** — Employer: post job with AI description generator
7. **/dashboard** — Employer: manage listings, view applicants with AI scores
8. **/applications** — Candidate: track all applications + AI match scores
9. **/profile** — Profile editor + resume text for AI

## Live Demo
https://ai-job-board-rosy.vercel.app/

## Author 
  Pavithra Nagineni
