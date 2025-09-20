# Instant Validation Engine - AI Market Tester

A hackathon project that generates instant landing pages for startup ideas using AI, allowing entrepreneurs to test market interest and validate their concepts quickly.

## 🚀 Features

- **AI-Powered Content Generation**: Enter your startup idea and get a compelling headline, pitch, and call-to-action
- **Instant Landing Page**: Beautiful, responsive landing page generated in seconds
- **Email Capture**: Collect signups with a clear, user-friendly form
- **Real-time Analytics**: Track signup count, recent signups, and latest signup date
- **Landing Page History**: View and revisit all previously created landing pages
- **Smart Content Regeneration**: Fresh AI content every time you view a page
- **Local Storage**: No database required - everything stored locally for MVP

## 🛠️ Tech Stack

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **OpenAI API** - AI content generation
- **Local Storage** - Data persistence

## 🏃‍♂️ Quick Start

1. **Clone and install dependencies:**

   ```bash
   npm install
   # or
   pnpm install
   ```

2. **Set up environment variables:**

   ```bash
   cp .env.local.example .env.local
   ```

   Then add your OpenAI API key to `.env.local`:

   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

3. **Run the development server:**

   ```bash
   npm run dev
   # or
   pnpm dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎯 How to Use

1. **Enter Your Idea**: Type your startup concept in the input field
2. **Generate Landing Page**: Click "Generate Landing Page" to create AI-powered content
3. **Test Market Interest**: Share the generated landing page with potential customers
4. **Track Analytics**: Monitor real-time signup data in the analytics dashboard
5. **View All Pages**: Click "View All Landing Pages" to see your creation history
6. **Try Another Idea**: Click "Try Another Idea" to test different concepts

## 🏆 Hackathon Categories

This project targets multiple hackathon categories:

- **Best Use of AI to Validate User Interest** - Core functionality
- **Most Customers/Sign-ups/Interactions** - Real user engagement
- **Best Product Hunt Results** - Launch-ready landing pages

## 📁 Project Structure

```
src/
├── app/
│   ├── api/generate-content/    # AI content generation API
│   ├── layout.tsx              # App layout
│   └── page.tsx                # Main page
├── components/
│   ├── AnalyticsDashboard.tsx  # Real-time analytics
│   ├── GeneratedLandingPage.tsx # AI-generated landing page
│   ├── IdeaInput.tsx           # Startup idea input form
│   └── LandingPagesList.tsx    # Landing page history modal
├── lib/
│   ├── openai.ts              # OpenAI integration with robust JSON parsing
│   └── storage.ts             # Local storage utilities
└── types/
    └── index.ts               # TypeScript type definitions
```

## 🔧 Development Notes

- **MVP Focus**: Designed for rapid prototyping and validation
- **No Database**: Uses localStorage for simplicity
- **AI Fallback**: Graceful degradation if OpenAI API fails
- **Robust JSON Parsing**: Handles various AI response formats
- **Responsive Design**: Works on desktop and mobile
- **Real-time Updates**: Analytics update automatically
- **Clear User Interface**: Dark, readable text and clear instructions
- **Smart Content**: Non-redundant headlines and pitches

## 🚀 Next Steps for Production

- Replace localStorage with a proper database
- Add user authentication
- Implement sharing URLs for landing pages
- Add page view tracking for real conversion rates
- Add more detailed analytics and reporting
- Deploy to Vercel/Netlify

## 🐛 Recent Fixes & Improvements

- **Fixed JSON Parsing**: Robust handling of AI responses with markdown formatting
- **Improved Text Visibility**: Dark text in input fields for better readability
- **Clear Signup Instructions**: Users know exactly what to enter (email addresses)
- **Better Analytics**: Replaced misleading conversion rate with meaningful latest signup date
- **Landing Page History**: View and revisit all previously created pages
- **Smart Content Generation**: Non-redundant headlines and pitches

## 📝 License

MIT License - Built for yconic AI Venture Capitalist Hackathon
