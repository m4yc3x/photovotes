```markdown:README.md
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
7. [Deploying to Production](#deploying-to-production)
8. [Project Structure](#project-structure)
9. [API Endpoints](#api-endpoints)
10. [User Roles](#user-roles)
11. [Contributing](#contributing)
12. [Troubleshooting](#troubleshooting)
13. [License](#license)
14. [Contact](#contact)

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
   ```bash
   git clone https://github.com/your-username/photovotes.git
   cd photovotes
   ```

2. Create a `.env.local` file in the root directory with the following variables:
   ```
    DB_HOST=localhost
    DB_PORT=3306
    DB_USERNAME=root
    DB_PASSWORD=password
    DB_NAME=my_db_name

    ADMIN_PASSWORD=password
   ```
   Replace with your actual database credentials and a secure random string for the admin password.

### Database Configuration

1. Create a new MariaDB database:
   ```sql
   CREATE DATABASE photovotes;
   ```

2. The application uses TypeORM, which will automatically create the necessary tables when you run the migrations.

### Installation

1. Install the dependencies:
   ```bash
   npm install
   ```

2. Run the database migrations:
   ```bash
   npm run typeorm migration:run
   ```

## Running the Application

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Deploying to Production

To deploy the PhotoVotes application to a production environment, follow the steps below. This guide assumes you are deploying to a Linux-based server, such as Ubuntu, and using a service like DigitalOcean, AWS, or similar.

### 1. Server Setup

#### a. Update Server Packages
```bash
sudo apt update
sudo apt upgrade -y
```

#### b. Install Necessary Dependencies
```bash
sudo apt install -y build-essential nginx git
```

#### c. Install Node.js and npm
It's recommended to use Node Version Manager (NVM) for installing Node.js.
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
source ~/.bashrc
nvm install 16
nvm use 16
node -v
npm -v
```

### 2. Clone the Repository

Navigate to the directory where you want to host the application and clone the repository:
```bash
git clone https://github.com/your-username/photovotes.git
cd photovotes
```

### 3. Environment Variables

Create a `.env.production` file with the necessary environment variables:
```bash
cp .env.local .env.production
```

Edit the `.env.production` file to reflect production settings, such as production database URLs, passwords, and API URLs.

### 4. Install Dependencies and Build

Install the dependencies and build the application:
```bash
npm install
npm run build
```

### 5. Configure the Database

Ensure that your production MariaDB server is set up and accessible. Update the `DATABASE_URL` in your `.env.production` file accordingly.

Run the migrations:
```bash
npm run typeorm migration:run
```

### 6. Setup a Process Manager

Use PM2 to manage the application process.

#### a. Install PM2
```bash
npm install -g pm2
```

#### b. Start the Application with PM2
```bash
pm2 start npm --name "photovotes" -- start
```

#### c. Configure PM2 to Start on Boot
```bash
pm2 startup
pm2 save
```

### 7. Configure Nginx as a Reverse Proxy

#### a. Remove the Default Nginx Configuration
```bash
sudo rm /etc/nginx/sites-enabled/default
```

#### b. Create a New Nginx Configuration for PhotoVotes
```bash
sudo nano /etc/nginx/sites-available/photovotes
```

Add the following configuration to the file:
```nginx
server {
    listen 80;
    server_name your_domain.com www.your_domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Optional: Serve static files directly
    location /_next/static/ {
        alias /path-to-your-app/.next/static/;
    }
}
```
Replace `your_domain.com` with your actual domain and `/path-to-your-app/` with the path to your PhotoVotes application.

#### c. Enable the Configuration and Test Nginx
```bash
sudo ln -s /etc/nginx/sites-available/photovotes /etc/nginx/sites-enabled/
sudo nginx -t
```

#### d. Restart Nginx
```bash
sudo systemctl restart nginx
```

### 8. Set Up SSL with Let's Encrypt (Optional but Recommended)

#### a. Install Certbot
```bash
sudo apt install certbot python3-certbot-nginx -y
```

#### b. Obtain and Install SSL Certificate
```bash
sudo certbot --nginx -d your_domain.com -d www.your_domain.com
```
Follow the prompts to complete the SSL setup.

### 9. Verify the Deployment

Navigate to `https://your_domain.com` in your browser to ensure that the application is running correctly with HTTPS.

### 10. Monitor and Maintain

