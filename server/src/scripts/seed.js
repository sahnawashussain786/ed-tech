import 'dotenv/config' // load server/.env so MONGODB_URI is respected (server.js does this too)
import mongoose from 'mongoose'
import { User, Course, Enrollment, Review, Order } from '../models/index.js'

const force = process.argv.includes('--fresh') || process.env.SEED_FORCE === 'true'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/learnhub'

const img = (seed, w = 960, h = 540) =>
  // source.unsplash.com was shut down in 2024 — picsum serves deterministic
  // placeholder photos that actually load.
  `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`

const avatar = (seed) =>
  `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`

// Demo users
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
]

// Demo courses
const courses = [
  {
    title: 'The Complete Web Development Bootcamp 2026',
    subtitle: 'HTML, CSS, JavaScript, React, Node & MongoDB — build 10 real projects',
    description:
      'Go from absolute zero to deploying full-stack MERN applications. This project-driven bootcamp covers modern HTML5 & CSS3 (including Flexbox, Grid and animations), JavaScript ES2024, React 19 with hooks and server-state patterns, Node.js & Express, MongoDB with Mongoose, authentication from scratch, REST API design, and deployment on Vercel.\n\nEvery module ends with a hands-on project: a landing page, a to-do app, a movie search engine, a chat UI, a REST API, and a capstone full-stack e-commerce store.',
    category: 'Development',
    level: 'Beginner',
    language: 'English',
    price: 49.99,
    thumbnailUrl: img('webdev-bootcamp', 960, 540),
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
          { title: 'Welcome & how this course works', videoUrl: 'https://www.youtube.com/embed/Ke90Tje7VS0', durationMin: 6, isPreview: true },
          { title: 'Setting up your development environment', videoUrl: 'https://www.youtube.com/embed/Ke90Tje7VS0', durationMin: 12, isPreview: true },
          { title: 'How the web works: clients, servers & DNS', videoUrl: 'https://www.youtube.com/embed/Ke90Tje7VS0', durationMin: 9 },
        ],
      },
      {
        title: 'HTML & CSS Fundamentals',
        lessons: [
          { title: 'Semantic HTML in practice', videoUrl: 'https://www.youtube.com/embed/Ke90Tje7VS0', durationMin: 14 },
          { title: 'Flexbox & Grid deep dive', videoUrl: 'https://www.youtube.com/embed/Ke90Tje7VS0', durationMin: 18 },
          { title: 'Project: personal portfolio page', videoUrl: 'https://www.youtube.com/embed/Ke90Tje7VS0', durationMin: 25 },
        ],
      },
      {
        title: 'JavaScript Essentials',
        lessons: [
          { title: 'Variables, types & control flow', videoUrl: 'https://www.youtube.com/embed/Ke90Tje7VS0', durationMin: 16 },
          { title: 'Functions, arrays & objects', videoUrl: 'https://www.youtube.com/embed/Ke90Tje7VS0', durationMin: 21 },
          { title: 'DOM manipulation & events', videoUrl: 'https://www.youtube.com/embed/Ke90Tje7VS0', durationMin: 17 },
          { title: 'Project: interactive quiz app', videoUrl: 'https://www.youtube.com/embed/Ke90Tje7VS0', durationMin: 32 },
        ],
      },
      {
        title: 'React & the Modern Frontend',
        lessons: [
          { title: 'Components, props & state', videoUrl: 'https://www.youtube.com/embed/Ke90Tje7VS0', durationMin: 19 },
          { title: 'Hooks, effects & data fetching', videoUrl: 'https://www.youtube.com/embed/Ke90Tje7VS0', durationMin: 24 },
          { title: 'Project: movie discovery app', videoUrl: 'https://www.youtube.com/embed/Ke90Tje7VS0', durationMin: 41 },
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
    language: 'English',
    price: 39.99,
    thumbnailUrl: img('node-express-api', 960, 540),
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
          { title: 'The Node runtime & module system', videoUrl: 'https://www.youtube.com/embed/Ke90Tje7VS0', durationMin: 11, isPreview: true },
          { title: 'Building your first Express server', videoUrl: 'https://www.youtube.com/embed/Ke90Tje7VS0', durationMin: 15 },
          { title: 'Routing & middleware patterns', videoUrl: 'https://www.youtube.com/embed/Ke90Tje7VS0', durationMin: 18 },
        ],
      },
      {
        title: 'MongoDB & Mongoose',
        lessons: [
          { title: 'Documents, collections & schemas', videoUrl: 'https://www.youtube.com/embed/Ke90Tje7VS0', durationMin: 13 },
          { title: 'Relationships, population & indexes', videoUrl: 'https://www.youtube.com/embed/Ke90Tje7VS0', durationMin: 20 },
          { title: 'Project: book library API', videoUrl: 'https://www.youtube.com/embed/Ke90Tje7VS0', durationMin: 38 },
        ],
      },
      {
        title: 'Auth, Security & Deployment',
        lessons: [
          { title: 'Password hashing & JWT sessions', videoUrl: 'https://www.youtube.com/embed/Ke90Tje7VS0', durationMin: 22 },
          { title: 'Helmet, CORS & rate limiting', videoUrl: 'https://www.youtube.com/embed/Ke90Tje7VS0', durationMin: 12 },
          { title: 'Shipping to Vercel serverless', videoUrl: 'https://www.youtube.com/embed/Ke90Tje7VS0', durationMin: 16 },
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
    language: 'English',
    price: 59.99,
    thumbnailUrl: img('react-masterclass', 960, 540),
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
          { title: 'Composition over configuration', videoUrl: 'https://www.youtube.com/embed/Ke90Tje7VS0', durationMin: 10, isPreview: true },
          { title: 'Controlled vs uncontrolled components', videoUrl: 'https://www.youtube.com/embed/Ke90Tje7VS0', durationMin: 14 },
        ],
      },
      {
        title: 'State Architecture',
        lessons: [
          { title: 'useReducer for complex flows', videoUrl: 'https://www.youtube.com/embed/Ke90Tje7VS0', durationMin: 19 },
          { title: 'Context without the re-render trap', videoUrl: 'https://www.youtube.com/embed/Ke90Tje7VS0', durationMin: 17 },
          { title: 'Project: draggable kanban board', videoUrl: 'https://www.youtube.com/embed/Ke90Tje7VS0', durationMin: 45 },
        ],
      },
    ],
  },
  {
    title: 'Data Science & Machine Learning with Python',
    subtitle: 'NumPy, pandas, scikit-learn and your first ML models',
    description:
      'Crunch real datasets with the Python data stack. Learn NumPy arrays, pandas DataFrames, cleaning messy CSVs, exploratory analysis, visualization, and then train classic ML models — regression, classification, clustering — with scikit-learn. Ends with an end-to-end Kaggle-style project.',
    category: 'Data Science',
    level: 'Intermediate',
    language: 'English',
    price: 44.99,
    thumbnailUrl: img('data-science-ml', 960, 540),
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
          { title: 'NumPy arrays vs Python lists', videoUrl: 'https://www.youtube.com/embed/Ke90Tje7VS0', durationMin: 12, isPreview: true },
          { title: 'pandas DataFrames from scratch', videoUrl: 'https://www.youtube.com/embed/Ke90Tje7VS0', durationMin: 22 },
        ],
      },
      {
        title: 'Machine Learning Foundations',
        lessons: [
          { title: 'Your first linear regression', videoUrl: 'https://www.youtube.com/embed/Ke90Tje7VS0', durationMin: 18 },
          { title: 'Classification & model evaluation', videoUrl: 'https://www.youtube.com/embed/Ke90Tje7VS0', durationMin: 26 },
          { title: 'Project: Titanic survival prediction', videoUrl: 'https://www.youtube.com/embed/Ke90Tje7VS0', durationMin: 52 },
        ],
      },
    ],
  },
  {
    title: 'UI/UX Design Essentials with Figma',
    subtitle: 'Design beautiful, usable interfaces from first principles',
    description:
      'Learn the craft behind great interfaces: layout & spacing systems, typography scales, color theory, components and variants in Figma, prototyping flows, and handoff to developers. Includes 4 portfolio-ready design projects.',
    category: 'Design',
    level: 'Beginner',
    language: 'English',
    price: 34.99,
    thumbnailUrl: img('figma-uiux', 960, 540),
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
          { title: 'Layout, spacing & the 8pt grid', videoUrl: 'https://www.youtube.com/embed/Ke90Tje7VS0', durationMin: 13, isPreview: true },
          { title: 'Typography that communicates', videoUrl: 'https://www.youtube.com/embed/Ke90Tje7VS0', durationMin: 15 },
        ],
      },
      {
        title: 'Figma in Practice',
        lessons: [
          { title: 'Components, variants & auto layout', videoUrl: 'https://www.youtube.com/embed/Ke90Tje7VS0', durationMin: 24 },
          { title: 'Project: design a mobile banking app', videoUrl: 'https://www.youtube.com/embed/Ke90Tje7VS0', durationMin: 48 },
        ],
      },
    ],
  },
  {
    title: 'Digital Marketing Masterclass 2026',
    subtitle: 'SEO, content, social & paid ads that actually convert',
    description:
      'A practical tour of modern marketing: keyword research and on-page SEO, content strategy that compounds, social media systems, email funnels, and paid acquisition on Meta & Google. Includes swipe files and campaign templates.',
    category: 'Marketing',
    level: 'All Levels',
    language: 'English',
    price: 29.99,
    thumbnailUrl: img('marketing-2026', 960, 540),
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
          { title: 'The modern marketing funnel', videoUrl: 'https://www.youtube.com/embed/Ke90Tje7VS0', durationMin: 9, isPreview: true },
          { title: 'Positioning & audience research', videoUrl: 'https://www.youtube.com/embed/Ke90Tje7VS0', durationMin: 14 },
        ],
      },
      {
        title: 'Channels & Campaigns',
        lessons: [
          { title: 'SEO that survives algorithm updates', videoUrl: 'https://www.youtube.com/embed/Ke90Tje7VS0', durationMin: 21 },
          { title: 'Paid ads on Meta & Google', videoUrl: 'https://www.youtube.com/embed/Ke90Tje7VS0', durationMin: 27 },
        ],
      },
    ],
  },
]

