# 📰 Blog API

<p align="center">
  <strong>A production-style REST API for a blog and social publishing application.</strong>
</p>

<p align="center">
  Authentication → profiles → posts → comments → likes → following
</p>

<p align="center">
  Built with Node.js, Express 5, Prisma 7, PostgreSQL, JWT, and HTTP-only cookies.
</p>

<p align="center">

![Node.js](https://img.shields.io/badge/Node.js-20%2B-339933?style=flat-square&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?style=flat-square&logo=express&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?style=flat-square&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Authentication-000000?style=flat-square&logo=jsonwebtokens&logoColor=white)
![tsx](https://img.shields.io/badge/tsx-Development-3178C6?style=flat-square)

</p>

<p align="center">

[Quick Start](#-quick-start) ·
[API Reference](#-api-reference) ·
[Authentication](#-authentication) ·
[Database](#-database-schema) ·
[Testing](#-testing) ·
[Security](#-security)

</p>

---

## 📖 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Quick Start](#-quick-start)
- [Environment Variables](#-environment-variables)
- [Database Schema](#-database-schema)
- [Authentication](#-authentication)
- [API Reference](#-api-reference)
- [Testing](#-testing)
- [Security](#-security)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)

---

# ✨ Features

## 🔐 Authentication

- User registration
- Login with email and password
- JWT-based authentication
- JWT stored in an HTTP-only cookie
- Protected routes
- User profile access
- Logout functionality
- Password hashing

## 📰 Posts

- Create posts
- Retrieve posts
- Associate posts with users
- Protected post creation
- Author information included with posts

## 💬 Comments

- Add comments to posts
- Associate comments with authenticated users
- Store comments against posts

## ❤️ Likes

- Like posts
- Prevent duplicate likes
- Associate likes with users and posts

## 👥 Following

- Follow other users
- Prevent duplicate follow relationships
- Prevent users from following themselves
- Protect follow operations with authentication

---

# 🧰 Tech Stack

| Technology | Purpose |
|---|---|
| **Node.js** | JavaScript runtime |
| **Express 5** | REST API framework |
| **Prisma 7** | ORM and database access |
| **PostgreSQL** | Relational database |
| **JWT** | Authentication |
| **HTTP-only Cookies** | Secure authentication storage |
| **tsx** | Development runtime |

---

# 🏗️ Architecture

```text
                         ┌─────────────────┐
                         │     Client      │
                         └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │ Express Server  │
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