- **Logs:** Use PM2 to monitor application logs.
  ```bash
  pm2 logs photovotes
  ```
- **Updates:** Regularly pull updates from the repository and rebuild the application.
  ```bash
  git pull origin main
  npm install
  npm run build
  pm2 restart photovotes
  ```

## Project Structure

Provide an overview of the project's file structure and the purpose of each main directory and file.

```
photovotes/
│
├── src/
│   ├── app/
│   ├── components/
│   ├── pages/
│   ├── models/
│   └── lib/
│
├── .env.local
├── .gitignore
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.ts
├── postcss.config.mjs
└── README.md
```

- **src/components/**: Contains reusable React components used throughout the application.
- **src/pages/**: Contains all Next.js pages, including API routes.
- **src/models/**: Contains TypeORM models representing database entities.
- **src/lib/**: Contains database connection logic.
- **.env.local**: Local environment variables.
- **.gitignore**: Specifies files and directories to be ignored by Git.
- **package.json**: Lists project dependencies and scripts.
- **tsconfig.json**: TypeScript configuration.
- **next.config.js**: Next.js configuration.
- **tailwind.config.ts**: Tailwind CSS configuration.
- **postcss.config.mjs**: PostCSS configuration.
- **README.md**: Project documentation (this file).

## API Endpoints

Outline the available API endpoints, their methods, and their purpose.

### Photos

- **GET /api/photos**: Retrieve all photos.
- **POST /api/photos**: Add a new photo.
- **PUT /api/photos**: Update an existing photo.
- **DELETE /api/photos**: Delete a photo.

### Votes

- **GET /api/votes**: Retrieve all votes.
- **POST /api/votes**: Submit new votes.
- **PUT /api/votes**: Update existing votes.

### Metrics

- **GET /api/metrics**: Retrieve all metrics.
- **POST /api/metrics**: Add a new metric.
- **PUT /api/metrics**: Update an existing metric.
- **DELETE /api/metrics**: Delete a metric.

### Users

- **GET /api/users**: Retrieve all users.
- **POST /api/users**: Add a new user.
- **PUT /api/users**: Update an existing user.
- **DELETE /api/users**: Delete a user.

## User Roles

Describe the different user roles within the application and their permissions.

### Admin

- Upload and manage photos.
- Manage voting metrics.
- View voting results.
- Manage users.

### Judge

- Vote on photos based on metrics.
- Modify their votes.
- View results in real-time.

## Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

### Steps to Contribute

1. **Fork the Repository**  
   Click the "Fork" button at the top right of the repository page to create your own fork.

2. **Clone the Repository**  
   ```bash
   git clone https://github.com/your-username/photovotes.git
   cd photovotes
   ```

3. **Create a Branch**  
   Create a new branch for your feature or bugfix:
   ```bash
   git checkout -b feature/FeatureName
   ```

4. **Make Your Changes**  
   Commit your changes with descriptive messages:
   ```bash
   git commit -m "Add some feature"
   ```

5. **Push to the Branch**  
   ```bash
   git push origin feature/FeatureName
   ```

6. **Open a Pull Request**  
   Go to your forked repository and click "New Pull Request".

### Guidelines

- Follow the [Code of Conduct](https://en.wikipedia.org/wiki/Programming_ethics).
- Ensure that your code follows the project's coding style.
- Provide tests for your changes.
- Update documentation if necessary.

## Troubleshooting

Provide solutions to common issues that users might face while setting up or running the application.

### Common Issues

#### 1. Database Connection Errors

**Error: `Error: getaddrinfo ENOTFOUND localhost`**

- **Solution:** Ensure that MariaDB is running and that the `DATABASE_URL` in your `.env.local` file is correct.

#### 2. Missing Dependencies

**Error: `Module not found: Can't resolve '...'`**

- **Solution:** Run `npm install` to install all dependencies.

#### 3. TypeORM Migration Failures

**Error: `Error: Migration failed`**

- **Solution:** Ensure that the database credentials are correct and that the database server is running. Check for any pending migrations and run `npm run typeorm migration:run`.

### Additional Help

If you encounter other issues, please open an issue on the [GitHub repository](https://github.com/m4yc3x/photovotes/issues).

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Contact

Your Name – [stellarweb@tuta.io](mailto:stellarweb@tuta.io)

Project Link: [https://github.com/m4yc3x/photovotes](https://github.com/m4yc3x/photovotes)
```