# OneApp - Personal Software Ecosystem

A modular, multi-functional personal software ecosystem designed for personal use with potential for commercial expansion.

[![GitHub](https://img.shields.io/github/license/binhvu284/oneapp)](https://github.com/binhvu284/oneapp)
[![GitHub last commit](https://img.shields.io/github/last-commit/binhvu284/oneapp)](https://github.com/binhvu284/oneapp)

## 🚀 Overview

OneApp is a comprehensive platform that combines multiple independent modules (storage, AI assistant, analytics, etc.) into a unified, user-controlled ecosystem. The system is built with scalability, maintainability, and extensibility in mind.

## 🏗️ Architecture

OneApp follows a modular architecture where:
- **Frontend**: ReactJS with TypeScript (TSX)
- **Backend**: NodeJS with Express
- **Database**: PostgreSQL (via Supabase)
- **Deployment**: Vercel
- **Version Control**: GitHub

## 📁 Project Structure

```
OneApp/
├── frontend/          # React frontend application
├── backend/           # NodeJS backend API
├── database/          # Database schemas and migrations
├── AI data/           # AI assistant requirements and behavior data
├── Dev data/          # Development documentation (UI, Architecture, Technology)
└── README.md          # This file
```

## 🛠️ Tech Stack

- **Frontend**: React 18+ with TypeScript
- **Backend**: Node.js with Express
- **Database**: PostgreSQL (Supabase)
- **Deployment**: Vercel
- **Development**: Cursor AI
- **Version Control**: GitHub

## 📋 Prerequisites

- Node.js 18+ and npm/yarn
- PostgreSQL database (or Supabase account)
- Git

## 🔗 Repository

**GitHub**: [https://github.com/binhvu284/oneapp](https://github.com/binhvu284/oneapp)

## 🚀 Quick Start (Local Development)

### Option 1: Quick Start Scripts

**Windows:**
```bash
start-dev.bat
```

**Linux/Mac:**
```bash
chmod +x start-dev.sh
./start-dev.sh
```

### Option 2: Manual Setup

**1. Install Dependencies**

```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

**2. Create Environment Files**

```bash
# Backend
cd backend
cp .env.example .env
# Edit .env (Supabase credentials optional for initial testing)

# Frontend
cd frontend
cp .env.example .env
# Edit .env (Supabase credentials optional for initial testing)
```

**3. Start Development Servers**

**Single Command (Recommended):**
```bash
npm run dev
```

This starts both backend and frontend together!

**Or use separate terminals:**
- Terminal 1: `cd backend && npm run dev`
- Terminal 2: `cd frontend && npm run dev`

**4. Open Browser**

Navigate to http://localhost:3000

> **Note:** The app can run in demo mode without Supabase credentials. See `LOCAL_DEVELOPMENT.md` for details.

## 📚 Documentation

- **Local Development**: See `LOCAL_DEVELOPMENT.md` ⭐ Start here for local testing
- **Setup Instructions**: See `SETUP.md`
- **Architecture**: See `Dev data/Architecture.md`
- **UI/UX Requirements**: See `Dev data/UI Requirement.md`
- **Technology Stack**: See `Dev data/Technology.md`
- **Modules**: See `MODULES.md`
- **AI Assistant Data**: See `AI data/` folder
- **Database Setup**: See `database/supabase_setup.md`

## 🔧 Development

### Running in Development Mode

**Single Command (Recommended):**
```bash
npm run dev
```

This starts both backend and frontend servers together!

**Or separately:**

**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
cd frontend
npm run dev
```

### Building for Production

**Backend:**
```bash
cd backend
npm run build
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
```

## 📦 Modules

OneApp is designed with a modular architecture. Current modules include:

- **AI Assistant**: Personal AI assistant for task management and module control
- **Storage**: File and data storage module
- **Analytics**: Data analytics and insights module

See `MODULES.md` for detailed module information and future module ideas.
See `Dev data/Architecture.md` for details on adding new modules.

## 🔐 Security

- Environment variables for sensitive data
- Secure API endpoints with authentication
- Database connection security via Supabase

## 🤝 Contributing

This is a personal project, but contributions and suggestions are welcome!

## 📝 License

Personal use project - All rights reserved

## 🎯 Future Enhancements

See `Dev data/Architecture.md` for planned modules and features.

