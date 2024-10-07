# PhotoVotes: A Next.js Photo Voting Application

## Table of Contents
1. [Introduction](#introduction)
2. [Features](#features)
3. [Technologies Used](#technologies-used)
4. [Prerequisites](#prerequisites)
5. [Getting Started](#getting-started)
   - [Environment Setup](#environment-setup)
   - [Database Configuration](#database-configuration)
   - [Installation](#installation)
6. [Running the Application](#running-the-application)
7. [Project Structure](#project-structure)
8. [API Endpoints](#api-endpoints)
9. [User Roles](#user-roles)
10. [Contributing](#contributing)
11. [Troubleshooting](#troubleshooting)
12. [License](#license)

## Introduction

PhotoVotes is a sophisticated Next.js application designed for photo contests and voting. It allows administrators to upload photos, judges to vote on these photos based on various metrics, and provides a comprehensive results view. The application uses end-to-end encryption to ensure the privacy and security of the voting process.

## Features

- User authentication with role-based access (Admin, Judge)
- Photo upload and management for administrators
- Customizable voting metrics
- Real-time voting interface for judges
- Ability for judges to modify their votes
- Detailed results view with rankings and scores
- Responsive design using TailwindCSS and DaisyUI

## Technologies Used

- Next.js 14
- TypeScript
- MariaDB
- TypeORM
- TailwindCSS
- DaisyUI
- Lucide React (for icons)

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14 or later)
- npm (v6 or later)
- MariaDB (v10 or later)

## Getting Started

### Environment Setup

1. Clone the repository:
   ```
   git clone https://github.com/your-username/photovotes.git
   cd photovotes
   ```

2. Create a `.env.local` file in the root directory with the following variables:
   ```
   DATABASE_URL=mysql://username:password@localhost:3306/photovotes
   JWT_SECRET=your_jwt_secret_here
   NEXT_PUBLIC_API_URL=http://localhost:3000/api
   ```
   Replace `username`, `password`, and `your_jwt_secret_here` with your actual database credentials and a secure random string for JWT.

### Database Configuration

1. Create a new MariaDB database:
   ```sql
   CREATE DATABASE photovotes;
   ```

2. The application uses TypeORM, which will automatically create the necessary tables when you run the migrations.

### Installation

1. Install the dependencies:
   ```
   npm install
   ```

2. Run the database migrations:
   ```
   npm run typeorm migration:run
   ```

## Running the Application

1. Start the development server:
   ```
   npm run dev
   ```

2. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure
