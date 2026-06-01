# YelpCamp

A full-stack campground listing and review platform. Users discover, post, and review campsites — with interactive maps, multi-image uploads, and AI-assisted listing creation.

**Live Demo:** _coming soon_

---

## Features

- **Authentication** — register, log in, and log out with Passport local strategy; protected routes redirect unauthenticated users
- **Authorization** — campground and review CRUD is scoped to the owner; middleware enforces this server-side
- **AI Description Generator** — fill in title and location, click "Generate with AI," and GPT-4o-mini drafts a campground description you can edit before posting
- **Interactive Maps** — individual campground pages show a precise Mapbox pin; the listings index shows a clustered overview map
- **Multi-image Uploads** — Cloudinary-backed uploads with the ability to selectively delete images on edit
- **Reviews** — authenticated users leave star-rated reviews on any campground; only the review author can delete their own
- **Flash Messages** — success and error feedback on every write operation
- **Security** — Helmet.js Content Security Policy, express-mongo-sanitize (NoSQL injection prevention), rate-aware session storage, httpOnly and production-secure cookies
- **Persistent Sessions** — connect-mongo stores sessions in MongoDB Atlas so sessions survive server restarts

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| Database | MongoDB (Mongoose ODM) |
| Session store | connect-mongo + MongoDB Atlas |
| Auth | Passport.js (passport-local, passport-local-mongoose) |
| Templating | EJS + ejs-mate |
| Maps | Mapbox GL JS + Mapbox Geocoding SDK |
| Image hosting | Cloudinary (multer-storage-cloudinary) |
| AI | OpenAI GPT-4o-mini (chat completions) |
| Security | Helmet.js, express-mongo-sanitize |
| UI | Bootstrap 5, custom CSS |
| Validation | Joi (server-side), Bootstrap validation (client-side) |
| Deployment | Railway + MongoDB Atlas |

---

## Local Setup

### Prerequisites

- Node.js v18+
- MongoDB running locally, or a [MongoDB Atlas](https://cloud.mongodb.com) free cluster
- Accounts for [Cloudinary](https://cloudinary.com), [Mapbox](https://mapbox.com), and [OpenAI](https://platform.openai.com)

### Steps

```bash
git clone https://github.com/Kush1601/YelpCamp.git
cd YelpCamp
npm install
```

Copy the example env file and fill in your keys:

```bash
cp .env.example .env
```

Seed the database with sample campgrounds (optional):

```bash
node seeds/index.js
```

Start the development server:

```bash
npm run dev
```

Visit `http://localhost:3000`.

---

## Environment Variables

| Variable | Where to get it |
|---|---|
| `DB_URL` | MongoDB Atlas connection string (omit for local Mongo) |
| `SESSION_SECRET` | Any long random string — run `openssl rand -hex 32` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary dashboard → Settings → Account |
| `CLOUDINARY_KEY` | Cloudinary dashboard → Settings → API Keys |
| `CLOUDINARY_SECRET` | Cloudinary dashboard → Settings → API Keys |
| `MAPBOX_TOKEN` | mapbox.com → Account → Tokens |
| `OPENAI_API_KEY` | platform.openai.com → API Keys |

Without `OPENAI_API_KEY` the AI generate button will return an error; everything else still works.

---

## Project Structure

```
YelpCamp/
├── controllers/       # Route handler logic (campgrounds, users, reviews)
├── models/            # Mongoose schemas (Campground, User, Review)
├── routes/            # Express Router definitions
├── views/             # EJS templates (layouts, partials, pages)
├── public/            # Static assets (CSS, client JS)
├── cloudinary/        # Multer + Cloudinary storage config
├── utils/             # catchAsync wrapper, ExpressError class
├── seeds/             # Database seed script (~300 sample campgrounds)
├── middleware.js       # isLoggedIn, isAuthor, validateCampground, validateReview
├── schemas.js         # Joi validation schemas with XSS sanitization
└── app.js             # Express app entry point
```

---

## License

MIT
