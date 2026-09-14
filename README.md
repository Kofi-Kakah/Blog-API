📰 Blog API

<p align="center">
  <strong>A RESTful API for a blog and social publishing application with authentication, posts, comments, likes, and user following.</strong>
</p>

<p align="center">
  Built with Node.js, Express 5, Prisma 7, PostgreSQL, JWT, and an HTTP-only authentication cookie.
</p>

<p align="center">








</p>

<p align="center">

Quick Start ·
API Reference ·
Authentication ·
Database ·
Testing ·
Security

</p>

📖 Table of Contents

Features

Tech Stack

Architecture

Project Structure

Requirements

Quick Start

Environment Variables

Database Setup

Running the API

Authentication

API Reference

Authentication and Profile

Posts

Comments and Likes

Following

Postman Testing

Verification Commands

Common Problems

Security Notes

Current Limitations

License

✨ Features

🔐 Authentication

Create a user account

Log in with email and password

Receive a signed JWT in the auth_token HTTP-only cookie

View the authenticated user's profile

Log out and clear the authentication cookie

Password hashes are stored instead of plain-text passwords

📰 Posts

Create posts for the authenticated user

List posts from the platform

Include basic author information with posts

Enforce post ownership checks

💬 Comments

Add comments to posts

Associate comments with the authenticated user

Store comments directly against posts

❤️ Likes

Like posts

Prevent the same user from liking the same post more than once

Store likes as post/user relationships

👥 Following

Follow another user

Prevent duplicate follow relationships

Prevent users from following themselves

Enforce follower ownership checks

🧰 Tech Stack

Technology

Purpose

Node.js

JavaScript runtime

Express 5

REST API framework

Prisma 7

ORM and database access

PostgreSQL

Relational database

JWT

Authentication

HTTP-only Cookies

Authentication token storage

tsx

Runs the JavaScript entry point with the generated Prisma TypeScript client

🏗️ Architecture

The API follows a modular controller → route → middleware → database architecture.

                         ┌─────────────────┐
                         │     Client      │
                         └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │  Express Server │
                         └────────┬────────┘
                                  │
              ┌───────────────────┼───────────────────┐
              │                   │                   │
              ▼                   ▼                   ▼
       ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
       │ Auth Routes │     │ Post Routes │     │ User Routes │
       └──────┬──────┘     └──────┬──────┘     └──────┬──────┘
              │                   │                   │
              └───────────────────┼───────────────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │ Auth Middleware │
                         └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │   Controllers   │
                         └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │     Prisma      │
                         └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │   PostgreSQL    │
                         └─────────────────┘

📁 Project Structure

Blog-API/
│
├── controllers/
│   ├── auth.controllers.js       # Authentication and profile handlers
│   ├── follow.controllers.js     # Follow handler
│   ├── post.controller.js        # Post handlers
│   └── user.controller.js        # Comment and like handlers
│
├── generated/
│   └── prisma/                   # Generated Prisma client; ignored by Git
│
├── libs/
│   └── jwt.js                    # JWT signing and verification helpers
│
├── middleware/
│   └── auth.middleware.js        # JWT cookie authentication guard
│
├── prisma/
│   ├── migrations/               # Prisma migration history
│   └── schema.prisma             # Database models and relations
│
├── routes/
│   ├── auth.routes.js            # Signup, login, logout, profile
│   ├── follow.route.js           # Follow endpoints
│   ├── post.route.js             # Post endpoints
│   └── user.route.js             # Comment and like endpoints
│
├── prisma.config.ts              # Prisma CLI configuration
├── prisma.ts                     # Prisma client singleton and PostgreSQL adapter
├── server.js                     # Express application entry point
├── package.json                  # Scripts and dependencies
└── .env                          # Local environment variables; not committed

📋 Requirements

Install the following before starting the project:

Node.js 20 or newer

npm

PostgreSQL database

A local PostgreSQL instance or hosted PostgreSQL provider such as Neon

Check your installed versions:

node --version
npm --version

🚀 Quick Start

1. Install dependencies

Clone or open the project and run:

npm install

2. Configure environment variables

Create a .env file in the project root:

DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require"
JWT_SECRET="replace-this-with-a-long-random-secret"
PORT=5000

Environment variables

Variable

Required

Description

DATABASE_URL

✅

PostgreSQL connection string used by Prisma

JWT_SECRET

✅

Secret used to sign and verify JWTs

PORT

❌

Server port; defaults to 5000

⚠️ Never commit .env or database credentials to GitHub.

🗄️ Database Setup

The Prisma schema is located at:

prisma/schema.prisma

The database contains the following models.

User

Stores account information, password hashes, posts, comments, likes, and follow relationships.

Passwords are stored as bcrypt hashes, never as plain text.

Post

Stores:

Title

Optional content

Author

Comments

Likes

Comment

Stores:

Comment text

Author

Post

Creation timestamp

Comments belong to posts rather than directly to users.

