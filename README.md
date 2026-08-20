# My  Learnings
# Full-Stack Application Deployment on AWS EC2

A practical guide to deploying a full-stack application on an AWS EC2 instance using **GitHub Actions, Nginx, PM2, SSH, DNS, and a frontend/backend architecture**.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Architecture](#2-architecture)
3. [What is EC2?](#3-what-is-ec2)
4. [Connecting to EC2 Using SSH](#4-connecting-to-ec2-using-ssh)
5. [Preparing the EC2 Server](#5-preparing-the-ec2-server)
6. [Frontend and Backend Structure](#6-frontend-and-backend-structure)
7. [Why Frontend and Backend Are Separated](#7-why-frontend-and-backend-are-separated)
8. [Deploying Both on One EC2](#8-deploying-both-on-one-ec2)
9. [What is PM2?](#9-what-is-pm2)
10. [Why PM2 is Required](#10-why-pm2-is-required)
11. [What is Nginx?](#11-what-is-nginx)
12. [Why Nginx is Required](#12-why-nginx-is-required)
13. [Reverse Proxy](#13-reverse-proxy)
14. [Nginx Request Routing](#14-nginx-request-routing)
15. [Frontend to Backend Communication](#15-frontend-to-backend-communication)
16. [DNS](#16-dns)
17. [Ports](#17-ports)
18. [GitHub Actions](#18-github-actions)
19. [Continuous Integration](#19-continuous-integration)
20. [Continuous Deployment](#20-continuous-deployment)
21. [Why Use Two GitHub Actions](#21-why-use-two-github-actions)
22. [One Workflow vs Two Workflows](#22-one-workflow-vs-two-workflows)
23. [Frontend Deployment](#23-frontend-deployment)
24. [Backend Deployment](#24-backend-deployment)
25. [Environment Variables](#25-environment-variables)
26. [Complete Deployment Flow](#26-complete-deployment-flow)
27. [Complete User Request Flow](#27-complete-user-request-flow)
28. [Security Considerations](#28-security-considerations)
29. [Useful Commands](#29-useful-commands)
30. [Common Problems](#30-common-problems)
31. [Final Architecture](#31-final-architecture)
32. [Important Interview Questions](#32-important-interview-questions)
33. [Quick Revision](#33-quick-revision)

---

# 1. Overview

A full-stack application normally contains two major parts:

* Frontend
* Backend

For example, a MERN application may contain:

* React.js frontend
* Node.js backend
* Express.js API
* MongoDB database

A development structure can look like:

```text
my-project/
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
│
├── backend/
│   ├── routes/
│   ├── controllers/
│   ├── models/
│   ├── middleware/
│   ├── package.json
│   └── server.js
│
└── README.md
```

The complete deployment can be performed on an AWS EC2 instance.

The major technologies involved are:

```text
GitHub
    ↓
GitHub Actions
    ↓
AWS EC2
    ↓
Nginx
    ↓
Frontend + Backend
    ↓
PM2
    ↓
Database
```

---

# 2. Architecture

A simple production architecture can look like this:

```text
                         USER
                           │
                           │ HTTPS
                           ▼
                         DNS
                           │
                           ▼
                    EC2 Public IP
                           │
                           ▼
                    ┌────────────┐
                    │   Nginx    │
                    └─────┬──────┘
                          / \
                         /   \
                        /     \
                       ▼       ▼
                Frontend      Backend
                 React       Node.js
                   │            │
                 dist/         PM2
                                │
                             Express
                                │
                                ▼
                             MongoDB
```

The deployment pipeline is separate:

```text
Developer
    │
    │ git push
    ▼
GitHub Repository
    │
    ▼
GitHub Actions
    │
    │ CI/CD
    ▼
EC2
    │
    ├── Frontend
    └── Backend
```

---

# 3. What is EC2?

Amazon EC2 stands for:

**Elastic Compute Cloud**

An EC2 instance is essentially a remote computer provided by AWS.

A normal computer has:

```text
CPU
RAM
Storage
Operating System
Terminal
Applications
```

An EC2 instance also has:

```text
CPU
RAM
Storage
Operating System
Terminal
Applications
```

The major difference is that the EC2 machine is running in an AWS data center.

Instead of physically sitting in front of the machine, we connect to it remotely.

For example:

```text
Your Laptop
     │
     │ Internet
     ▼
AWS EC2 Server
```

The EC2 instance can run:

```text
Linux
Node.js
Nginx
PM2
Git
Your application
```

---

# 4. Connecting to EC2 Using SSH

SSH stands for:

**Secure Shell**

SSH allows us to remotely access the EC2 machine through a terminal.

Example:

```bash
ssh -i my-key.pem ubuntu@EC2_PUBLIC_IP
```

For example:

```bash
ssh -i my-key.pem ubuntu@13.xxx.xxx.xxx
```

After successful authentication, the terminal is connected to the EC2 machine.

```text
Your Laptop Terminal
        │
        │ SSH
        ▼
┌─────────────────────────┐
│       EC2 SERVER        │
│                         │
│ Ubuntu                  │
│ Node.js                 │
│ Nginx                   │
│ PM2                     │
│ Application             │
└─────────────────────────┘
```

After connecting through SSH, commands are executed on the EC2 server.

For example:

```bash
pwd
ls
cd
mkdir
git clone
npm install
pm2 start
```

These commands are running on the remote EC2 machine.

---

# 5. Preparing the EC2 Server

After creating the EC2 instance, the server needs to be prepared.

Typical steps include:

```bash
sudo apt update
```

Install Git:

```bash
sudo apt install git
```

Install Node.js:

```bash
node -v
npm -v
```

Install Nginx:

```bash
sudo apt install nginx
```

Install PM2:

```bash
npm install -g pm2
```

Verify:

```bash
pm2 -v
```

Now the server can run the application.

---

# 6. Frontend and Backend Structure

A full-stack application can be stored in one GitHub repository.

Example:

```text
my-project/
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
│
└── backend/
    ├── routes/
    ├── controllers/
    ├── models/
    ├── middleware/
    ├── package.json
    └── server.js
```

This is commonly called a:

**Monorepo**

A monorepo means frontend and backend are maintained inside the same repository.

There is no requirement to create separate repositories.

---

# 7. Why Frontend and Backend Are Separated

Frontend and backend have different responsibilities.

## Frontend

The frontend is responsible for:

* UI
* Components
* Pages
* Forms
* User interaction
* Calling APIs

For example:

```text
React
   ↓
User clicks Login
   ↓
API request
```

## Backend

The backend is responsible for:

* APIs
* Authentication
* Business logic
* Database operations
* Authorization
* Server-side processing

For example:

```text
POST /api/login
       ↓
Express
       ↓
Validate user
       ↓
MongoDB
       ↓
Response
```

Therefore, although they can exist in the same repository, they have different responsibilities.

---

# 8. Deploying Both on One EC2

Frontend and backend do not need separate EC2 instances.

One EC2 machine can contain both.

For example:

```text
EC2
│
├── /var/www/frontend
│
└── /var/www/backend
```

The frontend may contain:

```text
frontend/
└── dist/
```

The backend may contain:

```text
backend/
├── routes/
├── controllers/
├── models/
└── server.js
```

So one machine can host:

```text
Frontend
+
Backend
+
Nginx
+
PM2
```

This is perfectly valid for many small and medium-sized applications.

---

# 9. What is PM2?

PM2 is a **process manager for Node.js applications**.

Normally, we could start a Node.js application using:

```bash
node server.js
```

The problem is that production applications need process management.

PM2 manages the Node.js application for us.

Example:

```bash
pm2 start server.js
```

Now PM2 manages the Node.js process.

```text
PM2
 │
 └── Node.js
      │
      └── Express
```

---

# 10. Why PM2 is Required

PM2 provides several useful features.

## Automatic Restart

Suppose:

```text
Node.js
   ↓
Application crashes
   ↓
Process stops
```

Without PM2, the application may remain stopped.

With PM2:

```text
Node.js
   ↓
Crash
   ↓
PM2 detects crash
   ↓
PM2 restarts Node.js
```

---

## Background Execution

Instead of manually keeping the terminal open:

```bash
node server.js
```

we can use:

```bash
pm2 start server.js
```

The application can continue running in the background.

---

## Process Monitoring

Check processes:

```bash
pm2 list
```

Example:

```text
┌────┬─────────┬────────┐
│ id │ name    │ status │
├────┼─────────┼────────┤
│ 0  │ backend │ online │
└────┴─────────┴────────┘
```

---

## Logs

View logs:

```bash
pm2 logs
```

Application-specific logs:

```bash
pm2 logs backend
```

---

## Restart

Restart an application:

```bash
pm2 restart backend
```

---

## Stop

Stop an application:

```bash
pm2 stop backend
```

---

## Delete

Remove the process from PM2:

```bash
pm2 delete backend
```

---

# 11. What is Nginx?

Nginx is a:

* Web server
* Reverse proxy
* Load balancer
* Static file server

In this architecture, Nginx is mainly used as the entry point for web traffic.

```text
Internet
   │
   ▼
 Nginx
```

Nginx receives incoming requests and decides where they should go.

---

# 12. Why Nginx is Required

Suppose the frontend is available at:

```text
https://example.com
```

and the backend is running internally on:

```text
localhost:5000
```

The user should not necessarily need to access:

```text
example.com:5000
```

Instead, Nginx can receive the request and forward it to the backend.

```text
Browser
   │
   ▼
Nginx
   │
   ▼
Node.js :5000
```

Nginx can also:

* Serve frontend static files
* Handle HTTPS
* Route API requests
* Hide internal backend ports
* Load balance multiple backend instances

---

# 13. Reverse Proxy

A reverse proxy is an intermediary between the client and backend servers.

Without a reverse proxy:

```text
Browser
   │
   └──────────────► Backend
```

With Nginx:

```text
Browser
   │
   ▼
Nginx
   │
   ▼
Backend
```

Nginx receives the request first.

Then it forwards the request to the appropriate backend service.

For example:

```text
/api/users
      ↓
Nginx
      ↓
localhost:5000/api/users
```

The browser doesn't need to know that the backend is running on port 5000.

---

# 14. Nginx Request Routing

Nginx can route requests based on their path.

For example:

```text
/       → Frontend
/api/*  → Backend
```

Conceptually:

```text
Request
   │
   ▼
 Nginx
   │
   ├── /       → React files
   │
   └── /api/*  → Node.js
```

Example Nginx configuration:

```nginx
server {
    listen 80;

    server_name example.com;

    location / {
        root /var/www/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:5000;
    }
}
```

The exact configuration depends on the application.

---

# 15. Frontend to Backend Communication

Suppose the React frontend needs users.

The frontend can make:

```javascript
fetch("/api/users")
```

The browser sends:

```text
GET /api/users
```

Nginx receives it.

Nginx recognizes:

```text
/api/
```

and forwards the request to:

```text
http://localhost:5000/api/users
```

The flow becomes:

```text
Browser
   │
   │ GET /api/users
   ▼
Nginx
   │
   │ proxy
   ▼
Node.js :5000
   │
   ▼
Express
   │
   ▼
MongoDB
```

The response comes back through the same path:

```text
MongoDB
   ↓
Express
   ↓
Node.js
   ↓
Nginx
   ↓
Browser
```

---

# 16. DNS

DNS stands for:

**Domain Name System**

DNS maps a domain name to an IP address.

Instead of remembering:

```text
13.xxx.xxx.xxx
```

users can access:

```text
example.com
```

Conceptually:

```text
example.com
     ↓
DNS
     ↓
EC2 Public IP
```

DNS's responsibility is to help locate the server.

It does not decide which application receives `/api/users`.

That is Nginx's responsibility.

---

# 17. DNS vs Nginx

This distinction is important.

## DNS

Answers:

> Where is example.com?

```text
example.com
     ↓
EC2 IP
```

## Nginx

Answers:

> Now that the request reached my server, where should I send it?

```text
/
   ↓
Frontend

/api/*
   ↓
Backend
```

Therefore:

```text
DNS
 ↓
Find the server

Nginx
 ↓
Route the request
```

---

# 18. Ports

Applications communicate through ports.

For example:

```text
HTTP       → 80
HTTPS      → 443
Node.js    → 5000
```

Your backend may run internally on:

```text
localhost:5000
```

Nginx can listen publicly on:

```text
80
443
```

and forward requests internally:

```text
Nginx :443
     ↓
Node.js :5000
```

The backend does not necessarily need to be publicly exposed.

---

# 19. GitHub Actions

GitHub Actions is used to automate workflows.

It can automatically:

* Install dependencies
* Run tests
* Build applications
* Connect to servers
* Deploy applications
* Restart services

A workflow is normally stored under:

```text
.github/workflows/
```

For example:

```text
.github/
└── workflows/
    ├── frontend.yml
    └── backend.yml
```

---

# 20. Continuous Integration

Continuous Integration means automatically checking code whenever changes are pushed.

Typical flow:

```text
Developer
    ↓
git push
    ↓
GitHub
    ↓
GitHub Actions
    ↓
Install dependencies
    ↓
Build
    ↓
Run tests
    ↓
Success / Failure
```

The purpose is to detect problems early.

For example:

```text
Developer pushes code
        ↓
CI starts
        ↓
npm install
        ↓
npm test
        ↓
Tests fail
        ↓
Developer gets failure
```

---

# 21. Continuous Deployment

Continuous Deployment automatically deploys successful changes.

Flow:

```text
Developer
    ↓
git push
    ↓
GitHub
    ↓
GitHub Actions
    ↓
Build + Test
    ↓
Deploy
    ↓
EC2
    ↓
Application updated
```

Therefore:

```text
CI
=
Build + Test + Validate

CD
=
Deploy
```

Together:

```text
CI/CD
=
Automatically validate and deploy code
```

---

# 22. Why Use Two GitHub Actions?

Suppose the repository contains:

```text
frontend/
backend/
```

We can have:

```text
frontend.yml
backend.yml
```

This does NOT mean that frontend and backend need different EC2 machines.

It only means that they have separate deployment workflows.

Frontend deployment might do:

```text
Install dependencies
      ↓
Build React
      ↓
Create dist/
      ↓
Deploy frontend
```

Backend deployment might do:

```text
Install dependencies
      ↓
Deploy backend
      ↓
PM2 restart
```

The operations are different.

---

# 23. One Workflow vs Two Workflows

Both architectures are valid.

## One Workflow

```text
push
 ↓
GitHub Actions
 ↓
Frontend build
 ↓
Backend deployment
 ↓
Complete
```

## Two Workflows

```text
Frontend change
      ↓
Frontend workflow
      ↓
Frontend deployment
```

and:

```text
Backend change
      ↓
Backend workflow
      ↓
Backend deployment
```

Two workflows allow independent deployment.

If only frontend changes, backend does not need to be redeployed.

---

# 24. Frontend Deployment

A React frontend usually needs to be built before production deployment.

Typical command:

```bash
npm install
```

Then:

```bash
npm run build
```

This creates production files.

For example:

```text
frontend/
└── dist/
    ├── index.html
    ├── assets/
    └── ...
```

Nginx can serve these files.

The production flow becomes:

```text
React source code
       ↓
npm run build
       ↓
dist/
       ↓
Nginx
       ↓
Browser
```

---

# 25. Backend Deployment

The backend is different because Node.js needs to keep running.

Typical backend:

```text
backend/
├── routes/
├── controllers/
├── models/
├── middleware/
├── package.json
└── server.js
```

Install dependencies:

```bash
npm install
```

Start using PM2:

```bash
pm2 start server.js --name backend
```

Now:

```text
PM2
 ↓
Node.js
 ↓
Express
```

After updating backend code:

```bash
pm2 restart backend
```

---

# 26. Environment Variables

Production applications should not hard-code sensitive configuration.

Examples:

```text
DATABASE_URL
JWT_SECRET
API_KEY
PORT
```

These should be stored as environment variables.

Example:

```env
PORT=5000
DATABASE_URL=...
JWT_SECRET=...
```

Do not commit sensitive `.env` files to GitHub.

Use:

```text
.env
```

in `.gitignore`.

Example:

```gitignore
.env
node_modules/
dist/
```

---

# 27. Complete Deployment Flow

The complete deployment process can be understood in two parts.

## Part 1 — Developer to EC2

```text
Developer
    │
    │ git push
    ▼
GitHub
    │
    ▼
GitHub Actions
    │
    ├── CI
    │    ├── Install
    │    ├── Build
    │    └── Test
    │
    └── CD
         │
         ▼
       SSH
         │
         ▼
        EC2
```

---

## Part 2 — EC2 Runtime

```text
Internet
    │
    ▼
DNS
    │
    ▼
EC2
    │
    ▼
Nginx
    │
    ├── Frontend
    │
    └── Backend
          │
         PM2
          │
        Node.js
          │
        Express
          │
       MongoDB
```

---

# 28. Complete User Request Flow

Suppose a user opens:

```text
https://example.com
```

### Step 1 — DNS

The browser resolves:

```text
example.com
```

to the server IP.

```text
example.com
     ↓
EC2 IP
```

### Step 2 — Nginx

The request reaches Nginx.

```text
Browser
   ↓
Nginx
```

### Step 3 — Frontend

Nginx serves the React production files.

```text
Nginx
   ↓
index.html
   ↓
React application
```

### Step 4 — API Request

React needs data:

```javascript
fetch("/api/users")
```

### Step 5 — Nginx Proxy

Nginx forwards:

```text
/api/users
     ↓
localhost:5000/api/users
```

### Step 6 — Node.js

PM2 keeps the Node.js application running.

```text
PM2
 ↓
Node.js
 ↓
Express
```

### Step 7 — Database

Express communicates with MongoDB.

```text
Express
   ↓
MongoDB
```

### Step 8 — Response

The response travels back:

```text
MongoDB
 ↓
Express
 ↓
Node.js
 ↓
Nginx
 ↓
Browser
```

---

# 29. Security Considerations

The EC2 server should not expose unnecessary ports.

Typical public ports:

```text
22   → SSH
80   → HTTP
443  → HTTPS
```

The backend port, such as:

```text
5000
```

can remain internal if Nginx is proxying to it.

Conceptually:

```text
Internet
   │
   ├── 80  → Nginx
   ├── 443 → Nginx
   └── 5000 → Not publicly required
```

The AWS Security Group controls inbound traffic.

---

# 30. Useful Commands

## System

```bash
pwd
```

```bash
ls
```

```bash
cd folder
```

```bash
mkdir folder
```

---

## Git

```bash
git clone <repository>
```

```bash
git pull
```

```bash
git status
```

---

## Node.js

```bash
node -v
```

```bash
npm -v
```

```bash
npm install
```

```bash
npm run build
```

---

## PM2

Start:

```bash
pm2 start server.js --name backend
```

List:

```bash
pm2 list
```

Logs:

```bash
pm2 logs
```

Restart:

```bash
pm2 restart backend
```

Stop:

```bash
pm2 stop backend
```

Delete:

```bash
pm2 delete backend
```

Save processes:

```bash
pm2 save
```

Configure startup:

```bash
pm2 startup
```

---

## Nginx

Check status:

```bash
sudo systemctl status nginx
```

Start:

```bash
sudo systemctl start nginx
```

Restart:

```bash
sudo systemctl restart nginx
```

Reload configuration:

```bash
sudo systemctl reload nginx
```

Test configuration:

```bash
sudo nginx -t
```

---

# 31. Common Problems

## Problem 1 — Backend is not running

Check PM2:

```bash
pm2 list
```

Then:

```bash
pm2 logs backend
```

---

## Problem 2 — Nginx configuration error

Run:

```bash
sudo nginx -t
```

If the configuration is valid:

```text
syntax is ok
test is successful
```

---

## Problem 3 — Frontend loads but API doesn't work

Check:

```text
1. Is backend running?
2. Is PM2 online?
3. Is Nginx proxy configured?
4. Is the API path correct?
5. Is the backend listening on the expected port?
6. Are environment variables correct?
```

---

## Problem 4 — 502 Bad Gateway

A `502 Bad Gateway` from Nginx commonly means Nginx cannot successfully communicate with the upstream backend.

Check:

```bash
pm2 list
```

Then:

```bash
pm2 logs backend
```

Check whether Node.js is listening on the expected port.

---

## Problem 5 — SSH connection fails

Check:

```text
EC2 is running
Security Group allows SSH
Correct public IP
Correct username
Correct private key
Correct permissions on key
```

---

# 32. Important Interview Questions

## What is EC2?

EC2 is a virtual server provided by AWS where applications can be deployed and executed.

---

## What is SSH?

SSH is a secure protocol used to remotely access a server through a command-line interface.

---

## What is PM2?

PM2 is a Node.js process manager that keeps applications running, handles restarts, manages logs, and can run multiple Node.js processes.

---

## Why do we use PM2?

To manage the Node.js application's lifecycle in production.

If the application crashes, PM2 can restart it automatically.

---

## What is Nginx?

Nginx is a web server and reverse proxy that can serve static files, handle HTTP/HTTPS traffic, and forward requests to backend services.

---

## What is a reverse proxy?

A reverse proxy receives client requests and forwards them to the appropriate backend service.

Example:

```text
Browser
   ↓
Nginx
   ↓
Node.js
```

---

## Why use Nginx with Node.js?

Nginx can act as the public entry point, handle HTTPS, serve frontend files, and proxy API requests to Node.js.

---

## What is DNS?

DNS maps domain names to IP addresses.

Example:

```text
example.com
     ↓
Server IP
```

---

## Does DNS route `/api` to the backend?

No.

DNS helps locate the server.

Nginx can route:

```text
/api/*
```

to the backend.

---

## Can frontend and backend be deployed on the same EC2?

Yes.

One EC2 instance can host:

```text
Frontend
Backend
Nginx
PM2
```

---

## Do frontend and backend need separate GitHub repositories?

No.

They can exist in one repository.

Example:

```text
project/
├── frontend/
└── backend/
```

---

## Do frontend and backend need separate GitHub Actions workflows?

No.

One workflow can deploy both.

Separate workflows are useful when frontend and backend should be deployed independently.

---

## Why use two workflows?

Because frontend and backend have different deployment processes.

For example:

```text
Frontend
→ npm install
→ npm run build
→ deploy static files
```

Backend:

```text
npm install
→ update server
→ pm2 restart
```

---

# 33. Quick Revision

The entire deployment can be remembered using this model:

```text
                    DEVELOPMENT
                         │
                      git push
                         │
                         ▼
                      GITHUB
                         │
                         ▼
                  GITHUB ACTIONS
                         │
                   CI/CD Pipeline
                         │
                         ▼
                        EC2
                         │
          ┌──────────────┼──────────────┐
          │              │              │
      Frontend         Nginx         Backend
       React             │           Node.js
         │               │             │
       dist/             │            PM2
         │               │             │
         └───────────────┤          Express
                         │             │
                         └─────────────┤
                                       │
                                    MongoDB
```

The runtime request flow is:

```text
User
  │
  │ https://example.com
  ▼
DNS
  │
  ▼
EC2
  │
  ▼
Nginx
  │
  ├───────────────┐
  │               │
  ▼               ▼
Frontend        /api/*
  │               │
React           Backend
                  │
                 PM2
                  │
                Node.js
                  │
                Express
                  │
                MongoDB
```

The deployment flow is:

```text
Developer
    │
    │ git push
    ▼
GitHub
    │
    ▼
GitHub Actions
    │
    ├── Continuous Integration
    │      ├── Install
    │      ├── Build
    │      └── Test
    │
    └── Continuous Deployment
           │
           ▼
          SSH
           │
           ▼
          EC2
           │
           ├── Update Frontend
           │
           └── Update Backend
                  │
                PM2 restart
```

---

# Final Mental Model

Remember these responsibilities:

```text
GitHub
→ Stores source code

GitHub Actions
→ Automates CI/CD

EC2
→ Provides the actual server/computer

SSH
→ Lets us remotely access EC2

Frontend
→ User interface

Backend
→ API + business logic

PM2
→ Manages Node.js processes

Nginx
→ Receives and routes HTTP/HTTPS traffic

Reverse Proxy
→ Nginx forwards requests to backend

DNS
→ Domain name → server IP

MongoDB
→ Stores application data
```

The most important distinction is:

> **GitHub Actions deploys the application. EC2 provides the machine where the application runs. PM2 manages the Node.js process. Nginx manages incoming web traffic and acts as a reverse proxy. DNS helps the browser find the server.**

Once these responsibilities are separated, the complete deployment architecture becomes straightforward.

