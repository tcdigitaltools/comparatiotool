# Compa Ratio Calculator - Frontend

A modern, responsive frontend application for compensation ratio calculations, built with Next.js 15, React 19, TypeScript, and Tailwind CSS.

## 🚀 Features

- **🔐 Authentication System**: JWT-based authentication with role-based access control
- **📊 Calculator**: Individual and bulk compensation calculations
- **👥 User Management**: Super admin dashboard for client management
- **📱 Responsive Design**: Mobile-first approach with modern UI/UX
- **🔧 Type Safety**: Full TypeScript integration with backend APIs
- **⚡ Performance**: Optimized with Next.js 15 and React 19

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **State Management**: React Hooks

## 📁 Project Structure

```
src/
├── app/                    # Next.js pages and layouts
├── components/             # Reusable UI components
│   ├── ui/                # Basic UI components (Button, Input, Card)
│   └── layout/            # Layout components (AuthLayout, DashboardLayout)
├── features/              # Feature-specific components
│   ├── calculator/        # Calculator functionality
│   └── admin/             # Admin features
├── lib/                   # Core utilities and API layer
│   ├── api/               # API client and services
│   └── config.ts          # Application configuration
└── shared/                # Shared utilities and hooks
    ├── hooks/             # Global React hooks
    └── components/        # Shared components
```

## 🔧 Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd compa-ratio/FrontEnd/compa_ratio
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8080
   NEXT_PUBLIC_APP_NAME=Compa Ratio Calculator
   NEXT_PUBLIC_APP_VERSION=1.0.0
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

5. **Access the application**:
   Open [http://localhost:3000](http://localhost:3000) in your browser

## 🔗 Backend Integration

The frontend is fully integrated with the Spring Boot backend:

- **API Base URL**: `http://localhost:8080`
- **Authentication**: JWT tokens with automatic refresh
- **Endpoints**: All backend APIs are integrated
- **Error Handling**: Comprehensive error handling with user feedback

## 🎯 Key Features

### Authentication
- Login/logout functionality
- Role-based access control (SUPER_ADMIN, CLIENT_ADMIN)
- Protected routes with automatic redirects
- Persistent login state

### Calculator
- Individual employee calculations
- Bulk Excel file processing
- Real-time results display
- Download functionality

### Dashboard
- Super admin dashboard with statistics
- Client account management
- User activity monitoring
- Responsive data tables

### UI/UX
- Modern, professional design
- Responsive layout for all devices
- Loading states and error handling
- Smooth animations and transitions

## 📱 Responsive Design

The application is fully responsive with:
- Mobile-first approach
- Adaptive navigation
- Responsive tables and grids
- Touch-friendly interface

## 🔒 Security

- JWT token-based authentication
- Automatic token refresh
- Protected API endpoints
- Role-based access control
- Secure token storage

## 🚀 Deployment

### Production Build
```bash
npm run build
npm start
```

### Environment Variables
For production, update the environment variables:
```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com
NEXT_PUBLIC_APP_NAME=Compa Ratio Calculator
NEXT_PUBLIC_APP_VERSION=1.0.0
```

## 📊 API Integration

The frontend integrates with the following backend services:

- **Authentication**: `/api/auth/*`
- **Calculator**: `/api/calc/*`
- **Dashboard**: `/api/admin/dashboard/*`
- **Clients**: `/api/clients/*`
- **Matrix**: `/api/matrix/*`
- **Profile**: `/api/profile/*`

## 🎨 Customization

### Styling
- Modify `tailwind.config.ts` for custom themes
- Update color schemes in component files
- Customize animations and transitions

### Components
- Extend UI components in `src/components/ui/`
- Add new features in `src/features/`
- Create shared components in `src/shared/components/`

## 🐛 Troubleshooting

### Common Issues

1. **API Connection Errors**
   - Ensure backend is running on port 8080
   - Check CORS configuration
   - Verify API_BASE_URL environment variable

2. **Authentication Issues**
   - Clear localStorage and retry login
   - Check JWT token expiration
   - Verify backend authentication endpoints

3. **File Upload Issues**
   - Check file size limits (10MB max)
   - Verify supported formats (.xlsx, .xls, .csv)
   - Ensure backend file processing is working

## 📈 Performance

- Optimized with Next.js 15
- React 19 with concurrent features
- Efficient state management
- Optimized bundle size
- Fast page loads and navigation

## 🤝 Contributing

1. Follow the existing code structure
2. Add proper TypeScript types
3. Include error handling
4. Update documentation
5. Test thoroughly with backend integration

## 📄 License

This project is part of the Compa Ratio Calculator system.

---

**Note**: This frontend maintains the same visual style and structure while being fully dynamic and connected to the backend APIs. All components are now data-driven and provide real-time functionality.