Like

Stores:

User who liked the post

Post that was liked

Creation timestamp

A compound unique constraint on:

(postId, userId)

prevents the same user from liking the same post more than once.

Follow

Connects a follower to a followed user.

A compound unique constraint on:

(followerId, followingId)

prevents duplicate follow relationships.

⚙️ Prisma Commands

Generate Prisma Client

npx prisma generate --config prisma.config.ts

Create a Development Migration

npx prisma migrate dev --name init --config prisma.config.ts

Synchronize the Development Database

The current development database was synchronized using:

npx prisma db push --accept-data-loss --config prisma.config.ts

⚠️ --accept-data-loss can remove existing data. Do not use it against a production database without a backup and an explicit migration plan.

Check Migration Status

npx prisma migrate status --config prisma.config.ts

Open Prisma Studio

npx prisma studio --config prisma.config.ts

▶️ Running the API

Start the development server:

npm run dev

The development script uses tsx watch because the generated Prisma client is TypeScript and must be loaded by a TypeScript-aware runtime.

Default server URL:

http://localhost:5000

The API does not currently expose a dedicated health endpoint.

A successful request to a public endpoint such as:

GET /api/v1/post/posts

can be used to confirm that the server and database are responding.

🔐 Authentication

Authentication uses a JWT stored in an HTTP-only cookie named:

auth_token

Authentication Flow

User
 │
 ▼
Login
 │
 ▼
Verify Credentials
 │
 ▼
Generate JWT
 │
 ▼
auth_token Cookie
 │
 ▼
Protected Request
 │
 ▼
Authentication Middleware
 │
 ▼
Verify JWT
 │
 ▼
req.user
 │
 ▼
Protected Controller

How it works

Call the login endpoint.

The server sets the auth_token cookie.

Keep cookies enabled in Postman or your HTTP client.

Send the cookie automatically with protected requests.

The authentication middleware verifies the token.

The authenticated user's data is placed in req.user.

The JWT payload contains:

id
email

Tokens expire after one day.

JWT utilities are located in:

libs/jwt.js

The route guard is located in:

middleware/auth.middleware.js

When no authentication cookie is provided, protected endpoints return:

{
  "message": "Unauthorized. Please log in first."
}

with HTTP status:

401 Unauthorized

Invalid or expired tokens also return 401.

🌐 API Reference

Base URL

http://localhost:5000/api/v1

👤 Authentication and Profile

POST /auth/signup

Creates a new user account.

Authentication: Not required

Request

{
  "name": "Ada Lovelace",
  "email": "ada@example.com",
  "password": "StrongPassword123!"
}

Success

201 Created

Possible errors

400 — Required field is missing

409 — Email is already registered

POST /auth/login

Authenticates a user and sets the auth_token cookie.

Authentication: Not required

Request

{
  "email": "ada@example.com",
  "password": "StrongPassword123!"
}

Success

200 OK

Possible errors

400 — Email or password is missing

401 — Invalid credentials

The response includes a token and sanitized user information. The password is never returned.

POST /auth/logout

Clears the auth_token cookie.

Authentication: Required

Success

200 OK

GET /auth/profile/:userId

Returns the authenticated user's:

Profile information

Posts

Follower count

Following count

Authentication: Required

The userId in the URL must match the ID stored in the JWT.

Example

GET http://localhost:5000/api/v1/auth/profile/8

Possible errors

401 — User is not authenticated

403 — Requested profile belongs to another user

404 — User does not exist

📰 Posts

POST /post/posts

Creates a post for the authenticated user.

Authentication: Required

Request

{
  "userId": 8,
  "title": "My first post",
  "content": "This is the body of my post."
}

The userId must match the authenticated user.

If omitted, the authenticated user's ID is used.

Success

201 Created

Possible errors

400 — Title or user ID is missing

401 — User is not authenticated

403 — Trying to create a post for another user

GET /post/posts

Returns all posts ordered from newest to oldest.

Each post includes basic author information.

Authentication: Not required

Success

200 OK

Response

{
  "posts": [
    {
      "id": 4,
      "title": "My first post",
      "content": "This is the body of my post.",
      "userId": 8,
      "user": {
        "id": 8,
        "name": "Ada Lovelace",
        "email": "ada@example.com"
      }
    }
  ]
}

💬 Comments and Likes

Comments and likes belong to posts rather than being stored as user-level counters.

POST /user/comment

Adds a comment to a post using the authenticated user as the author.

Authentication: Required

Request

{
  "postId": 4,
  "commentText": "This is a useful post."
}

Success

200 OK

Possible errors

400 — postId or commentText is missing

401 — User is not authenticated

500 — Referenced post does not exist or database rejects the operation

POST /user/like

Creates a like for a post using the authenticated user.

Authentication: Required

Request

{
  "postId": 4
}

Success

200 OK

A user can only like a specific post once because the database enforces a unique:

(postId, userId)

relationship.