async function seed() {
  console.log('→ Connecting to', MONGODB_URI)
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
    const created = await User.create(u)
    createdUsers[u.email] = created
  }
  const ada = createdUsers['instructor@learnhub.dev']
  const grace = createdUsers['grace@learnhub.dev']
  const sam = createdUsers['student@learnhub.dev']

  console.log('→ Creating courses')
  const createdCourses = []
  for (const [i, course] of courses.entries()) {
    const instructor = i % 2 === 0 ? ada : grace
    createdCourses.push(await Course.create({ ...course, instructor: instructor._id, status: 'published' }))
  }

  // Enroll Sam in two courses with progress + reviews
  console.log('→ Creating demo enrollment, progress & reviews')
  const web = createdCourses[0]
  const ds = createdCourses[3]

  const firstSection = web.sections[0]
  const completed = firstSection.lessons.slice(0, 2).map((l) => l._id)

  await Enrollment.create({
    student: sam._id,
    course: web._id,
    completedLessons: completed,
    lastLessonId: completed[completed.length - 1],
  })
  await Course.findByIdAndUpdate(web._id, { $inc: { numStudents: 1 } })

  await Enrollment.create({ student: sam._id, course: ds._id })
  await Course.findByIdAndUpdate(ds._id, { $inc: { numStudents: 1 } })

  await Review.create({ course: web._id, user: sam._id, rating: 5, comment: 'Fantastic explanations and projects!' })
  await Review.create({ course: ds._id, user: sam._id, rating: 4, comment: 'Very solid intro to pandas and sklearn.' })
  await Order.create({
    student: sam._id,
    course: web._id,
    amount: web.price,
    status: 'paid',
    provider: 'mock',
    providerRef: 'mock_seed_demo_1',
    paidAt: new Date(),
  })
  await Order.create({
    student: sam._id,
    course: ds._id,
    amount: ds.price,
    status: 'paid',
    provider: 'mock',
    providerRef: 'mock_seed_demo_2',
    paidAt: new Date(),
  })

  // Recompute ratings
  const { recomputeCourseRating } = await import('../utils/helpers.js')
  for (const c of createdCourses) await recomputeCourseRating(c._id)

  // Extra students for social proof
  const names = ['Leo', 'Mia', 'Noah', 'Zoe', 'Kai', 'Ivy']
  const extra = []
  for (const n of names) {
    extra.push(
      await User.create({
        name: n,
        email: `${n.toLowerCase()}@demo.learnhub.dev`,
        password: 'password123',
        role: 'student',
      }),
    )
  }
  for (const [i, c] of createdCourses.entries()) {
    const bump = 80 + i * 37
    await Course.findByIdAndUpdate(c._id, { $inc: { numStudents: bump } })
  }

  console.log('✓ Seed complete')
  console.log('  instructor@learnhub.dev / password123  (instructor)')
  console.log('  grace@learnhub.dev     / password123  (instructor)')
  console.log('  student@learnhub.dev   / password123  (student, enrolled in 2 courses)')

  await mongoose.disconnect()
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
