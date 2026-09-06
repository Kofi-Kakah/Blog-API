# Blog API

A REST API for a blog and social publishing application. The API provides user registration and login, protected profiles, post creation and listing, post comments, post likes, and user following.

The project uses:

- Node.js with native ES modules
- Express 5
- Prisma ORM 7
- PostgreSQL
- JWT authentication stored in an HTTP-only cookie
- `tsx` for running the JavaScript entry point together with the generated Prisma TypeScript client

## Features

- Create a user account
- Log in with email and password
- Receive a signed JWT in the `auth_token` cookie
- View the authenticated user's profile
- Create posts for the authenticated user
- List posts with their authors
- Add comments to posts
- Like posts once per user
- Follow another user
- Log out and clear the authentication cookie
- Enforce ownership checks for profiles and posts

## Project Structure

```text
Blog-API/
├── controllers/
│   ├── auth.controllers.js       Authentication and profile handlers
│   ├── follow.controllers.js     Follow handler
│   ├── post.controller.js        Post handlers
│   └── user.controller.js        Comment and like handlers
├── generated/prisma/              Generated Prisma client; ignored by Git
├── libs/
│   └── jwt.js                     Shared JWT signing and verification helpers
├── middleware/
│   └── auth.middleware.js         JWT cookie authentication guard
├── prisma/
│   ├── migrations/                Prisma migration history
│   └── schema.prisma              Database models and relations
├── routes/
│   ├── auth.routes.js             Signup, login, logout, profile
│   ├── follow.route.js             Follow endpoints
│   ├── post.route.js               Post endpoints
│   └── user.route.js               Comment and like endpoints
├── prisma.config.ts                Prisma CLI configuration
├── prisma.ts                       Prisma client singleton and PostgreSQL adapter
├── server.js                       Express application entry point
├── package.json                    Scripts and dependencies
└── .env                            Local environment variables; not committed
```

## Requirements

Install the following before starting the project:

- Node.js 20 or newer
- npm
- A PostgreSQL database, such as a local PostgreSQL instance or Neon

Check your versions:

```bash
node --version
npm --version
```

## Installation

Clone or open the project and install dependencies:

```bash
npm install
```

