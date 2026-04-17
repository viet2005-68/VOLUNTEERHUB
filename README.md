# 🌟 VOLUNTEERHUB

> A platform to connect volunteers with meaningful opportunities and organizations.

---

## 🚀 Tech Stack

### 🧠 Backend

![Java](https://img.shields.io/badge/Java-ED8B00?style=for-the-badge\&logo=java\&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-6DB33F?style=for-the-badge\&logo=spring-boot\&logoColor=white)
![Spring Security](https://img.shields.io/badge/Spring_Security-6DB33F?style=for-the-badge\&logo=spring-security\&logoColor=white)

---

### 🗄 Database

![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge\&logo=postgresql\&logoColor=white)

---

### ⚡ Cache

![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge\&logo=redis\&logoColor=white)

---

### 🗂 Object Storage (S3-compatible)

![MinIO](https://img.shields.io/badge/MinIO-C72E49?style=for-the-badge\&logo=minio\&logoColor=white)

---

### 📦 Messaging / Queue

![RabbitMQ](https://img.shields.io/badge/RabbitMQ-FF6600?style=for-the-badge\&logo=rabbitmq\&logoColor=white)

---

### ☁️ DevOps / Infrastructure

![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge\&logo=docker\&logoColor=white)
![Kubernetes](https://img.shields.io/badge/Kubernetes-326CE5?style=for-the-badge\&logo=kubernetes\&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge\&logo=github-actions\&logoColor=white)

---

## ✨ Features

### 🙋 Volunteer

* 🔍 Browse & filter volunteer opportunities
* ✅ Register / ❌ Cancel participation
* 📜 View participation history
* 🔔 Receive real-time notifications
* 💬 Join event discussion channels (post, comment, like)
* 📊 Personal dashboard (recommended & trending events)

---

### 🧑‍💼 Event Manager

* 🛠 Create / update / delete events
* ✅ Approve / reject volunteer registrations
* 🏁 Mark attendance completion
* 📊 View participant reports
* 💬 Manage event discussion channels

---

### 🛡 Admin

* ✅ Approve / remove events
* 👤 Manage users (lock / unlock accounts)
* 📤 Export data (CSV / JSON)
* 📊 System-wide dashboard

---

## 💬 Event Communication Channel

> Each approved event automatically creates a **private discussion channel**

* 📝 Post updates
* 💬 Comment & interact
* ❤️ Like content

👉 Only approved participants can access

---

## 📁 Project Structure

```bash
VOLUNTEERHUB/
├── backend/        # Spring Boot API
├── frontend/       # (React / Vue)
├── docker/         # Docker configs
├── docs/           # Architecture & API docs
└── README.md
```

---

## ⚙️ Setup & Run

### 1. Clone project

```bash
git clone https://github.com/your-repo/volunteerhub.git
cd volunteerhub
```

### 2. Run with Docker

```bash
docker-compose up -d
```

### 3. Run Backend manually

```bash
cd backend
./mvnw spring-boot:run
```

---

## 📊 System Design Highlights

* 🧠 Role-based access control (RBAC)
* ⚡ Redis caching for performance optimization
* 📦 RabbitMQ for async processing & notifications
* 🗂 MinIO for scalable file storage
* ☁️ Containerized deployment with Docker & Kubernetes

---

## 📌 Future Improvements

* 🤖 AI-based event recommendation
* 📱 Mobile application
* 📊 Advanced analytics dashboard
* 🌐 Multi-language support

---

## 👥 Team Members

| Name                   | Role               |
| ---------------------- | ------------------ |
| 🧑‍💻 X                | Backend Developer  |
| 🧑‍💻 Y                | Frontend Developer |
| 🧑‍💻 Vinh Thanh Hoang | DevOps / QA        |

---

## 📄 License

MIT License © 2026 VOLUNTEERHUB
