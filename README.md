# 🌟 VolunteerHub

<div align="center">

![VolunteerHub Banner](https://via.placeholder.com/800x200/6366f1/ffffff?text=VolunteerHub)

**Connecting Hearts - Spreading Kindness**

[![Made with Love](https://img.shields.io/badge/Made%20with-Love-ff69b4.svg)](https://github.com/yourusername/volunteerhub)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/yourusername/volunteerhub/pulls)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[Live Demo](https://volunteerhub-demo.com) • [Documentation](https://docs.volunteerhub.com) • [Report Bug](https://github.com/yourusername/volunteerhub/issues) • [Request Feature](https://github.com/yourusername/volunteerhub/pulls)

</div>

---

## 💡 About The Project

**VolunteerHub** is a modern platform that connects volunteers with non-profit organizations, making it easy for people to discover and participate in meaningful community service activities. We believe everyone has the power to make a difference in their community.

### ✨ Key Features

- 🔍 **Smart Search** - Filter opportunities by location, skills, and time commitment
- 📅 **Calendar Management** - Register and track your volunteer activities
- 🏆 **Points & Badges System** - Recognize volunteer contributions and achievements
- 💬 **Real-time Chat** - Connect directly with organizations and fellow volunteers
- 📊 **Analytics Dashboard** - Track your volunteer impact and statistics
- 🔔 **Smart Notifications** - Get updates on opportunities that match your interests
- 🌍 **Multi-language** - Support for English and Vietnamese
- 📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile

---

## 🚀 Demo

<div align="center">

![Dashboard Screenshot](https://via.placeholder.com/400x300/f3f4f6/6366f1?text=Dashboard)
![Event List Screenshot](https://via.placeholder.com/400x300/f3f4f6/6366f1?text=Event+List)

</div>

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 18 + TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **State Management:** Redux Toolkit
- **Form Handling:** React Hook Form + Zod
- **Data Visualization:** Recharts
- **Icons:** Lucide React

### Backend
- **Runtime:** Node.js + Express
- **Database:** PostgreSQL + Prisma ORM
- **Authentication:** JWT + bcrypt
- **Real-time:** Socket.io
- **File Storage:** AWS S3
- **Email:** Nodemailer

### DevOps & Tools
- **CI/CD:** GitHub Actions
- **Hosting:** Vercel (Frontend) + Railway (Backend)
- **Monitoring:** Sentry
- **Testing:** Jest + React Testing Library + Supertest
- **Code Quality:** ESLint + Prettier

---

## 📦 Installation

### Prerequisites

- Node.js 18 or higher
- PostgreSQL 14 or higher
- npm or yarn package manager

### Step 1: Clone the repository

```bash
git clone https://github.com/yourusername/volunteerhub.git
cd volunteerhub
```

### Step 2: Install dependencies

```bash
# Install frontend dependencies
cd client
npm install

# Install backend dependencies
cd ../server
npm install
```

### Step 3: Environment configuration

Create a `.env` file in the `server` directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/volunteerhub"

# JWT
JWT_SECRET="your-super-secret-key"
JWT_EXPIRES_IN="7d"

# AWS S3
AWS_ACCESS_KEY_ID="your-aws-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret"
AWS_REGION="us-east-1"
AWS_BUCKET_NAME="volunteerhub-uploads"

# Server
PORT=5000
NODE_ENV="development"

# Email
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
```

Create a `.env` file in the `client` directory:

```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=ws://localhost:5000
```

### Step 4: Database setup

```bash
cd server
npx prisma migrate dev
npx prisma db seed
```

### Step 5: Start the application

```bash
# Terminal 1 - Start backend server
cd server
npm run dev

# Terminal 2 - Start frontend dev server
cd client
npm run dev
```

Open `http://localhost:5173` in your browser! 🎉

---

## 📚 Project Structure

```
volunteerhub/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── store/         # Redux store configuration
│   │   ├── utils/         # Utility functions
│   │   ├── types/         # TypeScript type definitions
│   │   ├── services/      # API service layer
│   │   └── assets/        # Static assets
│   ├── public/            # Public static files
│   └── package.json
│
├── server/                # Backend Express application
│   ├── src/
│   │   ├── controllers/   # Route controllers
│   │   ├── models/        # Database models
│   │   ├── routes/        # API route definitions
│   │   ├── middleware/    # Custom middleware
│   │   ├── services/      # Business logic layer
│   │   ├── utils/         # Helper functions
│   │   └── config/        # Configuration files
│   ├── prisma/            # Database schema & migrations
│   │   ├── schema.prisma
│   │   └── migrations/
│   └── package.json
│
├── docs/                  # Project documentation
└── README.md
```

---

## 🚦 Available Scripts

### Frontend (client/)

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run test         # Run tests
npm run lint         # Lint code
```

### Backend (server/)

```bash
npm run dev          # Start development server with hot reload
npm run build        # Compile TypeScript
npm start            # Start production server
npm run test         # Run tests
npm run prisma:studio # Open Prisma Studio
```

---

## 🤝 Contributing

We love contributions! Whether it's bug fixes, feature additions, or documentation improvements, your help is welcome.

### How to Contribute

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and development process.

---

## 🧪 Running Tests

```bash
# Run frontend tests
cd client
npm run test

# Run backend tests
cd server
npm run test

# Run tests with coverage
npm run test:coverage
```

---

## 🐛 Bug Reports

Found a bug? Please [open an issue](https://github.com/yourusername/volunteerhub/issues) with a detailed description of the problem and steps to reproduce it.

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/thanhvinh0702">
        <img src="https://via.placeholder.com/100" width="100px;" alt=""/>
        <br />
        <sub><b>Hoang Thanh Vinh</b></sub>
      </a>
      <br />
      <sub>Full Stack Developer</sub>
    </td>
    <td align="center">
      <a href="https://github.com/teammate">
        <img src="https://via.placeholder.com/100" width="100px;" alt=""/>
        <br />
        <sub><b>Teammate Name</b></sub>
      </a>
      <br />
      <sub>Frontend Developer</sub>
    </td>
    <td align="center">
      <a href="https://github.com/teammate2">
        <img src="https://via.placeholder.com/100" width="100px;" alt=""/>
        <br />
        <sub><b>Another Teammate</b></sub>
      </a>
      <br />
      <sub>Backend Developer</sub>
    </td>
  </tr>
</table>

---

## 🙏 Acknowledgments

- [React](https://reactjs.org/) - Frontend framework
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Prisma](https://www.prisma.io/) - Database ORM
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- All our amazing contributors!

---

## 📧 Contact

Project Link: [https://github.com/yourusername/volunteerhub](https://github.com/yourusername/volunteerhub)

---

## 🌟 Show Your Support

If you find this project useful, please give it a ⭐️ on GitHub!

<div align="center">

**Let's make a difference together! 💚**

[⬆ Back to Top](#-volunteerhub)

</div>


