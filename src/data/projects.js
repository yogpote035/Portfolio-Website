import portfolio1 from '../assets/portfolio1.jpg';
import portfolio2 from '../assets/portfolio2.jpg';
import portfolio3 from '../assets/portfolio3.jpg';
import portfolio4 from '../assets/portfolio4.jpg';
import portfolio5 from '../assets/portfolio5.jpg';
import portfolio6 from '../assets/portfolio6.jpg';

export const projects = [
  {
    slug: 'click2hire',
    title: 'Click2Hire',
    subtitle: 'Remote Job Platform',
    shortDescription:
      'Full-stack job portal with recruiter dashboards, secure role-based access, and real-time application tracking.',
    description:
      'Click2Hire is a full-stack remote job platform built for recruiters and job seekers. The application focuses on secure hiring workflows, recruiter dashboards, application tracking, and protected role-based experiences powered by a MERN stack architecture.',
    image: portfolio1,
    accent: 'Hiring workflow platform',
    techStack: ['React.js', 'Node.js', 'MongoDB', 'Redux Toolkit', 'JWE', 'RESTful APIs'],
    features: [
      'Recruiter dashboards for managing job posts and candidate pipelines',
      'Real-time application tracking for job seekers and hiring teams',
      'JWE-based route protection and secure API communication',
      'Role-based access control for recruiters and job seekers',
      'Centralized application state with Redux Toolkit',
      'Responsive UI optimized for desktop and mobile hiring workflows',
    ],
    challenges: [
      'Designing protected workflows for different user roles without duplicating UI logic',
      'Managing recruiter, seeker, and application state consistently across the app',
      'Keeping API integration secure while preserving a smooth user experience',
    ],
    screenshots: [portfolio1, portfolio2, portfolio3],
    githubUrl: 'https://github.com/yogpote035/Click2Hire-Remote-Job-Platform',
    liveUrl: 'https://click2-hire-remote-job-platform.vercel.app/',
    duration: 'Professional full-stack build',
    role: 'MERN Stack Developer',
    futureImprovements: [
      'Add advanced recruiter analytics and hiring funnel insights',
      'Integrate email notifications for application status changes',
      'Add saved searches and recommendation logic for job seekers',
    ],
  },
  {
    slug: 'rentbox',
    title: 'RentBox',
    subtitle: 'Smart Rental Platform',
    shortDescription:
      'Rental e-commerce platform with CRUD listings, Firebase authentication, booking APIs, and responsive UI components.',
    description:
      'RentBox is a smart rental marketplace designed for listing, discovering, and booking rental products. It combines Firebase Google Authentication, modular Express APIs, and reusable React UI components to create a secure and responsive rental experience.',
    image: portfolio5,
    accent: 'Rental marketplace experience',
    techStack: ['React.js', 'Firebase', 'Express.js', 'Google Auth', 'RESTful APIs', 'CSS3'],
    features: [
      'CRUD listing flows for rental products',
      'Firebase Google Authentication for fast and secure sign-in',
      'Booking workflow APIs with optimized token handling',
      'Reusable responsive UI components for listings and actions',
      'Session-aware user experience across devices',
      'Performance-focused layouts for mobile and desktop screens',
    ],
    challenges: [
      'Balancing Firebase authentication with custom backend API workflows',
      'Designing listing CRUD flows that stay simple and scalable',
      'Optimizing token handling for secure user sessions',
    ],
    screenshots: [portfolio5, portfolio6, portfolio2],
    githubUrl: 'https://github.com/yogpote035/RentBox-Smart-Rental-E-Commerce-Platform',
    liveUrl: 'https://rent-box-rentals.vercel.app/',
    duration: 'Full-stack product project',
    role: 'Frontend and API Developer',
    futureImprovements: [
      'Add payment integration for confirmed bookings',
      'Introduce owner dashboards and rental performance stats',
      'Add location-based discovery and filtering',
    ],
  },
  {
    slug: 'tripup',
    title: 'TripUp',
    subtitle: 'Travel Planning Platform',
    shortDescription:
      'Travel booking platform with bus, train, and flight modules, interactive seat selection, and itinerary planning.',
    description:
      'TripUp is a travel planning platform focused on booking journeys across buses, trains, and flights. It includes interactive seat selection workflows, itinerary planning, real-time ticket generation, and global session state management with Redux Toolkit.',
    image: portfolio3,
    accent: 'Travel booking system',
    techStack: ['React.js', 'Redux Toolkit', 'Node.js', 'RESTful APIs', 'JavaScript'],
    features: [
      'Bus, train, and flight booking modules',
      'Interactive seat selection workflows',
      'Itinerary planner powered by global Redux session state',
      'Dynamic booking flows with real-time ticket generation',
      'Travel management features for upcoming bookings',
      'Responsive layouts for fast booking across devices',
    ],
    challenges: [
      'Coordinating multi-step booking state across several travel modules',
      'Keeping seat selection interactions clear and reliable',
      'Generating ticket details dynamically after booking confirmation',
    ],
    screenshots: [portfolio3, portfolio4, portfolio1],
    githubUrl: 'https://github.com/yogpote035/tripup-travel-app',
    liveUrl: 'https://tripup-travel-app-eight.vercel.app/',
    duration: 'Travel product build',
    role: 'React Developer',
    futureImprovements: [
      'Add payment and cancellation workflows',
      'Introduce fare comparison and smarter filters',
      'Add booking notifications and downloadable tickets',
    ],
  },
];

export const getProjectBySlug = (slug) =>
  projects.find((project) => project.slug === slug);
