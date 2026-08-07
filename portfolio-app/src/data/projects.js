// Manufacturing ERP Images
import leads from '../assets/Manufacturing_ERP/leads.png';
import salesEmployee from '../assets/Manufacturing_ERP/sales-employee.png';
import SalesQuotation from '../assets/Manufacturing_ERP/sales-quotation.png';
import inventoryDashboard from '../assets/Manufacturing_ERP/inventoryDashboard.png';
import inventoryMRReceipt from '../assets/Manufacturing_ERP/inventory-m-receipt.png';
import purchaseDashboard from '../assets/Manufacturing_ERP/purchase-dashboard.png';
import productionSo from '../assets/Manufacturing_ERP/production-so.png';
import productionDashboard from '../assets/Manufacturing_ERP/production-dashboard.png';
import purchasePr from '../assets/Manufacturing_ERP/purchase-pr.png';
import purchaseVm from '../assets/Manufacturing_ERP/purchase-vm.png';
import purchaseGrn from '../assets/Manufacturing_ERP/purchase-grn.png';

// Click2Hire Images
import Click2HireApplication from '../assets/Click2Hire/Click2HireApplication.png';
import Click2HireCompanies from '../assets/Click2Hire/Click2HireCompanies.png';
import Click2HireEmployeeMatch from '../assets/Click2Hire/Click2HireEmployeeMatch.png';
import Click2HireEmployer from '../assets/Click2Hire/Click2HireEmployer.png';
import Click2HireEmpProfile from '../assets/Click2Hire/Click2HireEmpProfile.png';
import Click2HireHome from '../assets/Click2Hire/Click2HireHome.png';
import Click2HireJobPosting from '../assets/Click2Hire/Click2HireJobPosting.png';
import Click2HireJobs from '../assets/Click2Hire/Click2HireJobs.png';
import Click2HireSignUp from '../assets/Click2Hire/Click2HireSignUp.png';

// RentBox Images
import RentBoxAddRental from '../assets/RentBox/RentBoxAddRental.png';
import RentBoxFavorite from '../assets/RentBox/RentBoxFavorite.png';
import RentBoxHome from '../assets/RentBox/RentBoxHome.png';
import RentBoxOrders from '../assets/RentBox/RentBoxOrders.png';
import RentBoxSearch from '../assets/RentBox/RentBoxSearch.png';
import RentBoxSignup from '../assets/RentBox/RentBoxSignup.png';
import RentBoxViewProduct from '../assets/RentBox/RentBoxViewProduct.png';

// TripUp Images
import TripUpBookingOptions from '../assets/TripUp/TripUpBookingOptions.png';
import TripUpBookingViewAll from '../assets/TripUp/TripUpBookingViewAll.png';
import TripUpBookingViewAllOptions from '../assets/TripUp/TripUpBookingViewAllOptions.png';
import TripUpTrainBookings from '../assets/TripUp/TripUpTrainBookings.png';
import TripUpHome from '../assets/TripUp/TripUpHome.png';
import TripUpHome2 from '../assets/TripUp/TripUpHome2.png';
import TripUpLoading from '../assets/TripUp/TripUpLoading.png';
import TripUpBusBookings from '../assets/TripUp/TripUpBusBookings.png';
import TripUpFlightBookings from '../assets/TripUp/TripUpFlightBookings.png';
import TripUpPlanning from '../assets/TripUp/TripUpPlanning.png';
import TripUpPlanning2 from '../assets/TripUp/TripUpPlanning2.png';
import TripUpPosts from '../assets/TripUp/TripUpPosts.png';
import TripUpPostView from '../assets/TripUp/TripUpPostView.png';

// Cab Management ERP Images
import CabERPCars from '../assets/Cab_Management_system/cars.png';
import CabERPDashboard from '../assets/Cab_Management_system/dashboard.png';
import CabERPDrivers from '../assets/Cab_Management_system/drivers.png';
import CabERPInquiries from '../assets/Cab_Management_system/inquiries.png';
import CabERPInvoices from '../assets/Cab_Management_system/invoices.png';
import CabERPLogin from '../assets/Cab_Management_system/Login.png';
import CabERPManageAdmins from '../assets/Cab_Management_system/manageAdmins.png';
import CabERPProfile from '../assets/Cab_Management_system/profile.png';
import CabERPReports from '../assets/Cab_Management_system/reports.png';
import CabERPTrips from '../assets/Cab_Management_system/Trips.png';
import CabERPDarkMode from '../assets/Cab_Management_system/darkMode.png';


