# 🏆 THE TIEBREAKER

> AI-powered decision-making assistant built with **React**, **TypeScript**, **Vercel Serverless Functions**, and the **Google Gemini API**.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?logo=vercel)
![Gemini](https://img.shields.io/badge/AI-Google%20Gemini-4285F4)

This is my first public full-stack AI application. The project was initially bootstrapped with Google AI Studio and later evolved into a production-ready application powered by **React**, **TypeScript**, **Vercel Serverless Functions**, and the **Google Gemini API**.

It showcases how AI-assisted development can accelerate software creation while emphasizing the engineering work required to transform an initial prototype into a production-ready application.

---

## ✨ Features

- ✅ AI-powered decision analysis
- ⚖️ Pros & Cons analysis
- 📊 Comparison Matrix
- 🎯 SWOT Analysis
- 🤖 Objective AI recommendations

---

## 🚀 Tech Stack

**Frontend**
- React
- TypeScript
- Vite

**Backend**
- Vercel Serverless Functions

**AI**
- Google Gemini API

**Styling**
- Tailwind CSS

---

## 🏗️ Architecture

```text
React + Vite
       │
       ▼
Vercel Serverless Functions
       │
       ▼
Google Gemini API
```

---

## 📸 Preview
<p align="center">
  <img src="assets/.aistudio/The-Tiebreaker_Preview.png" alt="The Tiebreaker Preview" width="900">
</p>

---

## 🌐 Live Demo

🔗 https://the-tiebreaker-five.vercel.app

---

## 💡 How It Works

1. Enter the decision you need help with.
2. Add two or more possible options.
3. Select an analytical framework (Pros & Cons, Comparison Matrix, or SWOT).
4. The backend securely sends your request to the Google Gemini API.
5. Review the AI-generated analysis and recommendation.

---

## 🛠️ Run Locally

### Prerequisites

- Node.js 18 or newer
- A Google Gemini API key

### Installation

Clone the repository:

```bash
git clone https://github.com/KarchMarek/The-Tiebreaker.git
cd The-Tiebreaker
```

Install dependencies:

```bash
npm install
```

Create a `.env.local` (or `.env`) file in the project root and add your Gemini API key:

```env
GEMINI_API_KEY=YOUR_API_KEY
```

Start the development server:

```bash
npm run dev
```

Open your browser and visit:

```text
http://localhost:3000
```

---

## 🔑 Environment Variables

The project requires the following environment variable:

| Variable | Description |
|----------|-------------|
| `GEMINI_API_KEY` | Your Google Gemini API key |

---

## 🎯 About This Project

The Tiebreaker is my first public full-stack AI application.

The goal of this project was to explore how AI-assisted development and modern web technologies can be combined to build a practical decision-making tool.

During development, the project evolved from an AI-generated prototype into a production-ready application deployed on Vercel with secure serverless backend functions powered by the Google Gemini API.

---

⭐ If you found this project interesting or useful, consider giving it a star on GitHub.
