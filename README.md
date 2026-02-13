# 🎵 Music Streaming API

A RESTful backend API for a music streaming platform built with **Node.js**, **Express**, and **MongoDB**. It supports user authentication, role-based access control (User & Artist), music file uploads via **ImageKit**, and album management.

---

## 📑 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Endpoints](#-api-endpoints)
  - [Authentication](#authentication)
  - [Music](#music)
  - [Albums](#albums)
- [Data Models](#-data-models)
- [Authentication & Authorization](#-authentication--authorization)

---

## ✨ Features

- **User Registration & Login** — Secure sign-up and sign-in with hashed passwords (bcrypt).
- **JWT Authentication** — Token-based auth stored in HTTP cookies for session management.
- **Role-Based Access Control** — Two roles: `user` (can browse/listen) and `artist` (can upload music & create albums).
- **Music Upload** — Artists can upload music files which are stored on **ImageKit** cloud storage.
- **Album Management** — Artists can create albums and group multiple music tracks together.
- **Secure Logout** — Clears the authentication cookie on logout.

---

## 🛠 Tech Stack

| Technology                                                   | Purpose                         |
| ------------------------------------------------------------ | ------------------------------- |
| [Express.js](https://expressjs.com/) (v5)                    | Web framework                   |
| [MongoDB](https://www.mongodb.com/) + Mongoose (v9)          | Database & ODM                  |
| [JSON Web Tokens](https://jwt.io/)                           | Authentication                  |
| [bcryptjs](https://www.npmjs.com/package/bcryptjs)           | Password hashing                |
| [ImageKit](https://imagekit.io/)                             | Cloud file storage for music    |
| [Multer](https://www.npmjs.com/package/multer)               | Multipart file upload handling  |
| [cookie-parser](https://www.npmjs.com/package/cookie-parser) | Cookie parsing middleware       |
| [cors](https://www.npmjs.com/package/cors)                   | Cross-Origin Resource Sharing   |
| [dotenv](https://www.npmjs.com/package/dotenv)               | Environment variable management |

---

## 📁 Project Structure

```
project-2/
├── server.js                        # Entry point — starts the server & connects to DB
├── package.json                     # Project metadata & dependencies
├── .env                             # Environment variables (not committed)
├── .gitignore
└── src/
    ├── app.js                       # Express app setup, middleware & route mounting
    ├── db/
    │   └── db.js                    # MongoDB connection using Mongoose
    ├── models/
    │   ├── user.model.js            # User schema (username, email, password, role)
    │   ├── music.model.js           # Music schema (uri, title, artist reference)
    │   └── album.model.js           # Album schema (title, artist, music references)
    ├── controllers/
    │   ├── auth.controller.js       # Register, Login, Logout logic
    │   └── music.controller.js      # Music upload, Album CRUD logic
    ├── routes/
    │   ├── auth.routes.js           # Auth endpoints (/api/auth/*)
    │   └── music.routes.js          # Music endpoints (/api/music/*)
    ├── middlewares/
    │   └── auth.middleware.js       # JWT verification & role-based guards
    └── services/
        └── storage.service.js       # ImageKit file upload service
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [MongoDB](https://www.mongodb.com/) instance (local or Atlas)
- [ImageKit](https://imagekit.io/) account (for file storage)

### Installation

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd project-2

# 2. Install dependencies
npm install

# 3. Create a .env file (see section below)

# 4. Start the development server
npm run dev
```

### Available Scripts

| Script        | Command                 | Description                                        |
| ------------- | ----------------------- | -------------------------------------------------- |
| `npm run dev` | `npx nodemon server.js` | Start dev server with auto-restart on file changes |
| `npm start`   | `node server.js`        | Start production server                            |

---

## 🔐 Environment Variables

Create a `.env` file in the project root with the following variables:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/your-database-name
JWT_SECRET=your-jwt-secret-key
IMAGEKIT_PRIVATE_KEY=your-imagekit-private-key
```

| Variable               | Description                                |
| ---------------------- | ------------------------------------------ |
| `PORT`                 | Port number the server listens on          |
| `MONGODB_URI`          | MongoDB connection string                  |
| `JWT_SECRET`           | Secret key for signing JWT tokens          |
| `IMAGEKIT_PRIVATE_KEY` | Private API key for ImageKit cloud storage |

---

## 📡 API Endpoints

### Authentication

All auth routes are prefixed with `/api/auth`.

| Method | Endpoint    | Description            | Auth Required |
| ------ | ----------- | ---------------------- | ------------- |
| POST   | `/register` | Register a new user    | ❌            |
| POST   | `/login`    | Login with credentials | ❌            |
| POST   | `/logout`   | Logout current user    | ❌            |

#### `POST /api/auth/register`

Register a new user account.

**Request Body:**

```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securepassword",
  "role": "user" // optional, defaults to "user". Use "artist" for artist accounts.
}
```

**Success Response (201):**

```json
{
  "message": "User registered successfully",
  "user": {
    "id": "64f...",
    "username": "john_doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

> A `token` cookie is automatically set on successful registration.

---

#### `POST /api/auth/login`

Login with an existing account.

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "securepassword"
}
```

> You can also use `username` instead of (or in addition to) `email`.

**Success Response (200):**

```json
{
  "message": "User logged in successfully",
  "user": {
    "id": "64f...",
    "username": "john_doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

---

#### `POST /api/auth/logout`

Clears the auth cookie and logs out the user.

**Success Response (200):**

```json
{
  "message": "User logged out successfully"
}
```

---

### Music

All music routes are prefixed with `/api/music`.

| Method | Endpoint  | Description              | Auth Required  |
| ------ | --------- | ------------------------ | -------------- |
| GET    | `/`       | Get all music tracks     | ✅ User        |
| POST   | `/upload` | Upload a new music track | ✅ Artist only |

#### `GET /api/music/`

Fetch all available music tracks. Requires a logged-in **user**.

**Success Response (200):**

```json
{
  "message": "Musics fetched successfully",
  "musics": [
    {
      "_id": "64f...",
      "uri": "https://ik.imagekit.io/...",
      "title": "My Song",
      "artist": "64f..."
    }
  ]
}
```

---

#### `POST /api/music/upload`

Upload a music file. Requires a logged-in **artist**.

**Request:** `multipart/form-data`

| Field   | Type   | Description              |
| ------- | ------ | ------------------------ |
| `title` | string | Title of the music track |
| `file`  | file   | The music file to upload |

**Success Response (201):**

```json
{
  "message": "Music created successfully",
  "music": {
    "id": "64f...",
    "title": "My Song",
    "uri": "https://ik.imagekit.io/...",
    "artist": "64f..."
  }
}
```

---

### Albums

Album routes are also under the `/api/music` prefix.

| Method | Endpoint          | Description                | Auth Required  |
| ------ | ----------------- | -------------------------- | -------------- |
| GET    | `/album`          | Get all albums             | ✅ User        |
| GET    | `/album/:albumId` | Get a specific album by ID | ✅ User        |
| POST   | `/create-album`   | Create a new album         | ✅ Artist only |

#### `POST /api/music/create-album`

Create a new album. Requires a logged-in **artist**.

**Request Body:**

```json
{
  "title": "My Album",
  "musics": ["<music_id_1>", "<music_id_2>"]
}
```

**Success Response (201):**

```json
{
  "message": "Album created successfully",
  "album": {
    "id": "64f...",
    "title": "My Album",
    "artist": "64f...",
    "musics": ["64f...", "64f..."]
  }
}
```

---

#### `GET /api/music/album`

Fetch all albums with artist info populated.

**Success Response (200):**

```json
{
  "message": "Albums fetched successfully",
  "albums": [
    {
      "_id": "64f...",
      "title": "My Album",
      "artist": {
        "_id": "64f...",
        "username": "artist_name",
        "email": "artist@example.com"
      }
    }
  ]
}
```

---

#### `GET /api/music/album/:albumId`

Fetch a single album by its ID, with populated artist and music details.

**Success Response (200):**

```json
{
  "message": "Album fetched successfully",
  "album": {
    "_id": "64f...",
    "title": "My Album",
    "artist": {
      "_id": "64f...",
      "username": "artist_name",
      "email": "artist@example.com"
    },
    "musics": [
      {
        "_id": "64f...",
        "title": "Track 1",
        "uri": "https://ik.imagekit.io/..."
      }
    ]
  }
}
```

---

## 📦 Data Models

### User

| Field      | Type   | Description                                       |
| ---------- | ------ | ------------------------------------------------- |
| `username` | String | Unique username                                   |
| `email`    | String | Unique email address                              |
| `password` | String | Hashed password (bcrypt)                          |
| `role`     | String | Either `"user"` or `"artist"` (default: `"user"`) |

### Music

| Field    | Type     | Description                             |
| -------- | -------- | --------------------------------------- |
| `uri`    | String   | URL of the uploaded file on ImageKit    |
| `title`  | String   | Title of the music track                |
| `artist` | ObjectId | Reference to the `User` who uploaded it |

### Album

| Field    | Type       | Description                              |
| -------- | ---------- | ---------------------------------------- |
| `title`  | String     | Title of the album                       |
| `artist` | ObjectId   | Reference to the `User` who created it   |
| `musics` | [ObjectId] | Array of references to `Music` documents |

---

## 🔒 Authentication & Authorization

This API uses **JWT (JSON Web Tokens)** for authentication. Tokens are stored as **HTTP cookies** (named `token`) and automatically sent with each request.

### How It Works

1. On **register** or **login**, a JWT containing the user's `id` and `role` is generated and set as a cookie (expires in 1 day).
2. Protected routes use middleware to **verify the token** from the cookie.
3. **Role-based guards** restrict access:
   - `authUser` — Only allows users with the `"user"` role.
   - `authArtist` — Only allows users with the `"artist"` role.
4. On **logout**, the token cookie is cleared.

### Error Responses

| Status | Message                 | Meaning                          |
| ------ | ----------------------- | -------------------------------- |
| 400    | All fields are required | Missing required fields          |
| 401    | Invalid credentials     | Wrong username/email or password |
| 401    | Unauthorized            | Missing or invalid JWT token     |
| 403    | Access Forbidden        | Role does not match endpoint     |
| 422    | User already exists     | Duplicate username or email      |
| 500    | Internal server error   | Unexpected server error          |

---

## 📝 License

ISC