export const projects = [
  {
    slug: 'cab-management-erp',
    title: 'Cab Management ERP',
    subtitle: 'Billing & Operations Automation',
    shortDescription:
      'Full-stack ERP platform for corporate cab operations, trip management, invoicing, payment tracking, and workflow automation.',

    description:
      'Cab Management & Billing Automation ERP is a full-stack MERN application designed to streamline corporate transportation operations. The platform centralizes cab bookings, driver and vehicle management, trip tracking, duty slips, invoicing, payments, reporting, and administrative workflows through a secure role-based architecture.',

    image: CabERPDashboard,

    accent: 'Enterprise operations platform',

    techStack: [
      'React.js',
      'Redux Toolkit',
      'Node.js',
      'Express.js',
      'MongoDB',
      'JWT',
      'RBAC',
      'Tailwind CSS',
      'Nodemailer',
      'PDFKit',
      'ExcelJS',
      'Imap'
    ],

    features: [
      'Corporate cab booking and inquiry management workflows',
      'Driver, vehicle, trip, and duty slip management modules',
      'Invoice generation and payment tracking system',
      'Role-based access control for administrators and operations teams',
      'Dashboard analytics with operational reporting and insights',
      'PDF invoice generation and Excel report exports',
      'Automated email notifications and booking workflow automation',
      'Audit activity logs and responsive dark/light admin dashboard'
    ],

    challenges: [
      'Designing ERP workflows that connect bookings, trips, invoices, and payments in a single platform',
      'Managing complex application state across multiple operational modules using Redux Toolkit',
      'Building secure role-based access controls while maintaining a seamless administrative experience'
    ],

    screenshots: [
      CabERPDashboard,
      CabERPTrips,
      CabERPDrivers,
      CabERPCars,
      CabERPInquiries,
      CabERPInvoices,
      CabERPManageAdmins,
      CabERPReports,
      CabERPProfile,
      CabERPDarkMode,
      CabERPLogin,
    ],


    githubUrl: 'https://github.com/yogpote035/Cab-Mgmnt-project',

    liveUrl: 'https://cab-mgmnt-project.vercel.app/',

    duration: 'Professional full-stack build',

    role: 'MERN Stack Developer',

    futureImprovements: [
      'Add real-time GPS vehicle tracking and route optimization',
      'Integrate payment gateway support for online invoice payments',
      'Implement advanced business analytics and operational forecasting'
    ]
  }
  ,
  {
    slug: 'manufacturing-erp',
    title: 'Manufacturing ERP',
    subtitle: 'Enterprise Manufacturing Management System',

    shortDescription:
      'Enterprise ERP platform for managing manufacturing operations including production planning, inventory, HRMS, warehouse, transport, and sales workflows.',

    description:
      'Manufacturing ERP is a large-scale enterprise management platform currently being developed as part of my company work experience. The system is designed to streamline manufacturing workflows across multiple departments including sales, production planning, inventory management, purchase operations, quality checks, warehouse tracking, transport coordination, operator management, and employee HRMS. The platform focuses on improving operational efficiency, centralized workflow management, and real-time process visibility using scalable React architecture and Redux Toolkit.',

    image: leads,

    accent: 'Enterprise ERP Solution',

    techStack: [
      'React.js',
      'Redux Toolkit',
      'Node.js',
      'Express.js',
      'MySQL',
      'RESTful APIs',
      'Tailwind CSS',
      'JavaScript',
    ],

    features: [
      'Sales order and quotation management',
      'Production planning and workflow scheduling',
      'Inventory and stock management system',
      'Purchase and vendor management workflows',
      'Quality check and inspection modules',
      'Warehouse stock movement and tracking',
      'Operator login and role-based dashboards',
      'Transport and dispatch management',
      'Real-time ERP workflow handling with Redux Toolkit',
      'Department-wise role-based access control',
      'Responsive enterprise dashboards and workflow panels',
    ],

    challenges: [
      'Managing complex interconnected ERP workflows across multiple modules',
      'Handling large-scale state management using Redux Toolkit',
      'Maintaining synchronization between production, inventory, and warehouse systems',
      'Building scalable and reusable frontend architecture for enterprise applications',
    ],

    screenshots: [leads, salesEmployee, SalesQuotation, inventoryMRReceipt, purchaseDashboard, productionDashboard, purchasePr, purchaseVm, purchaseGrn, inventoryDashboard, productionSo],

    githubUrl: '',

    liveUrl: '',

    duration: 'Ongoing company project',

    role: 'MERN Stack Developer Intern',

    futureImprovements: [
      'Advanced analytics and reporting dashboards',
      'Barcode and QR-based warehouse management',
      'Real-time production monitoring',
      'Approval and notification workflows',
      'AI-powered inventory and demand forecasting',
    ],

    note:
      'This is an enterprise company project currently being worked on during my internship, so source code and live deployment are not publicly available.',
  },
  {
    slug: 'click2hire',
    title: 'Click2Hire',
    subtitle: 'Remote Job Platform',
    shortDescription:
      'Full-stack job portal with recruiter dashboards, secure role-based access, and real-time application tracking.',
    description:
      'Click2Hire is a full-stack remote job platform built for recruiters and job seekers. The application focuses on secure hiring workflows, recruiter dashboards, application tracking, and protected role-based experiences powered by a MERN stack architecture.',
    image: Click2HireHome,
    accent: 'Hiring workflow platform',
    techStack: ['React.js', 'Node.js', 'MongoDB', 'Redux Toolkit', 'JWE', 'RESTful APIs',"Gemini API"],
    features: [
      'Recruiter dashboards for managing job posts and candidate pipelines',
      'Real-time application tracking for job seekers and hiring teams',
      'JWE-based route protection and secure API communication',
      'Role-based access control for recruiters and job seekers',
      'Centralized application state with Redux Toolkit',
      'Responsive UI optimized for desktop and mobile hiring workflows',
      'AI Based Resume Review and ATS Optimization powered by Gemini API',
    ],
    challenges: [
      'Designing protected workflows for different user roles without duplicating UI logic',
      'Managing recruiter, seeker, and application state consistently across the app',
      'Keeping API integration secure while preserving a smooth user experience',
    ],
    screenshots: [Click2HireHome, Click2HireEmployeeMatch, Click2HireEmployer, Click2HireEmpProfile, Click2HireJobPosting, Click2HireJobs, Click2HireSignUp, Click2HireCompanies, Click2HireApplication],
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
    image: RentBoxHome,
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
    screenshots: [RentBoxHome, RentBoxFavorite, RentBoxViewProduct, RentBoxAddRental, RentBoxSearch, RentBoxOrders, RentBoxSignup],
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
    image: TripUpHome2,
    accent: 'Travel booking system',
    techStack: ['React.js', 'Redux Toolkit', 'Node.js', 'RESTful APIs', 'JavaScript',"Gemini API"],
    features: [
      'Bus, train, and flight booking modules',
      'Interactive seat selection workflows',
      'Itinerary planner powered by Gemini API',
      'Dynamic booking flows with real-time ticket generation',
      'Travel management features for upcoming bookings',
      'Responsive layouts for fast booking across devices',
      'AI-powered Itinerary Planning using Gemini API',
    ],
    challenges: [
      'Coordinating multi-step booking state across several travel modules',
      'Keeping seat selection interactions clear and reliable',
      'Generating ticket details dynamically after booking confirmation',
    ],
    screenshots: [TripUpHome, TripUpHome2, TripUpLoading, TripUpBusBookings, TripUpFlightBookings, TripUpPlanning, TripUpPostView, TripUpPosts, TripUpPlanning2, TripUpBookingOptions, TripUpBookingViewAll, TripUpBookingViewAllOptions, TripUpTrainBookings],
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
