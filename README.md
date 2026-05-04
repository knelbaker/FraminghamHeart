# Framingham Heart Study Viewer 

## Overview 
A web app to explore the Framingham Heart Study dataset and visualize the data to understand cardiovascular disease risk factors. 

## How to Run 
1. Navigate to the webapp directory: `cd webapp`
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev`
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

Alternatively: visit [https://framingham-heart.vercel.app/](https://framingham-heart.vercel.app/)

## Tech Stack 
- **Languages**: TypeScript, HTML, CSS, JS
- **Frameworks**: Next.js, React
- **Libraries**: Chart.js, react-chartjs-2, PapaParse

## Architecture

The application is designed as an interactive, client-side single-page dashboard using the Next.js App Router.

- **Data Layer**: The Framingham Heart Study dataset is hosted statically as a CSV file (`public/framingham_heart_study.csv`) and parsed on the client side using PapaParse.
- **State Management**: A reactive state orchestrator in `DashboardClient.tsx` handles global filtering (age, sex, smoking status). React's `useMemo` is used to instantly derive filtered subsets and recalculate summary metrics without unnecessary renders.
- **Component Structure**:
  - `DashboardClient.tsx`: The primary layout wrapper managing the Masthead, sticky Filter Panel, Tab switching, and the persistent bottom Stats Strip.
  - **Modular Tab Views**:
    - `OverviewTab.tsx`: Renders various charts (Bar, Area, Horizontal Bar, Scatter).
    - `DistributionsTab.tsx`: Calculates histograms and descriptive statistics for selected continuous variables.
    - `CorrelationsTab.tsx`: Generates a Pearson correlation matrix heatmap and interactive scatter plot builder.
    - `RiskAnalysisTab.tsx`: Displays logistic odds ratios and features an interactive "patient profile" that feeds a 10-year CHD risk calculator gauge.
- **Design System**: Strict adherence to a custom "clinical-editorial" aesthetic using Tailwind CSS v4 design tokens (defined in `globals.css`) for typography, colors, and layout consistency.

## AI Tools Used
- Tool: Claude (Sonnet 4.6)
- How I used it: I used Claude to generate in-depth design specifications (found in directives folder), which I reviewed and included in my project for my coding agents to use as a reference for building out the app.
- Prompts that worked well: "Based on the project I have explained to you, write a complete design specification for the app in MD format"

- Tool: Antigravity with Gemini 3.1 Pro
- How I used it: I used Antigravity with Gemini 3.1 Pro to set up skills and agents that researched frameworks and built the initial app based on the design specifications. I also used this tool to debug and make changes to the initial app until I was satisfied with the product.
- Prompts that worked well: "Based on the design specifications provided to you, research and determine what the best front-end framework to use for this app will be.", "You are a senior full-stack developer. Your task is to build out the Framingham Heart Study Viewer app based on the design specifications provided to you in the directives folder."

## Key Design Decisions
- **Client-Sided Data Processing**: The dataset is hosted statically as a CSV and parsed entirely on the client side using PapaParse. This allows the app to be instantly deployed to Vercel as a static site without backend infrastructure.
- **Memoization**: Because the app filters over 4,000 rows of data in real-time, React's `useMemo` was used heavily across the application. This ensures that mathematical operations like the 12x12 Pearson correlation matrix and density histograms only recalculate when the filter dependencies change.
- **Custom Design System**: The app uses a custom design system built with Tailwind CSS tokens in `globals.css` to achieve a specific "clinical-editorial" aesthetic.

## Challenges & How You Solved Them
- **Vercel Deployment TypeScript Errors**: Vercel's strict build process failed due to `react-chartjs-2` throwing a type mismatch when attempting to overlay a Line chart on top of a Bar chart for the Distributions histogram. **Solution**: Antigravity diagnosed the Vercel error log locally and applied a type cast (`as any`) to bypass the strict definition, successfully pushing the fix.
- **Flexbox Overlap Issues**: Gemini heavily relied on CSS utility classes like `flex-1` without accounting for browser rendering behaviors. This caused the bottom stats strip to overlap with the charts because `flex-1` allows elements to shrink infinitely. **Solution**: I fixed the layout logic by changing the wrapper to `shrink-0` to prevent the overlapping.

## What I'd Improve With More Time
- **Web Workers**: I would offload the heavy data processing (especially the correlation matrix generation) to a background Web Worker to ensure the main UI thread never drops frames during filter slider changes.
- **Add Logistic Regression**: I would add a logistic regression model to replace the hardcoded Odds Ratios in the Risk Analysis tab to provide more accurate patient risk scores.