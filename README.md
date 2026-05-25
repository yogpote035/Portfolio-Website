# Yogesh Pote Portfolio

A modern React portfolio built with Vite. This project was migrated from a static
HTML, CSS, and JavaScript website into a reusable React application while keeping
the original UI, colors, animations, content, and branding.

## Features

- React + Vite application setup
- Premium responsive portfolio homepage
- Reusable Navbar, Footer, Hero, About, Skills, Experience, Education, Contact,
  Button, ProjectCard, and SectionTitle components
- React Router navigation
- Dedicated Projects page
- Dynamic project detail routes
- Project data stored in one editable file
- Dark mode, mobile menu, Framer Motion reveal animations, typed text, and smooth scrolling
- Professional skills, timeline experience, education, stats, and case-study project layouts
- Production build verified with Vite

## Folder Structure

```text
src/
  assets/       Images and resume PDF
  components/   Reusable UI sections and controls
  data/         Profile and project data
  hooks/        Typed text, active section, and reveal hooks
  pages/        Route-level pages
  styles/       Main CSS file
  utils/        App utilities
  App.jsx       Route setup
  main.jsx      React entrypoint
```

## Routes

- `/` - Main portfolio homepage
- `/projects` - All projects
- `/projects/click2hire` - Click2Hire case study
- `/projects/rentbox` - RentBox case study
- `/projects/tripup` - TripUp case study

## Run Locally

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Edit Projects

All project content is stored in:

```text
src/data/projects.js
```

To add a new project, copy an existing project object, update the `slug`, title,
description, links, tech stack, features, screenshots, and future improvements.
The Projects page and dynamic detail route will update automatically.

## Important Files

- `src/data/projects.js` - Add or edit portfolio projects
- `src/data/resume.js` - Skills, experience, education, and stats
- `src/data/profile.js` - Resume and social links
- `src/styles/style.css` - Main styling and responsive design
- `src/App.jsx` - Routing structure
- `src/components/ProjectCard.jsx` - Reusable project card UI
- `src/pages/ProjectDetails.jsx` - Dynamic project detail page
