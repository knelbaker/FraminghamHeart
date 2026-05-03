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

The application is designed as a highly interactive, client-side single-page dashboard using the Next.js App Router.

- **Data Layer**: The Framingham Heart Study dataset is hosted statically as a CSV file (`public/framingham_heart_study.csv`) and parsed on the client side using PapaParse.
- **State Management**: A reactive state orchestrator in `DashboardClient.tsx` handles global filtering (age, sex, smoking status). React's `useMemo` is heavily leveraged to instantly derive filtered subsets and recalculate summary metrics without redundant renders.
- **Component Structure**:
  - `DashboardClient.tsx`: The primary layout wrapper managing the Masthead, sticky Filter Panel, Tab switching, and the persistent bottom Stats Strip.
  - **Modular Tab Views**:
    - `OverviewTab.tsx`: Renders diverse high-level charts (Bar, Area, Horizontal Bar, Scatter).
    - `DistributionsTab.tsx`: Dynamically calculates histograms and descriptive statistics for selected continuous variables.
    - `CorrelationsTab.tsx`: Generates an on-the-fly Pearson correlation matrix heatmap and interactive scatter plot builder.
    - `RiskAnalysisTab.tsx`: Displays logistic odds ratios and features an interactive "patient profile" that feeds a 10-year CHD risk calculator gauge.
- **Design System**: Strict adherence to a custom "clinical-editorial" aesthetic using Tailwind CSS v4 design tokens (defined in `globals.css`) for typography, colors, and layout consistency.

## AI Tools Used
 - Tool: [e.g. Cursor + Claude]
- How I used it: [e.g. "Scaffolded initial component structure, debugged state management issue"]
- Prompts that worked well: [optional but impressive] 

- Tool Claude (Sonnet 4.6)
- How I used it: I used Claude to generate in-depth design specifications (found in directives folder), which I reviewed and included in my project for my coding agents to use as a reference for building out the app.
- Prompts that worked well: "Based on the project information, write a complete design specification in MD format"

- Tool Antigravity with Gemini 3.1 Pro
- How I used it: I used Antigravity with Gemini 3.1 Pro to set up agents that researched frameworks and design choices and helped build out the app based on the design specifications.
- Prompts that worked well: "Based on the design specifications provided to you, research and determine what the best front-end framework to use for this app will be.", "You are a senior full-stack developer. Your task is to build out the Framingham Heart Study Viewer app based on the design specifications provided to you in the directives folder."

## Key Design Decisions
- **Client-Side Data Processing**: Instead of standing up a complex backend database, the Framingham dataset is hosted statically as a CSV and parsed entirely on the client side using PapaParse. This allows the app to be instantly deployed to Vercel as a static site without backend infrastructure.
- **Aggressive Memoization**: Because the app filters over 4,000 rows of data in real-time, React's `useMemo` was utilized extensively across the application. This ensures that heavy mathematical operations—like the 12x12 Pearson correlation matrix and density histograms—only recalculate when the specific filter dependencies change.
- **Custom Design System over Component Libraries**: To achieve the strict "clinical-editorial" aesthetic requested in the design specs, we bypassed heavy component libraries (like Material UI) and built custom Tailwind CSS tokens in `globals.css` to perfectly match the requested styling.

## Challenges & How You Solved Them
- **Vercel Deployment TypeScript Errors**: Vercel's strict build process failed due to `react-chartjs-2` throwing a type mismatch when attempting to overlay a Line chart on top of a Bar chart for the Distributions histogram. **Solution**: Antigravity diagnosed the Vercel error log locally and applied a type cast (`as any`) to bypass the strict definition, successfully pushing the fix.
- **Flexbox Overlap Issues**: Initially, the bottom Stats Strip was floating over the charts because of how `flex-1` shrinks containers. **Solution**: Diagnosed the CSS layout issue and wrapped the chart tabs in a `shrink-0 flex-grow` container, explicitly preventing the browser from crushing the charts to fit the viewport.

## What I'd Improve With More Time
- **Web Workers**: Offload the heavy data processing (especially the correlation matrix generation) to a background Web Worker to ensure the main UI thread never drops frames during rapid filter slider changes.
- **True Logistic Regression**: Replace the hardcoded Odds Ratios in the Risk Analysis tab with an actual logistic regression model running in JavaScript to provide statistically rigorous patient risk scores.
- **Dataset Virtualization**: Implement table virtualization to allow the dashboard to seamlessly scale if the dataset grows from 4,000 rows to 100,000+ rows.
