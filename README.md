# 🌟 🔍 👗🤖 Style AI – Fashion: AI-Powered Outfit Generator

<img width="1470" height="956" alt="Image" src="https://github.com/user-attachments/assets/a90b0397-5a3d-4ffc-bedf-8bdab09e2e89" />
<img width="1470" height="956" alt="Image" src="https://github.com/user-attachments/assets/ff6472d8-944c-419d-b838-43be0425c1c8" />
<img width="1470" height="956" alt="Image" src="https://github.com/user-attachments/assets/83aa1995-3638-4d39-ac37-9b57c0f9e13d" />
<img width="1470" height="956" alt="Image" src="https://github.com/user-attachments/assets/1d3119a2-33c0-4c1a-acdd-c41e3250fd71" />


- Style AI is a full-stack generative AI web app that transforms personal fashion.

- Upload your photo → choose Male or Female mode → get AI-optimized outfits with shopping links to recreate the style instantly.

- Built with Next.js + ShadCN UI and powered by Google Gemini via Firebase Genkit, it delivers real-time AI styling suggestions in a modern, responsive interface.


## 📋 Table of Contents
- Introduction
- Features
- Project Implementation Process
- File Structure
- Technology Stack
- Installation
- Usage
- Screenshots
- Contributing
- License
- Contact

## 📘 Introduction

- Style AI reimagines fashion discovery with AI-powered outfit generation.

- Instead of browsing endlessly for ideas, simply upload a photo, pick your gender mode, and let AI do the work.

- The system analyzes your style, enhances outfit combinations, and provides direct shopping links for each look.

- Key insights include:

```bash 
Personalized outfit recommendations

Optimized styling for male/female categories

Shopping integration for instant purchase
```

## ✨ Features

👕👗 AI-Powered Outfit Generation

→ Upload your photo and get instantly styled outfits tailored to male or female preferences.

🛍 Smart Shopping Links

→ Direct purchase links for each item so you can shop the AI-recommended look.

📊 Style Insights Dashboard

→ See a quick breakdown of outfits, accessories, and color coordination.

📌 Photo-Based Analysis

→ AI understands uploaded images and suggests modern styling ideas.

🎨 Modern UI + Dark Mode

→ Smooth, responsive, and mobile-friendly design with light/dark themes.

🔐 No Login Required

→ Just upload a photo and choose your mode—no account needed.

## 🛠 Project Implementation Process

#### 1. Input Flow
- Select Male or Female mode
- Upload a personal photo
- Submit for AI styling analysis
- Receive optimized outfit + shopping suggestions

#### 2. AI Content Generation
- Defined in generate-analysis.ts using Genkit + Gemini
- Processes uploaded photo with styling context
- Returns structured JSON with outfit details + shopping links

#### 3. UI/UX Highlights
- Built with Next.js 15 (App Router)
- Styled with ShadCN UI + Tailwind
- Animations, transitions, and error states included
- Fully responsive with mobile-first approach

## 📁 File Structure

```bash
style-ai/
├── src/
│   ├── app/                     # App Router pages, layouts
│   ├── components/              # UI components (upload, cards, style results)
│   ├── ai/
│   │   ├── flows/
│   │   │   └── generate-analysis.ts # AI styling logic (Genkit + Gemini)
│   │   ├── genkit.ts               # Genkit config
│   ├── lib/                     # Helper functions (upload, API utils)
│   ├── hooks/                   # Custom React hooks
│   └── types/                   # Zod schemas and TypeScript types
├── public/                      # Static assets (icons, images)
├── .env                         # API keys (Google AI, Firebase, etc.)
├── next.config.ts               # Next.js config
├── tailwind.config.ts           # Tailwind theme config
└── README.md

```

## 💻 Technology Stack

Category	Tech Used

🧠 AI Engine	Firebase Genkit + Google Gemini

⚛️ Frontend	Next.js 15 (App Router), React 18

🎨 Styling	Tailwind CSS, ShadCN UI

🔠 Language	TypeScript

🔗 API	Google AI APIs, Shopping API Integration

✅ Validation	Zod

🧪 State	React Hooks

🚀 Deployment	Firebase Hosting


## 🛠 Installation

Follow these steps to set up and run the Techny project locally:

#### 1. Clone the repository

```bash
git clone https://github.com/YourUsername/style-ai.git
cd style-ai
```

#### 2. Install dependencies

```bash
npm install
# or
yarn install
```

#### 3. Set Up Environment Variables

- Create a .env.local file in the root:

```bash
GOOGLE_API_KEY=your_google_ai_api_key
FIREBASE_API_KEY=your_firebase_api_key
```

Get your API key at: Google AI Studio

#### 4. Run Genkit (AI server)

```bash
npm run genkit:dev
# or for hot reload
npm run genkit:watch
```

### 5. Run the app

```bash
npm run dev
```


## 🚀 Usage
- Select Male or Female mode
- Upload your image
- Wait for AI to generate styled outfits
- Review recommendations with direct shopping links
- Reset and try again with a new photo

🧠 AI Flow

Feature	AI Flow	Input Type	Output

Outfit Generation	generate-analysis.ts	Image + Gender	Outfit + Shopping JSON


## 📸 Screenshots



## 🤝 Contributing
We welcome community contributions! Follow the steps below to contribute:

#### Fork the repository
- Create a new branch:
```bash
git checkout -b feature/YourFeature
```

- Commit your changes:
```bash
git commit -m 'Add your feature'
```

- Push to the branch:
```bash
git push origin feature/YourFeature
```

- Open a pull request with detailed explanations of your changes.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Contact
For any questions or suggestions, feel free to reach out:

- Email: rohansh0808@gmail.com
- GitHub: Rohansh0808
