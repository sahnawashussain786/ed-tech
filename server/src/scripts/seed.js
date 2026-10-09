import 'dotenv/config' // load server/.env so MONGODB_URI is respected (server.js does this too)
import mongoose from 'mongoose'
import { User, Course, Enrollment, Review, Order } from '../models/index.js'

const force = process.argv.includes('--fresh') || process.env.SEED_FORCE === 'true'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/learnhub'

// ── Media helpers ────────────────────────────────────────────────────────────
// Every YouTube ID below was validated against the oEmbed API (no dead links).
// source.unsplash.com shut down in 2024 — picsum serves deterministic photos.
const yt = (id) => `https://www.youtube.com/embed/${id}`
const img = (seed, w = 960, h = 540) => `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`
const avatar = (seed) =>
  `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`

// Compact lesson builder: [title, youtubeId, minutes, isPreview?, description?, resources?]
const L = (title, videoId, durationMin, isPreview = false, description = '', resources = []) => ({
  title,
  videoUrl: videoId ? yt(videoId) : '',
  durationMin,
  isPreview,
  description,
  resources,
})

// ── Demo users ───────────────────────────────────────────────────────────────
const users = [
  {
    name: 'Ada Lovelace',
    email: 'instructor@learnhub.dev',
    password: 'password123',
    role: 'instructor',
    headline: 'Senior Software Engineer & Educator — 12 years in industry',
    bio: 'Ada has shipped production systems at scale and loves teaching. Her courses focus on practical, project-driven learning with zero fluff.',
    avatarUrl: avatar('Ada Lovelace'),
  },
  {
    name: 'Grace Hopper',
    email: 'grace@learnhub.dev',
    password: 'password123',
    role: 'instructor',
    headline: 'Data Scientist · Ex-FAANG · Kaggle Grandmaster',
    bio: 'Grace turns messy data into products. She has mentored hundreds of engineers into data roles.',
    avatarUrl: avatar('Grace Hopper'),
  },
  {
    name: 'Sam Student',
    email: 'student@learnhub.dev',
    password: 'password123',
    role: 'student',
    headline: 'Aspiring full-stack developer',
    bio: '',
    avatarUrl: avatar('Sam Student'),
  },
  {
    name: 'Maya Rodriguez',
    email: 'maya@learnhub.dev',
    password: 'password123',
    role: 'instructor',
    headline: 'Product Designer · Figma Community favorite',
    bio: 'Maya designs interfaces people love. She has taught design to over 50,000 students online.',
    avatarUrl: avatar('Maya Rodriguez'),
  },
  {
    name: 'Kenji Tanaka',
    email: 'kenji@learnhub.dev',
    password: 'password123',
    role: 'instructor',
    headline: 'Growth Marketer & Photographer · 2x startup exits',
    bio: 'Kenji has grown three brands from zero to seven figures. He also shoots street photography on weekends.',
    avatarUrl: avatar('Kenji Tanaka'),
  },
  {
    name: 'Amara Okafor',
    email: 'amara@learnhub.dev',
    password: 'password123',
    role: 'instructor',
    headline: 'Music Producer & Pianist · Berklee-trained',
    bio: 'Amara produces for indie artists and teaches music production with a focus on finishing tracks, not just starting them.',
    avatarUrl: avatar('Amara Okafor'),
  },
]

