# llcompa_ratioll Infrastructure Documentation

Complete Docker and deployment infrastructure for the Compa-Ratio application.

---

## 📋 Table of Contents

- [Discovery Notes](#discovery-notes)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Local Development](#local-development)
- [Testing](#testing)
- [Docker Hub Deployment](#docker-hub-deployment)
- [Production Deployment](#production-deployment)
- [Troubleshooting](#troubleshooting)
- [Architecture](#architecture)

---

## 🔍 Discovery Notes

### Backend (compa-ratio/BackEnd)

| Property | Value |
|----------|-------|
| **Build Tool** | Maven 3.9 |
| **Java Version** | 21 (Eclipse Temurin) |
| **Spring Boot** | 3.5.6 |
| **Artifact** | `comparatio-0.0.1-SNAPSHOT.jar` |
| **Packaging Command** | `mvn -q clean package -DskipTests` |
| **Server Port** | 8080 (configurable via `APP_PORT`) |
| **Spring Actuator** | ✅ Enabled |
| **Health Endpoint** | `/actuator/health` |
| **Other Endpoints** | `/actuator/info`, `/actuator/metrics`, `/actuator/prometheus` |
| **Database** | MongoDB |
| **File Storage** | Local filesystem (`/app/uploads`) |

**Key Dependencies:**
- Spring Boot Starter Web
- Spring Boot Starter Data MongoDB
- Spring Boot Starter Actuator
- Spring Security + JWT
- Apache POI (Excel processing)
- Micrometer + Prometheus

### Frontend (FrontEnd)

| Property | Value |
|----------|-------|
| **Framework** | Next.js 15.5.4 |
| **Node Version** | 20 (Alpine) |
| **Package Manager** | npm (package-lock.json) |
| **Build Command** | `npm run build` (uses Turbopack) |
| **Start Command** | `npm start` or `node server.js` (standalone) |
| **Port** | 3000 |
| **Output Mode** | Standalone (optimized for Docker) |

**Key Dependencies:**
- React 19.1.0
- Next.js 15.5.4
- Axios (API client)
- Tailwind CSS
- Lucide React (icons)

---

## 🔧 Prerequisites

- **Docker** 20.10+ with Compose V2
- **Docker Buildx** (for multi-architecture builds)
- **Git** (for SHA tagging)
- **Make** (optional, for convenience)
- **Docker Hub Account** (for pushing images)

### Installation

**macOS:**
```bash
brew install docker docker-compose
```

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install docker.io docker-compose-plugin
```

---

## 🚀 Quick Start

### 1. Configure Environment

```bash
# Copy the example environment file
cp infra/.env.example infra/.env

# Edit with your configuration
nano infra/.env
```

**Required variables:**
```bash
DOCKERHUB_USERNAME=your_dockerhub_username
MONGO_URI=mongodb://mongodb:27017  # or external MongoDB
```

### 2. Start Development Environment

Using Make:
```bash
make up
```

Or directly:
```bash
bash infra/scripts/dev_up.sh
```

### 3. Verify Services

```bash
make smoke
```

**Services will be available at:**
- Frontend: http://localhost:3000
- Backend: http://localhost:8080
- Actuator Health: http://localhost:8080/actuator/health

---

## 💻 Local Development

### Start with MongoDB

```bash
# Enable MongoDB in .env
MONGO_ENABLE=true

# Start services
make up
```

### Start without MongoDB (External DB)

```bash
# Configure external MongoDB in .env
MONGO_URI=mongodb://your-external-mongo:27017

# Start services
make up
```

### View Logs

```bash
# All services
make logs

# Specific service
docker compose -f infra/docker-compose.dev.yml logs -f backend
docker compose -f infra/docker-compose.dev.yml logs -f frontend
```

### Rebuild and Restart

```bash
make down
make build-dev
make up
```

### Stop Everything

```bash
make down
```

---

## 🧪 Testing

### Run All Tests

```bash
make test
```

### Backend Tests Only

```bash
make test-backend
# Or directly:
cd compa-ratio/BackEnd && mvn test
```

### Frontend Tests Only

```bash
make test-frontend
# Or directly:
cd FrontEnd && npm test
```

### Smoke Tests (Service Health)

```bash
make smoke
```

---

## 🐳 Docker Hub Deployment

### Prerequisites

1. **Docker Hub Account**: Create at https://hub.docker.com
2. **Login to Docker Hub**:
   ```bash
   docker login
   ```
3. **Configure .env**:
   ```bash
   DOCKERHUB_USERNAME=your_actual_username
   ```

### One-Time Setup

```bash
make buildx-init
```

This creates a multi-architecture builder supporting:
- `linux/amd64` (Intel/AMD processors)
- `linux/arm64` (Apple Silicon, ARM servers)

### Build and Push Images

```bash
make push
```

This will:
1. Build backend for amd64 and arm64
2. Build frontend for amd64 and arm64
3. Tag with `latest` and `sha-<git-hash>`
4. Push to Docker Hub

**Example output:**
```
your_username/compa-ratio-backend:latest
your_username/compa-ratio-backend:sha-a1b2c3d
your_username/compa-ratio-frontend:latest
your_username/compa-ratio-frontend:sha-a1b2c3d
```

### Manual Build Commands

**Backend only:**
```bash
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -f compa-ratio/BackEnd/Dockerfile.llcompa_ratioll \
  -t your_username/compa-ratio-backend:latest \
  --push \
  compa-ratio/BackEnd
```

**Frontend only:**
```bash
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -f FrontEnd/Dockerfile.llcompa_ratioll \
  -t your_username/compa-ratio-frontend:latest \
  --push \
  FrontEnd
```

---

## 🌍 Production Deployment

### On Your Server

#### 1. Install Docker

```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Compose plugin
sudo apt-get install docker-compose-plugin
```

#### 2. Clone Repository

```bash
git clone git@github.com:tcdigitaltools/comparatiotool.git
cd comparatiotool
```

#### 3. Configure Environment

```bash
cp infra/.env.example infra/.env
nano infra/.env
```

**Production settings:**
```bash
DOCKERHUB_USERNAME=your_dockerhub_username
BACKEND_PORT=8080
FRONTEND_PORT=3000

# Use stronger JAVA_OPTS for production
JAVA_OPTS=-Xmx1g -Xms512m

# External MongoDB recommended
MONGO_URI=mongodb://production-mongo:27017
MONGO_DB=compa_prod

# IMPORTANT: Change JWT secret!
JWT_SECRET=your_secure_random_secret_here
```

#### 4. Pull Latest Images

```bash
make prod-pull
```

#### 5. Start Production Services

```bash
make prod-up
```

#### 6. Verify Deployment

```bash
# Check status
docker compose -f infra/docker-compose.prod.yml ps

# View logs
make prod-logs

# Run smoke test
make smoke
```

### Update Production

```bash
# Pull latest images
make prod-pull

# Restart services (with zero downtime using rolling restart)
docker compose -f infra/docker-compose.prod.yml up -d --no-deps --build backend
docker compose -f infra/docker-compose.prod.yml up -d --no-deps --build frontend
```

### Stop Production

```bash
make prod-down
```

---

## 🔍 Troubleshooting

### Port Conflicts

**Error:** "port is already allocated"

**Solution:**
```bash
# Check what's using the port
lsof -i :8080
lsof -i :3000

# Change ports in .env
BACKEND_PORT=8081
FRONTEND_PORT=3001
```

### Actuator Health Path Issues

If health checks fail, verify the endpoint:

```bash
# Test different endpoints
curl http://localhost:8080/actuator/health
curl http://localhost:8080/health
curl http://localhost:8080/
```

Update Dockerfile health check if needed.

### Next.js Standalone Mode

If frontend fails to start, check the build output:

```bash
docker compose -f infra/docker-compose.dev.yml logs frontend
```

The Dockerfile supports both standalone and standard Next.js modes.

### MongoDB Connection Issues

**Error:** "MongoTimeoutException"

**Solutions:**
1. Enable MongoDB in compose:
   ```bash
   MONGO_ENABLE=true make up
   ```

2. Check MongoDB status:
   ```bash
   docker compose -f infra/docker-compose.dev.yml ps mongodb
   ```

3. Verify connection string in .env:
   ```bash
   MONGO_URI=mongodb://mongodb:27017
   ```

### Build Failures

**Clear Docker cache:**
```bash
docker builder prune -a
make clean
make build-dev
```

### Permission Issues

**Linux users may need:**
```bash
sudo chmod +x infra/scripts/*.sh
sudo chown -R $USER:$USER .
```

---

## 🏗️ Architecture

### Multi-Stage Docker Builds

**Backend:**
```
Stage 1: Builder (maven:3.9-eclipse-temurin-21)
  └─ Download dependencies (cached)
  └─ Build JAR with Maven

Stage 2: Runtime (eclipse-temurin:21-jre-alpine)
  └─ Copy JAR only
  └─ Run as non-root user
  └─ Health check via Actuator
```

**Frontend:**
```
Stage 1: Dependencies (node:20-alpine)
  └─ Install npm packages (cached)

Stage 2: Builder (node:20-alpine)
  └─ Copy dependencies from stage 1
  └─ Build Next.js with standalone output

Stage 3: Runtime (node:20-alpine)
  └─ Copy standalone output only
  └─ Run as non-root user
  └─ Health check via HTTP
```

### Network Architecture

```
┌─────────────────────────────────────────────┐
│  llcompa_ratioll-network (Docker Bridge)    │
│                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │ MongoDB  │  │ Backend  │  │ Frontend │ │
│  │  :27017  │  │  :8080   │  │  :3000   │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘ │
│       │             │              │        │
└───────┼─────────────┼──────────────┼────────┘
        │             │              │
        │      ┌──────▼──────┐       │
        └──────│   Backend   │       │
               │  connects   │       │
               └──────┬──────┘       │
                      │              │
               ┌──────▼──────────────▼───┐
               │   Frontend connects to  │
               │   Backend via internal  │
               │   Docker network        │
               └─────────────────────────┘
```

### Health Checks

- **Backend**: `/actuator/health` (Spring Boot Actuator)
- **Frontend**: `GET /` (Next.js homepage)
- **MongoDB**: `mongosh --eval "db.adminCommand('ping')"`

### Volumes

- `backend_uploads`: Persistent file storage for uploads
- `mongodb_data`: MongoDB data persistence (optional)

---

## 📚 Additional Resources

### Files Structure

```
.
├── compa-ratio/BackEnd/
│   ├── Dockerfile.llcompa_ratioll    # Backend multi-stage build
│   └── .dockerignore                 # Backend ignore rules
├── FrontEnd/
│   ├── Dockerfile.llcompa_ratioll    # Frontend multi-stage build
│   ├── .dockerignore                 # Frontend ignore rules
│   └── next.config.ts                # Standalone output enabled
├── infra/
│   ├── .env.example                  # Environment template
│   ├── docker-compose.dev.yml        # Development services
│   ├── docker-compose.prod.yml       # Production services
│   ├── scripts/
│   │   ├── dev_up.sh                 # Start dev environment
│   │   ├── dev_down.sh               # Stop dev environment
│   │   ├── smoke_test.sh             # Health checks
│   │   ├── buildx_init.sh            # Initialize buildx
│   │   ├── build_push_all.sh         # Build and push images
│   │   ├── prod_pull.sh              # Pull production images
│   │   └── prod_up.sh                # Start production
│   └── README.md                     # This file
├── Makefile                          # Convenience commands
└── .dockerignore                     # Root ignore rules
```

### Makefile Commands Reference

```bash
make help          # Show all commands
make up            # Start dev environment
make down          # Stop dev environment
make test          # Run all tests
make smoke         # Health checks
make buildx-init   # Setup multi-arch builder
make push          # Build and push to Docker Hub
make prod-pull     # Pull latest production images
make prod-up       # Start production
make clean         # Remove all Docker resources
```

### Environment Variables Reference

| Variable | Default | Description |
|----------|---------|-------------|
| `DOCKERHUB_USERNAME` | - | Your Docker Hub username (required for push) |
| `BACKEND_IMAGE` | `${DOCKERHUB_USERNAME}/compa-ratio-backend` | Backend image name |
| `FRONTEND_IMAGE` | `${DOCKERHUB_USERNAME}/compa-ratio-frontend` | Frontend image name |
| `BACKEND_PORT` | `8080` | Host port for backend |
| `FRONTEND_PORT` | `3000` | Host port for frontend |
| `APP_PORT` | `8080` | Internal backend port |
| `JAVA_OPTS` | `-Xmx512m -Xms256m` | JVM options |
| `MONGO_URI` | `mongodb://mongodb:27017` | MongoDB connection string |
| `MONGO_DB` | `compa_demo` | MongoDB database name |
| `JWT_SECRET` | - | JWT signing secret (change in production!) |
| `FILE_STORAGE_PATH` | `/app/uploads` | Backend file storage path |
| `NODE_ENV` | `production` | Node environment |
| `NEXT_PUBLIC_API_URL` | `http://localhost:8080` | API URL for frontend |
| `MONGO_ENABLE` | `false` | Enable MongoDB in compose |

---

## 📝 Notes

- **Security**: Change `JWT_SECRET` in production
- **Database**: Use external managed MongoDB for production
- **Monitoring**: Prometheus metrics available at `/actuator/prometheus`
- **Logs**: Use centralized logging in production (e.g., ELK stack)
- **SSL/TLS**: Add reverse proxy (nginx/traefik) for HTTPS
- **Backups**: Regularly backup MongoDB and upload volumes

---

## 🆘 Support

For issues or questions:
1. Check [Troubleshooting](#troubleshooting) section
2. Review Docker logs: `make logs`
3. Verify environment configuration
4. Check service health: `make smoke`

---

**Created:** $(date)  
**Version:** 1.0.0  
**Docker Hub:** https://hub.docker.com/u/${DOCKERHUB_USERNAME}