Create a `.env` file in the project root:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require"
JWT_SECRET="replace-this-with-a-long-random-secret"
PORT=5000
```

`DATABASE_URL` is required by Prisma and the PostgreSQL adapter. `JWT_SECRET` signs and verifies login tokens. `PORT` is optional and defaults to `5000`.

The `.env` file is ignored by Git and should never be committed.

## Database Setup

The Prisma schema is located at [prisma/schema.prisma](prisma/schema.prisma). It contains these models:

### User

Stores account information, password hashes, posts, comments, likes, and follow relationships. Passwords are stored as bcrypt hashes, never as plain text.

### Post

Stores the title, optional content, author, comments, and likes.

### Comment

Stores a comment's text, author, post, and creation timestamp. Comments belong to posts rather than directly to users.

### Like

Stores the user who liked a post, the post that was liked, and the creation timestamp. The compound unique constraint on `(postId, userId)` prevents the same user from liking the same post more than once.

### Follow

Connects a follower user to a followed user. The compound unique constraint on `(followerId, followingId)` prevents duplicate follow relationships.

Generate the Prisma client:

```bash
npx prisma generate --config prisma.config.ts
```

For a normal development schema migration:

```bash
npx prisma migrate dev --name init --config prisma.config.ts
```

The current development database was synchronized with the post-based comment and like schema using:

```bash
npx prisma db push --accept-data-loss --config prisma.config.ts
```

That operation removed the old `User.comments` and `User.likes` columns and their existing values. Do not use `--accept-data-loss` against a production database without a backup and an explicit migration plan.

Check migration status:

```bash
npx prisma migrate status --config prisma.config.ts
```

Open Prisma Studio:

```bash
npx prisma studio --config prisma.config.ts
```

## Running the API

Start the development server:

```bash
npm run dev
```

The development script uses `tsx watch` because the generated Prisma client is TypeScript and must be loaded by a TypeScript-aware runtime.

The default server URL is:

```text
http://localhost:5000
```

The server does not currently expose a dedicated health endpoint. A successful request to a public route such as `GET /api/v1/post/posts` confirms that the server and database are responding.

## Authentication

Authentication uses a JWT stored in an HTTP-only cookie named `auth_token`.

1. Call the login endpoint.
2. The server sets the `auth_token` cookie.
3. Keep cookies enabled in Postman or your HTTP client.
4. Send the cookie automatically with protected requests.
5. The authentication middleware verifies the token and places its payload in `req.user`.

The JWT payload contains the authenticated user's `id` and `email`. Tokens expire after one day.

The shared implementation is in [libs/jwt.js](libs/jwt.js), while the route guard is in [middleware/auth.middleware.js](middleware/auth.middleware.js).

Protected endpoints return:

```json
{
  "message": "Unauthorized. Please log in first."
}
```

with status `401` when no cookie is provided. Invalid or expired tokens also return `401`.

## API Routes

All routes are prefixed with:

```text
http://localhost:5000/api/v1
```

### Authentication and Profile

#### `POST /auth/signup`

Creates a user account. This route is public.

Request body:

```json
{
  "name": "Ada Lovelace",
  "email": "ada@example.com",
  "password": "StrongPassword123!"
}
```

Success: `201 Created`

Possible errors:

- `400` when a required field is missing
- `409` when the email is already registered

#### `POST /auth/login`

Authenticates a user and sets the `auth_token` cookie. This route is public.

Request body:

```json
{
  "email": "ada@example.com",
  "password": "StrongPassword123!"
}
```

Success: `200 OK`

Possible errors:

- `400` when email or password is missing
- `401` when the credentials are invalid

The response includes a token and sanitized user information. The password is never returned.

#### `POST /auth/logout`

Clears the `auth_token` cookie.

Authentication: required

Success: `200 OK`

#### `GET /auth/profile/:userId`

Returns the authenticated user's profile, posts, follower count, and following count.

Authentication: required

The URL user ID must match the ID in the JWT. A user cannot use this endpoint to view another user's profile.

Example:

```text
GET http://localhost:5000/api/v1/auth/profile/8
```

Success: `200 OK`

Possible errors:

- `401` when the user is not authenticated
- `403` when the requested profile belongs to another user
- `404` when the user does not exist

### Posts

#### `POST /post/posts`

Creates a post for the authenticated user.

Authentication: required

Request body:

```json
{
  "userId": 8,
  "title": "My first post",
  "content": "This is the body of my post."
}
```

The `userId` must match the authenticated user. If omitted, the authenticated user ID is used.

Success: `201 Created`

Possible errors:

- `400` when the title or user ID is missing
- `401` when the user is not authenticated
- `403` when trying to create a post for another user

#### `GET /post/posts`

Returns all posts ordered from newest to oldest. Each post includes basic author information.

Authentication: not required

Success: `200 OK`

Response shape:

```json
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
```

### Comments and Likes

Comments and likes belong to posts. They do not update user-level counters.

#### `POST /user/comment`

Adds a comment to a post using the authenticated user as the author.

Authentication: required

Request body:

```json
{
  "postId": 4,
  "commentText": "This is a useful post."
}
```

Success: `200 OK`

Possible errors:

- `400` when `postId` or `commentText` is missing
- `401` when the user is not authenticated
- `500` when the referenced post does not exist or the database rejects the operation

#### `POST /user/like`

Creates a like for a post using the authenticated user.

Authentication: required

Request body:

```json
{
  "postId": 4
}
```

Success: `200 OK`

A user can only like a specific post once because the database enforces a unique `(postId, userId)` pair.

Possible errors:

- `400` when `postId` is missing
- `401` when the user is not authenticated
- `500` when the post does not exist or the unique constraint is violated

### Following

#### `POST /follow/follow`

Creates a follow relationship from the authenticated user to another user.

Authentication: required

Request body:

```json
{
  "followerId": 8,
  "followingId": 9
}
```

The `followerId` must match the authenticated user. If omitted, the authenticated user ID is used.

Success: `201 Created`

Possible errors:

- `400` when either user ID is missing
- `400` when a user tries to follow themselves
- `401` when the user is not authenticated
- `403` when trying to follow on behalf of another user
- `409` when the relationship already exists

## Postman Testing

Create a Postman collection using the base URL:

```text
http://localhost:5000/api/v1
```

Recommended request order:

1. `POST /auth/signup`
2. `POST /auth/login`
3. Copy the user ID from the login response.
4. `POST /post/posts`
5. Copy the created post ID from the response.
6. `GET /post/posts`
7. `GET /auth/profile/:userId`
8. `POST /user/comment` with the post ID.
9. `POST /user/like` with the post ID.
10. Create a second user and call `POST /follow/follow`.
11. `POST /auth/logout`

Postman must retain cookies between requests. After login, use the Postman Cookies view for `localhost` to confirm that `auth_token` exists.

To test protection, send `GET /auth/profile/:userId` in a new request without the cookie. It should return `401`.

## Verification Commands

Check JavaScript syntax:

```bash
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
```

Validate the Prisma schema:

```bash
npx prisma validate --config prisma.config.ts
```

Generate the Prisma client:

```bash
npx prisma generate --config prisma.config.ts
```

Start the API:

```bash
npm run dev
```

## Common Problems

### `404 Not Found` for creating a post

Use the split post route:

```text
POST /api/v1/post/posts
```

The old path `/api/v1/auth/posts` is not registered.

### `401 Unauthorized`

Log in first and ensure the HTTP client sends the `auth_token` cookie. In Postman, confirm cookie persistence is enabled.

### `403 Forbidden` for a profile or post

The resource ID in the request must match the authenticated user's ID. The API intentionally prevents users from acting on behalf of other accounts.

### `P2021` or missing `Comment`/`Like` table

The Prisma client may know about the new models before the database has been synchronized. Run the appropriate development migration or database synchronization command, then regenerate the client:

```bash
npx prisma db push --accept-data-loss --config prisma.config.ts
npx prisma generate --config prisma.config.ts
```

Only use `--accept-data-loss` after backing up any data that must be preserved.

### Prisma generated client import errors

Run the application through the existing development script instead of plain `node server.js`:

```bash
npm run dev
```

The project imports the generated TypeScript client from `generated/prisma/client.ts`.

## Security Notes

- Keep `.env` out of version control.
- Use a long, random `JWT_SECRET` outside local development.
- Use HTTPS in production so authentication cookies are protected in transit.
- Consider setting the production cookie's `secure` flag to `true`.
- Do not return password hashes in API responses.
- Add request validation, rate limiting, CORS policy, and centralized error handling before exposing the API publicly.
- Use a reviewed Prisma migration workflow for production instead of `db push --accept-data-loss`.
- The current login response includes the JWT token in JSON in addition to setting the cookie. For a cookie-only production design, remove the token from the response body.

## Current Limitations

- There is no automated test script in `package.json` yet.
- There is no dedicated health-check route.
- The post list returns author data but does not currently include comment lists or like counts.
- Likes cannot currently be removed through an unlike endpoint.
- Comment and like database errors currently return a generic `500` response.
- There is no pagination or filtering for posts.
- There is no email verification or password reset flow.

## License

The project currently uses the ISC license value from `package.json`.