// ── Demo courses (22) ────────────────────────────────────────────────────────
const courses = [
  // ── Development ──
  {
    title: 'The Complete Web Development Bootcamp 2026',
    subtitle: 'HTML, CSS, JavaScript, React, Node & MongoDB — build 10 real projects',
    description:
      'Go from absolute zero to deploying full-stack MERN applications. This project-driven bootcamp covers modern HTML5 & CSS3 (including Flexbox, Grid and animations), JavaScript ES2024, React 19 with hooks and server-state patterns, Node.js & Express, MongoDB with Mongoose, authentication from scratch, REST API design, and deployment on Vercel.\n\nEvery module ends with a hands-on project: a landing page, a to-do app, a movie search engine, a chat UI, a REST API, and a capstone full-stack e-commerce store.',
    category: 'Development',
    level: 'Beginner',
    language: 'English',
    price: 49.99,
    thumbnailUrl: img('webdev-bootcamp'),
    instructorEmail: 'instructor@learnhub.dev',
    whatYouWillLearn: [
      'Build responsive, accessible websites with semantic HTML & modern CSS',
      'Master JavaScript fundamentals through 30+ coding exercises',
      'Create component-driven UIs with React 19 and hooks',
      'Design REST APIs with Node, Express and MongoDB',
      'Implement JWT authentication and authorization flows',
      'Deploy a complete MERN app to production',
    ],
    requirements: ['A computer with internet access', 'No prior programming experience needed'],
    tags: ['web development', 'react', 'nodejs', 'mongodb', 'javascript'],
    sections: [
      {
        title: 'Getting Started',
        lessons: [
          L('Welcome & how this course works', 'Ke90Tje7VS0', 6, true, 'What you will build, how the projects are structured, and how to get help.'),
          L('Setting up your development environment', 'Ke90Tje7VS0', 12, true, 'Install VS Code, Node.js and Git. We test everything before moving on.'),
          L('How the web works: clients, servers & DNS', 'Ke90Tje7VS0', 9, false, 'A mental model of what happens when you press Enter.'),
        ],
      },
      {
        title: 'HTML & CSS Fundamentals',
        lessons: [
          L('Semantic HTML in practice', 'dFgzHOX84xQ', 14, false, 'Headings, landmarks, forms, and why semantics matter for accessibility.'),
          L('Flexbox & Grid deep dive', 'dFgzHOX84xQ', 18, false, 'The two layout systems, when to use which, and common patterns.'),
          L('Project: personal portfolio page', 'dFgzHOX84xQ', 25, false, 'Build and deploy a responsive portfolio from scratch.'),
        ],
      },
      {
        title: 'JavaScript Essentials',
        lessons: [
          L('Variables, types & control flow', 'jS4aFq5-91M', 16, false, 'let/const, primitives, truthiness, loops and branches.'),
          L('Functions, arrays & objects', 'jS4aFq5-91M', 21, false, 'Arrow functions, destructuring, map/filter/reduce.'),
          L('DOM manipulation & events', 'jS4aFq5-91M', 17, false, 'Querying, event delegation, and small interactive widgets.'),
          L('Project: interactive quiz app', 'jS4aFq5-91M', 32, false, 'State, scoring, timers — a complete vanilla JS project.'),
        ],
      },
      {
        title: 'React & the Modern Frontend',
        lessons: [
          L('Components, props & state', 'LDB4uaJ87e0', 19, false, 'Thinking in components and one-way data flow.'),
          L('Hooks, effects & data fetching', 'LDB4uaJ87e0', 24, false, 'useState, useEffect, custom hooks, and cleanup.'),
          L('Project: movie discovery app', 'LDB4uaJ87e0', 41, false, 'Search, pagination and favorites with a public API.'),
        ],
      },
    ],
  },
  {
    title: 'Node.js, Express & MongoDB — The Complete Guide',
    subtitle: 'Build production-grade REST APIs with auth, testing and deployment',
    description:
      'The backend companion to modern JavaScript. Design robust REST APIs with Express 5, model data with Mongoose, secure endpoints with JWT & role-based access control, handle errors like a pro, write clean controller/service layers, and deploy serverless on Vercel.',
    category: 'Development',
    level: 'Intermediate',
    price: 39.99,
    thumbnailUrl: img('node-express-api'),
    instructorEmail: 'instructor@learnhub.dev',
    whatYouWillLearn: [
      'Architect Express apps with routers, controllers & middleware',
      'Model relational-style data in MongoDB with Mongoose',
      'Secure APIs with JWT auth and role guards',
      'Centralize error handling and validation',
      'Deploy serverless APIs on Vercel',
    ],
    requirements: ['Comfortable with JavaScript basics', 'Some exposure to databases helps'],
    tags: ['nodejs', 'express', 'mongodb', 'api', 'backend'],
    sections: [
      {
        title: 'Node & Express Foundations',
        lessons: [
          L('The Node runtime & module system', 'Oe421EPjeBE', 11, true, 'Event loop, modules, and the ecosystem.'),
          L('Building your first Express server', 'Oe421EPjeBE', 15, false, 'Routes, middleware, and JSON handling.'),
          L('Routing & middleware patterns', 'Oe421EPjeBE', 18, false, 'Composable middleware chains and routers.'),
        ],
      },
      {
        title: 'MongoDB & Mongoose',
        lessons: [
          L('Documents, collections & schemas', '_7UQPve99r4', 13, false, 'Modelling data the document way.'),
          L('Relationships, population & indexes', '_7UQPve99r4', 20, false, 'Refs, population, and index strategy.'),
          L('Project: book library API', '_7UQPve99r4', 38, false, 'Full CRUD with search and pagination.'),
        ],
      },
      {
        title: 'Auth, Security & Deployment',
        lessons: [
          L('Password hashing & JWT sessions', 'fgTGADljAeg', 22, false, 'bcrypt, tokens, and refresh strategies.'),
          L('Helmet, CORS & rate limiting', 'fgTGADljAeg', 12, false, 'Hardening your API in minutes.'),
          L('Shipping to Vercel serverless', 'fgTGADljAeg', 16, false, 'Cold starts, connection pooling, and env config.'),
        ],
      },
    ],
  },
  {
    title: 'React 19 Masterclass: Hooks, State & Patterns',
    subtitle: 'From useState to advanced component patterns and performance',
    description:
      'Level up from React beginner to confident practitioner. Deep-dive into every hook, state management options (context, reducers, external stores), composition patterns, render performance, suspense-friendly data flows, and testing React components.',
    category: 'Development',
    level: 'Advanced',
    price: 59.99,
    thumbnailUrl: img('react-masterclass'),
    instructorEmail: 'instructor@learnhub.dev',
    whatYouWillLearn: [
      'Master all React hooks and when to reach for each',
      'Structure large apps with composition patterns',
      'Diagnose and fix render performance issues',
      'Manage complex state with reducers & context',
    ],
    requirements: ['Solid JavaScript skills', 'Built at least one small React app'],
    tags: ['react', 'hooks', 'frontend', 'javascript'],
    sections: [
      {
        title: 'Thinking in Components',
        lessons: [
          L('Composition over configuration', 'w7ejDZ8SWv8', 10, true, 'Why composition beats prop-drilling every time.'),
          L('Controlled vs uncontrolled components', 'w7ejDZ8SWv8', 14, false, 'Forms the React way — and when to just let the DOM win.'),
        ],
      },
      {
        title: 'State Architecture',
        lessons: [
          L('useReducer for complex flows', 'w7ejDZ8SWv8', 19, false, 'Reducers, actions, and predictable updates.'),
          L('Context without the re-render trap', 'w7ejDZ8SWv8', 17, false, 'Splitting state and memoizing consumers.'),
          L('Project: draggable kanban board', 'w7ejDZ8SWv8', 45, false, 'Drag & drop, optimistic updates, persistence.'),
        ],
      },
    ],
  },
  {
    title: 'Tailwind CSS: Utility-First Styling in Practice',
    subtitle: 'Design systems, responsive layouts and dark mode with Tailwind v4',
    description:
      'Stop fighting custom CSS. Learn the utility-first workflow, build a complete design system with theme tokens, master responsive and state variants, add dark mode, and ship production UIs fast. Includes a landing page, dashboard and component library project.',
    category: 'Development',
    level: 'Beginner',
    price: 24.99,
    thumbnailUrl: img('tailwind-css'),
    instructorEmail: 'instructor@learnhub.dev',
    whatYouWillLearn: [
      'Think utility-first and structure clean markup',
      'Configure design tokens with the @theme directive',
      'Build responsive layouts without media-query spaghetti',
      'Create reusable component patterns',
    ],
    requirements: ['Basic HTML & CSS'],
    tags: ['tailwind', 'css', 'frontend', 'design systems'],
    sections: [
      {
        title: 'Tailwind Foundations',
        lessons: [
          L('Why utility-first CSS works', 'dFgzHOX84xQ', 9, true, 'The philosophy and the workflow.'),
          L('Spacing, typography & color tokens', 'dFgzHOX84xQ', 16, false, 'Consistency through constraint.'),
          L('Responsive & state variants', 'dFgzHOX84xQ', 14, false, 'Mobile-first prefixes, hover/focus, dark mode.'),
        ],
      },
      {
        title: 'Projects',
        lessons: [
          L('Landing page from scratch', 'UBOj6rqRUME', 34, false, 'Hero, features, pricing, footer — fully responsive.'),
          L('Dashboard UI with components', 'UBOj6rqRUME', 42, false, 'Cards, tables, and sidebar patterns.'),
        ],
      },
    ],
  },
  {
    title: 'JavaScript: From Zero to Confident',
    subtitle: 'The language of the web, taught through 100+ exercises',
    description:
      'A patient, exercise-driven introduction to JavaScript for absolute beginners. Variables, functions, arrays, objects, the DOM, events, and fetch — with hundreds of small challenges so concepts actually stick.',
    category: 'Development',
    level: 'Beginner',
    price: 0,
    thumbnailUrl: img('javascript-zero'),
    instructorEmail: 'grace@learnhub.dev',
    whatYouWillLearn: [
      'Write and read modern JavaScript fluently',
      'Manipulate the DOM and handle events',
      'Fetch data from APIs and render it',
      'Debug with confidence using devtools',
    ],
    requirements: ['No programming experience needed'],
    tags: ['javascript', 'beginner', 'dom'],
    sections: [
      {
        title: 'Language Basics',
        lessons: [
          L('Hello, JavaScript', 'PkZNo7MFNFg', 8, true, 'Your first program and how to run it.'),
          L('Variables & types', 'PkZNo7MFNFg', 15, true, 'let, const, strings, numbers, booleans.'),
          L('Loops & conditionals', 'PkZNo7MFNFg', 18, false, 'Repetition and branching.'),
        ],
      },
      {
        title: 'Working with Data',
        lessons: [
          L('Arrays & array methods', 'jS4aFq5-91M', 22, false, 'map, filter, find, reduce in practice.'),
          L('Objects & JSON', 'jS4aFq5-91M', 17, false, 'The data shapes of the web.'),
          L('Fetching from APIs', 'jS4aFq5-91M', 20, false, 'fetch, promises, and rendering results.'),
        ],
      },
    ],
  },

  // ── Data Science ──
  {
    title: 'Data Science & Machine Learning with Python',
    subtitle: 'NumPy, pandas, scikit-learn and your first ML models',
    description:
      'Crunch real datasets with the Python data stack. Learn NumPy arrays, pandas DataFrames, cleaning messy CSVs, exploratory analysis, visualization, and then train classic ML models — regression, classification, clustering — with scikit-learn. Ends with an end-to-end Kaggle-style project.',
    category: 'Data Science',
    level: 'Intermediate',
    price: 44.99,
    thumbnailUrl: img('data-science-ml'),
    instructorEmail: 'grace@learnhub.dev',
    whatYouWillLearn: [
      'Wrangle data fluently with pandas',
      'Visualize patterns with matplotlib & seaborn',
      'Train and evaluate ML models with scikit-learn',
      'Complete an end-to-end data project',
    ],
    requirements: ['Basic Python syntax', 'High-school math'],
    tags: ['python', 'data science', 'machine learning', 'pandas'],
    sections: [
      {
        title: 'The Python Data Stack',
        lessons: [
          L('NumPy arrays vs Python lists', 'i_LwzRVP7bg', 12, true, 'Vectorization and why it matters.'),
          L('pandas DataFrames from scratch', 'i_LwzRVP7bg', 22, false, 'Loading, selecting, filtering, grouping.'),
          L('Cleaning messy real-world data', 'i_LwzRVP7bg', 26, false, 'Missing values, dtypes, outliers.'),
        ],
      },
      {
        title: 'Machine Learning Foundations',
        lessons: [
          L('Your first linear regression', 'hDKCxebp88A', 18, false, 'Fit, predict, and interpret.'),
          L('Classification & model evaluation', 'hDKCxebp88A', 26, false, 'Train/test splits, precision, recall, ROC.'),
          L('Project: Titanic survival prediction', 'hDKCxebp88A', 52, false, 'Feature engineering to submission.'),
        ],
      },
    ],
  },
  {
    title: 'Python for Absolute Beginners',
    subtitle: 'Learn to code with the friendliest language there is',
    description:
      'Start from zero and learn Python the practical way: scripts, files, loops, functions, and small automation projects. Perfect first language — the same fundamentals transfer everywhere.',
    category: 'Data Science',
    level: 'Beginner',
    price: 0,
    thumbnailUrl: img('python-beginners'),
    instructorEmail: 'grace@learnhub.dev',
    whatYouWillLearn: [
      'Write clean Python scripts from day one',
      'Automate boring file & text tasks',
      'Understand functions, loops and data structures',
      'Build a solid base for data science or web dev',
    ],
    requirements: ['No experience needed — just curiosity'],
    tags: ['python', 'beginner', 'programming'],
    sections: [
      {
        title: 'First Steps',
        lessons: [
          L('Installing Python & running scripts', 'ix9cRaBkVe0', 9, true, 'Set up once, run anywhere.'),
          L('Variables, strings & numbers', 'ix9cRaBkVe0', 14, false, 'The building blocks.'),
          L('Lists, dicts & sets', 'ix9cRaBkVe0', 19, false, 'Choosing the right container.'),
        ],
      },
      {
        title: 'Real Programs',
        lessons: [
          L('Functions & clean structure', 'ix9cRaBkVe0', 16, false, 'Refactor spaghetti into functions.'),
          L('Working with files', 'ix9cRaBkVe0', 13, false, 'Read, write, and parse.'),
          L('Project: expense tracker CLI', 'ix9cRaBkVe0', 30, false, 'A useful tool you will actually keep.'),
        ],
      },
    ],
  },
  {
    title: 'SQL & Databases for Developers',
    subtitle: 'Query, design and optimize relational databases',
    description:
      'SQL remains the most durable skill in tech. Learn SELECTs, JOINs, aggregations, indexes and schema design through dozens of hands-on query challenges against a realistic e-commerce dataset.',
    category: 'Data Science',
    level: 'Beginner',
    price: 29.99,
    thumbnailUrl: img('sql-databases'),
    instructorEmail: 'grace@learnhub.dev',
    whatYouWillLearn: [
      'Write confident SELECT, JOIN and GROUP BY queries',
      'Design normalized schemas with the right keys',
      'Understand indexes and query performance',
      'Model one-to-many and many-to-many relations',
    ],
    requirements: ['No database experience needed'],
    tags: ['sql', 'databases', 'postgres', 'data'],
    sections: [
      {
        title: 'Query Fundamentals',
        lessons: [
          L('SELECT: your first queries', '_7UQPve99r4', 12, true, 'Filtering, ordering, limiting.'),
          L('JOINs demystified', '_7UQPve99r4', 21, false, 'Inner, left, and the anti-join trick.'),
          L('Aggregations & GROUP BY', '_7UQPve99r4', 18, false, 'Counts, sums, and window functions.'),
        ],
      },
      {
        title: 'Design & Performance',
        lessons: [
          L('Schema design & normalization', 'fgTGADljAeg', 24, false, 'Keys, constraints, and when to denormalize.'),
          L('Indexes & the query planner', 'fgTGADljAeg', 20, false, 'Make slow queries fast.'),
          L('Project: analytics queries for a store', 'fgTGADljAeg', 35, false, 'Real business questions, answered in SQL.'),
        ],
      },
    ],
  },

  // ── Design ──
  {
    title: 'UI/UX Design Essentials with Figma',
    subtitle: 'Design beautiful, usable interfaces from first principles',
    description:
      'Learn the craft behind great interfaces: layout & spacing systems, typography scales, color theory, components and variants in Figma, prototyping flows, and handoff to developers. Includes 4 portfolio-ready design projects.',
    category: 'Design',
    level: 'Beginner',
    price: 34.99,
    thumbnailUrl: img('figma-uiux'),
    instructorEmail: 'maya@learnhub.dev',
    whatYouWillLearn: [
      'Apply layout, spacing & typography systems',
      'Design with components & variants in Figma',
      'Prototype clickable user flows',
      'Build 4 portfolio projects',
    ],
    requirements: ['A free Figma account'],
    tags: ['figma', 'ui design', 'ux', 'design systems'],
    sections: [
      {
        title: 'Design Foundations',
        lessons: [
          L('Layout, spacing & the 8pt grid', 'QJBP2uy8LcU', 13, true, 'Why consistent spacing makes designs feel right.'),
          L('Typography that communicates', 'QJBP2uy8LcU', 15, false, 'Scale, hierarchy, and readability.'),
          L('Color theory for interfaces', 'QJBP2uy8LcU', 17, false, 'Palettes, contrast, and accessibility.'),
        ],
      },
      {
        title: 'Figma in Practice',
        lessons: [
          L('Components, variants & auto layout', 'jwCmIBJ8Jtc', 24, false, 'Design like an engineer.'),
          L('Prototyping user flows', 'jwCmIBJ8Jtc', 19, false, 'Clickable flows and user testing.'),
          L('Project: design a mobile banking app', 'jwCmIBJ8Jtc', 48, false, 'From wireframe to polished prototype.'),
        ],
      },
    ],
  },
  {
    title: 'Figma Crash Course: Design Your First App',
    subtitle: 'From blank canvas to clickable prototype in one weekend',
    description:
      'A fast, friendly introduction to Figma for people who have never opened a design tool. Learn the UI, master the 20% of features you will use 80% of the time, and finish with a real app design.',
    category: 'Design',
    level: 'Beginner',
    price: 0,
    thumbnailUrl: img('figma-crash'),
    instructorEmail: 'maya@learnhub.dev',
    whatYouWillLearn: [
      'Navigate Figma like a pro from day one',
      'Use frames, shapes, text and images',
      'Build a simple clickable prototype',
      'Share and get feedback on your designs',
    ],
    requirements: ['A free Figma account'],
    tags: ['figma', 'beginner', 'prototyping'],
    sections: [
      {
        title: 'Figma Basics',
        lessons: [
          L('The Figma UI in 13 minutes', 'jQ1sfKIl50E', 13, true, 'A guided tour of every panel that matters.'),
          L('Frames, grids & shapes', 'jQ1sfKIl50E', 14, false, 'The canvas fundamentals.'),
          L('Text, color & styles', 'jQ1sfKIl50E', 12, false, 'Making things look intentional.'),
        ],
      },
      {
        title: 'Your First App Design',
        lessons: [
          L('Wireframing the flow', 'jQ1sfKIl50E', 18, false, 'Boxes and arrows before pixels.'),
          L('High-fidelity screens', 'jQ1sfKIl50E', 26, false, 'Turn the wireframe into a real design.'),
          L('Prototype & share', 'jQ1sfKIl50E', 15, false, 'Link it up and send it around.'),
        ],
      },
    ],
  },

  // ── Marketing ──
  {
    title: 'Digital Marketing Masterclass 2026',
    subtitle: 'SEO, content, social & paid ads that actually convert',
    description:
      'A practical tour of modern marketing: keyword research and on-page SEO, content strategy that compounds, social media systems, email funnels, and paid acquisition on Meta & Google. Includes swipe files and campaign templates.',
    category: 'Marketing',
    level: 'All Levels',
    price: 29.99,
    thumbnailUrl: img('marketing-2026'),
    instructorEmail: 'kenji@learnhub.dev',
    whatYouWillLearn: [
      'Run a full SEO audit on any site',
      'Plan a content calendar that compounds',
      'Launch your first paid ad campaign',
      'Build an email funnel from scratch',
    ],
    requirements: ['No prior marketing experience needed'],
    tags: ['seo', 'marketing', 'social media', 'ads'],
    sections: [
      {
        title: 'Foundations',
        lessons: [
          L('The modern marketing funnel', 'j7gXepN1nJI', 9, true, 'Awareness to advocacy in 2026.'),
          L('Positioning & audience research', 'j7gXepN1nJI', 14, false, 'Find the people who already want this.'),
        ],
      },
      {
        title: 'Channels & Campaigns',
        lessons: [
          L('SEO that survives algorithm updates', '2Hylr7iyoSI', 21, false, 'Search intent, on-page, and links.'),
          L('Paid ads on Meta & Google', '2Hylr7iyoSI', 27, false, 'Structure, creative, and budgets.'),
          L('Email funnels & automation', '2Hylr7iyoSI', 18, false, 'Welcome sequences that sell.'),
        ],
      },
    ],
  },
  {
    title: 'SEO From Zero: Rank Your First Page',
    subtitle: 'Keyword research, on-page SEO and link building for beginners',
    description:
      'Everything you need to get a page ranking: how search works, finding keywords you can win, writing content that matches intent, technical basics, and earning your first links — all with free tools.',
    category: 'Marketing',
    level: 'Beginner',
    price: 19.99,
    thumbnailUrl: img('seo-zero'),
    instructorEmail: 'kenji@learnhub.dev',
    whatYouWillLearn: [
      'Find low-competition keywords with free tools',
      'Write content that matches search intent',
      'Fix the technical basics that hold sites back',
      'Earn your first backlinks the honest way',
    ],
    requirements: ['A website or blog (or the desire to build one)'],
    tags: ['seo', 'content', 'google'],
    sections: [
      {
        title: 'How Search Works',
        lessons: [
          L('Crawling, indexing & ranking', '2Hylr7iyoSI', 11, true, 'What actually happens at Google.'),
          L('Keyword research with free tools', '2Hylr7iyoSI', 22, false, 'Find keywords you can actually rank for.'),
        ],
      },
      {
        title: 'Ranking Content',
        lessons: [
          L('On-page SEO checklist', '2Hylr7iyoSI', 17, false, 'Titles, headings, and internal links.'),
          L('Technical SEO basics', '2Hylr7iyoSI', 15, false, 'Speed, sitemaps, and schema.'),
          L('Project: rank a real article', '2Hylr7iyoSI', 30, false, 'Pick a keyword and go for page one.'),
        ],
      },
    ],
  },

  // ── Business ──
  {
    title: 'Personal Finance & Investing for Everyone',
    subtitle: 'Budgets, emergency funds, index funds and retirement — explained simply',
    description:
      'Take control of your money: build a budget that survives contact with reality, kill high-interest debt, understand index funds and ETFs, and plan for retirement with confidence. No jargon, no get-rich-quick nonsense.',
    category: 'Business',
    level: 'All Levels',
    price: 27.99,
    thumbnailUrl: img('personal-finance'),
    instructorEmail: 'kenji@learnhub.dev',
    whatYouWillLearn: [
      'Build a budget you will actually follow',
      'Kill debt with a proven payoff strategy',
      'Understand index funds & ETFs',
      'Plan retirement savings at any age',
    ],
    requirements: ['No finance background needed'],
    tags: ['finance', 'investing', 'budgeting', 'money'],
    sections: [
      {
        title: 'Money Foundations',
        lessons: [
          L('Where your money actually goes', 'ic1wdDl9T44', 12, true, 'Tracking and categorizing spending.'),
          L('Budgets that survive reality', 'ic1wdDl9T44', 16, false, 'Framework first, apps second.'),
          L('Emergency funds & debt payoff', 'ic1wdDl9T44', 14, false, 'Order of operations for safety.'),
        ],
      },
      {
        title: 'Investing',
        lessons: [
          L('Index funds & ETFs explained', 'ic1wdDl9T44', 19, false, 'Boring is beautiful.'),
          L('Retirement accounts 101', 'ic1wdDl9T44', 17, false, 'Tax-advantaged saving, demystified.'),
          L('Your first portfolio', 'ic1wdDl9T44', 21, false, 'Asset allocation made simple.'),
        ],
      },
    ],
  },
  {
    title: 'Excel for Business & Productivity',
    subtitle: 'Formulas, pivot tables and dashboards that impress',
    description:
      'Go from spreadsheet anxiety to spreadsheet power user. Master the formulas that matter, summarize anything with pivot tables, build interactive dashboards, and automate repetitive work.',
    category: 'Business',
    level: 'Beginner',
    price: 22.99,
    thumbnailUrl: img('excel-business'),
    instructorEmail: 'kenji@learnhub.dev',
    whatYouWillLearn: [
      'Master VLOOKUP/XLOOKUP, IF and text functions',
      'Summarize any dataset with pivot tables',
      'Build an interactive dashboard',
      'Clean messy imported data fast',
    ],
    requirements: ['Any version of Excel, Google Sheets, or LibreOffice'],
    tags: ['excel', 'spreadsheets', 'business', 'productivity'],
    sections: [
      {
        title: 'Formulas & Data',
        lessons: [
          L('The 15 formulas that matter', 'JJGE2UN8NdU', 18, true, 'Ninety percent of real work.'),
          L('Pivot tables from scratch', 'JJGE2UN8NdU', 20, false, 'Summarize 10,000 rows in seconds.'),
          L('Cleaning messy data', 'JJGE2UN8NdU', 16, false, 'Text-to-columns, remove duplicates, flash fill.'),
        ],
      },
      {
        title: 'Dashboards',
        lessons: [
          L('Charts that tell the story', 'JJGE2UN8NdU', 17, false, 'Pick the right chart every time.'),
          L('Project: sales dashboard', 'JJGE2UN8NdU', 34, false, 'Slicers, KPIs, and polish.'),
        ],
      },
    ],
  },
  {
    title: 'Startup Fundamentals: From Idea to First Customers',
    subtitle: 'Validate, build lean and find product-market fit',
    description:
      'The practical playbook for early founders: picking problems worth solving, validating before building, pricing, landing your first 10 customers, and knowing when to persevere or pivot.',
    category: 'Business',
    level: 'Intermediate',
    price: 39.99,
    thumbnailUrl: img('startup-fundamentals'),
    instructorEmail: 'kenji@learnhub.dev',
    whatYouWillLearn: [
      'Validate demand before writing code',
      'Run problem interviews that produce signal',
      'Price your product with confidence',
      'Land your first 10 paying customers',
    ],
    requirements: ['An idea (or the desire to find one)'],
    tags: ['startup', 'entrepreneurship', 'validation'],
    sections: [
      {
        title: 'Validation',
        lessons: [
          L('Problems worth solving', 'ic1wdDl9T44', 13, true, 'Where good ideas actually come from.'),
          L('Problem interviews that produce signal', 'ic1wdDl9T44', 20, false, 'Stop pitching, start listening.'),
          L('Landing page validation', 'ic1wdDl9T44', 16, false, 'Smoke tests before products.'),
        ],
      },
      {
        title: 'First Customers',
        lessons: [
          L('Pricing psychology & strategy', 'ic1wdDl9T44', 18, false, 'Charge more than you think.'),
          L('The first 10 customers playbook', 'ic1wdDl9T44', 24, false, 'Manual, unscalable, essential.'),
          L('Metrics that matter early', 'ic1wdDl9T44', 15, false, 'Retention beats everything.'),
        ],
      },
    ],
  },

  // ── Photography ──
  {
    title: 'Photography Fundamentals: Master Your Camera',
    subtitle: 'Exposure triangle, composition and light — from auto to full manual',
    description:
      'Finally understand your camera. Master aperture, shutter speed and ISO, learn composition rules worth following, work with natural light, and build a portfolio through guided photo walks and assignments.',
    category: 'Photography',
    level: 'Beginner',
    price: 26.99,
    thumbnailUrl: img('photography-fundamentals'),
    instructorEmail: 'kenji@learnhub.dev',
    whatYouWillLearn: [
      'Shoot confidently in full manual mode',
      'Compose images with intent',
      'Work with available light',
      'Cull, edit and share a cohesive portfolio',
    ],
    requirements: ['Any camera with manual controls (phone welcome)'],
    tags: ['photography', 'camera', 'composition', 'light'],
    sections: [
      {
        title: 'Exposure & Camera Controls',
        lessons: [
          L('The exposure triangle', 'yhAmMUi2NmM', 10, true, 'Aperture, shutter, ISO as one system.'),
          L('Aperture & depth of field', 'yhAmMUi2NmM', 14, false, 'Control what is sharp.'),
          L('Shutter speed & motion', 'yhAmMUi2NmM', 12, false, 'Freeze or blur — on purpose.'),
          L('ISO & image noise', 'yhAmMUi2NmM', 9, false, 'When to raise it and when not to.'),
        ],
      },
      {
        title: 'Seeing Like a Photographer',
        lessons: [
          L('Composition fundamentals', 'LxO-6rlihSg', 18, false, 'Rule of thirds, leading lines, frames.'),
          L('Working with natural light', 'LxO-6rlihSg', 16, false, 'Golden hour, blue hour, and harsh noon.'),
          L('Project: photo walk & critique', 'LxO-6rlihSg', 28, false, 'Apply it all on a real shoot.'),
        ],
      },
    ],
  },
  {
    title: 'Street Photography: Capturing the Decisive Moment',
    subtitle: 'Find stories in public places and shoot with confidence',
    description:
      'The art of the candid. Develop your eye for everyday drama, overcome the fear of shooting strangers, master fast street settings, and edit a cohesive series that tells a story of a place.',
    category: 'Photography',
    level: 'Intermediate',
    price: 21.99,
    thumbnailUrl: img('street-photography'),
    instructorEmail: 'kenji@learnhub.dev',
    whatYouWillLearn: [
      'Anticipate and capture decisive moments',
      'Shoot strangers ethically and legally',
      'Use zone focusing for speed',
      'Edit a cohesive photo essay',
    ],
    requirements: ['Comfort with camera basics', 'Any camera you can carry'],
    tags: ['street photography', 'candid', 'documentary'],
    sections: [
      {
        title: 'The Street Mindset',
        lessons: [
          L('What makes a great street photo', '4IuB6UlzQng', 12, true, 'Layers, gestures, and juxtaposition.'),
          L('Overcoming the fear of shooting strangers', '4IuB6UlzQng', 14, false, 'Ethics, laws, and confidence.'),
        ],
      },
      {
        title: 'Technique & Project',
        lessons: [
          L('Zone focusing & camera setup', '4IuB6UlzQng', 13, false, 'Never miss another moment.'),
          L('Project: a day in the city', '4IuB6UlzQng', 35, false, 'Shoot, cull and sequence a photo essay.'),
        ],
      },
    ],
  },

  // ── Music ──
  {
    title: 'Music Production in Ableton Live: Start to Finish',
    subtitle: 'Beatmaking, arrangement, mixing and releasing your first track',
    description:
      'Finish tracks, not just loops. Learn the Ableton workflow, sound design with stock plugins, arrangement frameworks, mixing fundamentals, and how to actually release music people can find.',
    category: 'Music',
    level: 'Beginner',
    price: 34.99,
    thumbnailUrl: img('ableton-production'),
    instructorEmail: 'amara@learnhub.dev',
    whatYouWillLearn: [
      'Navigate the Ableton Live workflow fast',
      'Program drums, bass and chords that groove',
      'Arrange an 8-bar loop into a full track',
      'Mix and release your first song',
    ],
    requirements: ['Ableton Live trial or license', 'Headphones'],
    tags: ['ableton', 'music production', 'edm', 'mixing'],
    sections: [
      {
        title: 'Studio Setup & Beats',
        lessons: [
          L('The Ableton session & arrangement views', 'uUwd05U-U-E', 11, true, 'Two views, one workflow.'),
          L('Programming your first drum groove', 'uUwd05U-U-E', 18, false, 'Swing, velocity, and humanization.'),
          L('Bass lines & chord progressions', 'uUwd05U-U-E', 22, false, 'Hooks that carry a track.'),
        ],
      },
      {
        title: 'Finishing the Song',
        lessons: [
          L('Arrangement: from loop to song', 'uUwd05U-U-E', 25, false, 'The 8-bar loop escape plan.'),
          L('Mixing with stock plugins', 'uUwd05U-U-E', 28, false, 'EQ, compression, and space.'),
          L('Project: release a 3-minute track', 'uUwd05U-U-E', 40, false, 'Export, master, and publish.'),
        ],
      },
    ],
  },
  {
    title: 'Guitar for Busy People',
    subtitle: 'Play your first songs in weeks with 15 minutes a day',
    description:
      'A realistic practice plan for adults. Chords, strumming patterns, and your first ten songs — designed around short daily practice sessions that actually fit into a busy life.',
    category: 'Music',
    level: 'Beginner',
    price: 0,
    thumbnailUrl: img('guitar-busy-people'),
    instructorEmail: 'amara@learnhub.dev',
    whatYouWillLearn: [
      'Play 8 open chords cleanly',
      'Strum four essential rhythms',
          'Play 10 real songs end to end',
      'Build a 15-minute daily practice habit',
    ],
    requirements: ['Any acoustic or electric guitar'],
    tags: ['guitar', 'beginner', 'chords'],
    sections: [
      {
        title: 'First Chords',
        lessons: [
          L('Holding the pick & first chords', 'e69Uf6SQnpc', 10, true, 'Em, G, C, D — the gateway chords.'),
          L('Clean chord changes', 'e69Uf6SQnpc', 15, false, 'The one-minute changes drill.'),
          L('Strumming patterns 1–4', 'e69Uf6SQnpc', 18, false, 'From downstrokes to syncopation.'),
        ],
      },
      {
        title: 'Playing Songs',
        lessons: [
          L('Reading chord charts', 'e69Uf6SQnpc', 12, false, 'Play along with any song online.'),
          L('Your first ten songs', 'e69Uf6SQnpc', 24, false, 'Classics with 3–4 chords each.'),
          L('Building the daily habit', 'e69Uf6SQnpc', 9, false, 'Practice routines that stick.'),
        ],
      },
    ],
  },

  // ── Personal Development ──
  {
    title: 'Public Speaking & Confident Communication',
    subtitle: 'Beat stage fright and speak with clarity anywhere',
    description:
      'Speak up in meetings, present ideas, and give talks people remember. Learn structured storytelling, vocal delivery, body language, and a proven rehearsal method — with progressive exposure drills that shrink fear.',
    category: 'Personal Development',
    level: 'All Levels',
    price: 24.99,
    thumbnailUrl: img('public-speaking'),
    instructorEmail: 'amara@learnhub.dev',
    whatYouWillLearn: [
      'Structure talks that hold attention',
      'Manage nerves with proven techniques',
      'Use voice and body deliberately',
      'Handle Q&A with confidence',
    ],
    requirements: ['A phone camera for self-review'],
    tags: ['public speaking', 'communication', 'confidence'],
    sections: [
      {
        title: 'Foundations',
        lessons: [
          L('Why public speaking feels scary', 'MXKkXXYUxBc', 8, true, 'Normalize the nerves, then reframe them.'),
          L('Structuring a talk: the 3-part frame', 'MXKkXXYUxBc', 14, false, 'Hook, body, landing.'),
          L('Storytelling for speakers', 'MXKkXXYUxBc', 17, false, 'Stakes, change, and specificity.'),
        ],
      },
      {
        title: 'Delivery',
        lessons: [
          L('Voice: pace, pitch & pauses', 'vJA3RQdCuX4', 13, false, 'Sound confident even when nervous.'),
          L('Body language & stage presence', 'vJA3RQdCuX4', 12, false, 'Grounded stance and purposeful movement.'),
          L('Project: give a 5-minute talk', 'vJA3RQdCuX4', 20, false, 'Rehearse, record, review, repeat.'),
        ],
      },
    ],
  },
  {
    title: 'Deep Productivity: Focus in a Distracted World',
    subtitle: 'Build systems for deep work, habits and sustainable energy',
    description:
      'Get the important work done. Design your environment for focus, plan realistically, beat procrastination with implementation intentions, and build habits that survive bad weeks.',
    category: 'Personal Development',
    level: 'All Levels',
    price: 0,
    thumbnailUrl: img('deep-productivity'),
    instructorEmail: 'amara@learnhub.dev',
    whatYouWillLearn: [
      'Set up distraction-free work blocks',
      'Plan weeks realistically with time blocking',
      'Beat procrastination with tiny starts',
      'Build habits with habit stacking',
    ],
    requirements: ['A calendar and a notebook'],
    tags: ['productivity', 'focus', 'habits'],
    sections: [
      {
        title: 'Focus Systems',
        lessons: [
          L('The attention economy & your brain', 'vJA3RQdCuX4', 9, true, 'Why focus is hard by design.'),
          L('Designing deep work blocks', 'vJA3RQdCuX4', 15, false, 'Environment, rituals, shutdown.'),
          L('Time blocking the realistic way', 'vJA3RQdCuX4', 13, false, 'Plans that survive interruptions.'),
        ],
      },
      {
        title: 'Habits & Energy',
        lessons: [
          L('Habit stacking & tiny starts', 'vJA3RQdCuX4', 12, false, 'Make the first step stupidly small.'),
          L('Managing energy, not just time', 'vJA3RQdCuX4', 11, false, 'Sleep, breaks, and ultradian rhythms.'),
          L('Project: your personal operating system', 'vJA3RQdCuX4', 18, false, 'Assemble the pieces into a weekly system.'),
        ],
      },
    ],
  },
]