Possible errors

400 — postId is missing

401 — User is not authenticated

500 — Post does not exist or unique constraint is violated

👥 Following

POST /follow/follow

Creates a follow relationship between the authenticated user and another user.

Authentication: Required

Request

{
  "followerId": 8,
  "followingId": 9
}

The followerId must match the authenticated user.

If omitted, the authenticated user ID is used.

Success

201 Created

Possible errors

400 — Either user ID is missing

400 — User tries to follow themselves

401 — User is not authenticated

403 — Trying to follow on behalf of another user

409 — Follow relationship already exists

📊 API Summary

Method

Endpoint

Auth

Description

POST

/auth/signup

❌

Create account

POST

/auth/login

❌

Authenticate user

POST

/auth/logout

✅

Clear authentication cookie

GET

/auth/profile/:userId

✅

Get authenticated profile

POST

/post/posts

✅

Create post

GET

/post/posts

❌

List posts

POST

/user/comment

✅

Add comment

POST

/user/like

✅

Like post

POST

/follow/follow

✅

Follow user

🧪 Postman Testing

Use this base URL:

http://localhost:5000/api/v1

Recommended testing order

POST /auth/signup

POST /auth/login

Copy the user ID from the login response.

POST /post/posts

Copy the created post ID.

GET /post/posts

GET /auth/profile/:userId

POST /user/comment

POST /user/like

Create a second user.

POST /follow/follow

POST /auth/logout

Cookie Testing

Postman must retain cookies between requests.

After login, open the Postman Cookies view for:

localhost

and confirm that:

auth_token

exists.

To test route protection, call:

GET /auth/profile/:userId

without the authentication cookie.

Expected response:

401 Unauthorized

✅ Verification Commands

Check JavaScript syntax

node --check server.js
node --check routes/auth.routes.js
node --check routes/post.route.js
node --check routes/follow.route.js
node --check routes/user.route.js
node --check controllers/auth.controllers.js
node --check controllers/post.controller.js
node --check controllers/follow.controllers.js
node --check controllers/user.controller.js
node --check middleware/auth.middleware.js
node --check libs/jwt.js

Validate Prisma schema

npx prisma validate --config prisma.config.ts

Generate Prisma client

npx prisma generate --config prisma.config.ts

Start API

npm run dev

🐛 Common Problems

404 Not Found when creating a post

Use:

POST /api/v1/post/posts

The old path:

/api/v1/auth/posts

is not registered.

401 Unauthorized

Log in first and ensure the HTTP client sends:

auth_token

In Postman, confirm cookie persistence is enabled.

403 Forbidden

The resource ID in the request must match the authenticated user's ID.

The API intentionally prevents users from acting on behalf of other accounts.

P2021 or Missing Comment / Like Table

The Prisma client may know about the new models before the database has been synchronized.

Run:

npx prisma db push --accept-data-loss --config prisma.config.ts
npx prisma generate --config prisma.config.ts

⚠️ Only use --accept-data-loss after backing up data that must be preserved.

Prisma Generated Client Import Errors

Run the existing development script:

npm run dev

The project imports the generated TypeScript client from:

generated/prisma/client.ts

🛡️ Security Notes

Keep .env out of version control.

Use a long, random JWT_SECRET outside local development.

Use HTTPS in production.

Enable the production cookie's secure flag.

Never return password hashes in API responses.

Add request validation before exposing the API publicly.

Add rate limiting for authentication endpoints.

Configure an appropriate CORS policy.

Use centralized error handling.

Use a reviewed Prisma migration workflow in production.

Avoid db push --accept-data-loss against production databases.

Consider a cookie-only authentication response for production.

Production note: The current login response includes the JWT token in JSON in addition to setting the cookie. For a cookie-only production design, remove the token from the response body.

⚠️ Current Limitations

No automated test script in package.json

No dedicated health-check endpoint

Post listings do not currently include comment lists or like counts

No unlike endpoint

Comment and like database errors currently return a generic 500

No pagination

No post filtering

No email verification

No password reset flow

🚀 Future Improvements

Phase 1
├── Automated tests
├── Request validation
└── Health-check endpoint

Phase 2
├── Pagination
├── Post filtering
├── Like counts
└── Comment lists

Phase 3
├── Unlike posts
├── Email verification
├── Password reset
└── Account management

Phase 4
├── API documentation
├── Rate limiting
├── Centralized error handling
└── Production monitoring

🤝 Contributing

Contributions are welcome.

Create a feature branch

git checkout -b feature/my-feature

Make your changes

git add .
git commit -m "feat: add my feature"

Push your branch

git push origin feature/my-feature

Then open a Pull Request.

Please provide a clear description of your changes and explain how they were tested.

📄 License

The project currently uses the ISC license value defined in package.json.

<div align="center">

📰 Blog API

Authentication • Posts • Comments • Likes • Following

Built with Node.js + Express + Prisma + PostgreSQL

</div>