// ── Seed runner ──────────────────────────────────────────────────────────────
async function seed() {
  console.log('→ Connecting to', MONGODB_URI.replace(/:\/\/[^@]*@/, '://***@'))
  await mongoose.connect(MONGODB_URI)

  if (force) {
    console.log('→ --fresh: dropping existing data')
    await Promise.all([
      User.deleteMany({}),
      Course.deleteMany({}),
      Enrollment.deleteMany({}),
      Review.deleteMany({}),
      Order.deleteMany({}),
    ])
  }

  const existing = await User.countDocuments()
  if (existing > 0 && !force) {
    console.log(`✓ Database already has ${existing} users — skipping seed (use --fresh to reseed)`)
    await mongoose.disconnect()
    return
  }

  console.log('→ Creating users')
  const createdUsers = {}
  for (const u of users) {
    const { instructorEmail, ...rest } = u
    createdUsers[u.email] = await User.create(rest)
  }

  console.log('→ Creating courses')
  const createdCourses = []
  for (const { instructorEmail, ...course } of courses) {
    const instructor = createdUsers[instructorEmail]
    if (!instructor) throw new Error(`Seed bug: unknown instructorEmail ${instructorEmail}`)
    createdCourses.push(await Course.create({ ...course, instructor: instructor._id, status: 'published' }))
  }

  // ── Students, enrollments, progress, reviews & orders ──────────────────────
  console.log('→ Creating students, enrollments, progress & reviews')
  const sam = createdUsers['student@learnhub.dev']

  const extraNames = ['Leo', 'Mia', 'Noah', 'Zoe', 'Kai', 'Ivy', 'Raj', 'Elena', 'Omar', 'Priya']
  const extraStudents = []
  for (const n of extraNames) {
    extraStudents.push(
      await User.create({
        name: n,
        email: `${n.toLowerCase()}@demo.learnhub.dev`,
        password: 'password123',
        role: 'student',
      }),
    )
  }

  const allStudents = [sam, ...extraStudents]
  const reviewComments = [
    'Fantastic explanations and real projects — worth every penny.',
    'Clear, well-paced and practical. Highly recommend!',
    'Great content, though I wish there were more exercises.',
    'The instructor makes hard topics feel easy.',
    'Solid course. Exactly what the description promised.',
    'Loved the project sections — they tie everything together.',
    'Best money I have spent on learning this year.',
    'Good fundamentals, decent pacing, helpful resources.',
  ]

  // Sam: enroll in 4 courses with progress, reviews and paid orders
  const samPicks = createdCourses.slice(0, 4)
  for (const [i, course] of samPicks.entries()) {
    const lessonIds = course.sections.flatMap((s) => s.lessons.map((l) => l._id))
    const doneCount = Math.floor(lessonIds.length * [0.6, 0.25, 0.1, 0.4][i])
    const completed = lessonIds.slice(0, doneCount)

    await Enrollment.create({
      student: sam._id,
      course: course._id,
      completedLessons: completed,
      lastLessonId: completed[completed.length - 1] || null,
    })
    await Course.findByIdAndUpdate(course._id, { $inc: { numStudents: 1 } })

    await Order.create({
      student: sam._id,
      course: course._id,
      amount: course.price,
      status: 'paid',
      provider: 'mock',
      providerRef: `mock_seed_${course._id}`,
      paidAt: new Date(Date.now() - (i + 1) * 5 * 24 * 60 * 60 * 1000),
    })

    // Sam reviews two of them
    if (i < 2) {
      await Review.create({
        course: course._id,
        user: sam._id,
        rating: [5, 4][i],
        comment: reviewComments[i],
      })
    }
  }

  // Extra students: scatter enrollments + reviews across all courses for social proof
  for (const [ci, course] of createdCourses.entries()) {
    // a couple of enrolled students per course, some with completed lessons
    const enrolled = extraStudents.filter((_, si) => (si + ci) % 3 === 0).slice(0, 2)
    for (const student of enrolled) {
      const lessonIds = course.sections.flatMap((s) => s.lessons.map((l) => l._id))
      const completed = lessonIds.slice(0, Math.floor(lessonIds.length * 0.3))
      await Enrollment.create({ student: student._id, course: course._id, completedLessons: completed })
      await Course.findByIdAndUpdate(course._id, { $inc: { numStudents: 1 } })
    }

    // 2–4 reviews per course with varied ratings
    const reviewers = extraStudents.filter((_, si) => (si + ci) % 2 === 0).slice(0, 2 + (ci % 3))
    for (const [ri, student] of reviewers.entries()) {
      await Review.create({
        course: course._id,
        user: student._id,
        rating: [5, 4, 5, 3, 4][ri % 5],
        comment: reviewComments[(ci + ri) % reviewComments.length],
      })
    }

    // Bigger student counts so the catalog looks alive
    const bump = 120 + ((ci * 83) % 400)
    await Course.findByIdAndUpdate(course._id, { $inc: { numStudents: bump } })
  }

  // Recompute avgRating / numReviews from the reviews we just created
  const { recomputeCourseRating } = await import('../utils/helpers.js')
  for (const c of createdCourses) await recomputeCourseRating(c._id)

  console.log('✓ Seed complete —', createdCourses.length, 'courses,', users.length, 'featured users +', extraStudents.length, 'students')
  console.log('  instructor@learnhub.dev / password123  (instructor: 5 courses)')
  console.log('  grace@learnhub.dev     / password123  (instructor: 5 courses)')
  console.log('  maya@learnhub.dev      / password123  (instructor: 2 courses)')
  console.log('  kenji@learnhub.dev     / password123  (instructor: 6 courses)')
  console.log('  amara@learnhub.dev     / password123  (instructor: 4 courses)')
  console.log('  student@learnhub.dev   / password123  (student: 4 enrollments + orders)')

  await mongoose.disconnect()
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
