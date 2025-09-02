# AI Chatbot System

A full-stack AI-powered chatbot application with file upload support, built with React frontend and Node.js backend. This system provides intelligent conversations powered by OpenAI GPT models, secure user authentication, and comprehensive file processing capabilities.

## 🚀 Features

### Core Functionality
- **AI-Powered Conversations**: Integration with OpenAI GPT models for intelligent responses
- **Real-time Chat Interface**: Modern React-based chat interface with conversation history
- **File Upload & Processing**: Support for PDF and CSV files with text extraction
- **User Authentication**: Secure JWT-based authentication system
- **Responsive Design**: Mobile-friendly interface built with Tailwind CSS

### Advanced Features
- **Conversation Management**: Create, manage, and organize multiple chat sessions
- **File Context**: AI can analyze and respond based on uploaded document content
- **User Dashboard**: Comprehensive user management and statistics
- **Search & Filter**: Find specific conversations and messages quickly
- **Export Capabilities**: Download chat history and user data

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 with Vite
- **Styling**: Tailwind CSS 4
- **Routing**: React Router DOM
- **Build Tool**: Vite
- **Linting**: ESLint

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT + bcryptjs
- **AI Integration**: OpenAI API
- **File Processing**: pdf-parse, csv-parser
- **Security**: Helmet, CORS, express-rate-limit
- **Validation**: express-validator
- **File Upload**: Multer
- **Logging**: Winston
- **Caching**: Node-cache

## 📁 Project Structure

```
ai-chatbot/
├── ai-chatbot-frontend/          # React frontend application
│   ├── src/
│   │   ├── components/           # React components
│   │   │   ├── common/           # Reusable UI components
│   │   │   ├── ChatInterface.jsx # Main chat component
│   │   │   ├── Dashboard.jsx     # User dashboard
│   │   │   ├── Login.jsx         # Authentication forms
│   │   │   └── Register.jsx
│   │   ├── hooks/                # Custom React hooks
│   │   ├── config/               # Configuration files
│   │   ├── utils/                # Utility functions
│   │   └── assets/               # Icons and images
│   ├── public/                   # Static assets
│   ├── package.json
│   └── tailwind.config.js
├── backend/                      # Node.js backend application
│   ├── controller/               # Business logic controllers
│   ├── model/                    # Database models
│   ├── router/                   # API route definitions
│   ├── utils/                    # Utility functions
│   ├── validation/               # Input validation rules
│   ├── database/                 # Database connection
│   ├── uploads/                  # File upload directory
│   ├── logs/                     # Application logs
│   ├── server.js                 # Main application file
│   └── package.json
└── README.md                     # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- MongoDB (local or cloud instance)
- OpenAI API key

### 1. Clone the Repository
```bash
git clone <repository-url>
cd ai-chatbot
```

### 2. Backend Setup
```bash
cd backend
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
# Set your OpenAI API key, MongoDB URI, and JWT secret
```

### 3. Frontend Setup
```bash
cd ../ai-chatbot-frontend
npm install
```

### 4. Environment Configuration
Create `.env` file in the backend directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/ai_chatbot

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key-here

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOADS_DIR=./uploads

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Security
CORS_ORIGIN=http://localhost:3000
```

### 5. Start the Application

#### Terminal 1 - Backend
```bash
cd backend
npm run dev
```

#### Terminal 2 - Frontend
```bash
cd ai-chatbot-frontend
npm run dev
```

### 6. Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 📡 API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - User registration
- `POST /login` - User login
- `GET /me` - Get current user profile
- `PUT /profile` - Update user profile
- `PUT /change-password` - Change password
- `POST /logout` - User logout

### Chat (`/api/chat`)
- `POST /` - Create new chat
- `GET /` - Get user's chats
- `GET /:chatId` - Get specific chat
- `POST /:chatId/message` - Send message
- `POST /:chatId/upload` - Upload file to chat
- `PUT /:chatId/settings` - Update chat settings
- `DELETE /:chatId` - Delete chat

### User (`/api/user`)
- `GET /stats` - Get user statistics
- `GET /files` - Get user's files
- `DELETE /files/:fileId` - Delete user file
- `PUT /preferences` - Update user preferences
- `PUT /deactivate` - Deactivate account
- `GET /export` - Export user data

### Health Check
- `GET /api/health` - Server and database health status

## 🔐 Authentication

The system uses JWT (JSON Web Tokens) for secure authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 📁 File Upload & Processing

### Supported File Types
- **PDF**: Text extraction with metadata preservation
- **CSV**: Data parsing with column information

### File Size Limit
- Maximum file size: 10MB (configurable)
- Files are processed and stored securely

### Processing Features
- Automatic text extraction from PDFs
- CSV data parsing and analysis
- AI context integration for uploaded files
- Secure file storage and retrieval

## 🗄️ Database Models

### User
- Authentication details (username, email, password)
- Profile information (firstName, lastName, avatar)
- Preferences (theme, language)
- Account status and timestamps

### Chat
- User association and title
- Message history with role-based content
- File attachments and metadata
- AI model settings and configuration

### File
- File metadata (name, type, size, path)
- Processing status and results
- Extracted text and language detection
- User and chat associations

## 🛡️ Security Features

- **Password Hashing**: bcryptjs with salt rounds
- **JWT Security**: Configurable expiration and secret keys
- **Input Validation**: Comprehensive request validation
- **Rate Limiting**: Configurable request limits
- **CORS**: Cross-origin resource sharing protection
- **Helmet**: Security headers
- **File Upload Security**: Type and size validation
- **XSS Protection**: HTML sanitization

## 🎨 Frontend Features

### User Interface
- **Modern Design**: Clean, responsive interface built with Tailwind CSS
- **Chat Interface**: Real-time messaging with message history
- **Dashboard**: User statistics and file management
- **Authentication**: Login/register forms with validation
- **File Management**: Upload, view, and manage documents

### Components
- **ChatInterface**: Main chat component with message handling
- **Dashboard**: User overview and statistics
- **FileList**: Document management interface
- **AuthHeader**: Navigation and user menu
- **Common Components**: Reusable UI elements

## 🔧 Development

### Backend Development
```bash
cd backend
npm run dev          # Start development server with nodemon
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
```

### Frontend Development
```bash
cd ai-chatbot-frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Code Structure Guidelines
- **Controllers**: Handle HTTP requests and responses
- **Models**: Define database schemas and methods
- **Routes**: Define API endpoints and middleware
- **Utils**: Reusable utility functions
- **Validation**: Request input validation rules
- **Components**: Reusable React components

## 🚀 Deployment

### Production Considerations
- Set `NODE_ENV=production`
- Use strong JWT secrets
- Configure proper CORS origins
- Set up MongoDB authentication
- Use environment-specific configurations
- Implement proper logging
- Set up monitoring and health checks

### Docker Support
```dockerfile
# Backend Dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

### Environment Variables for Production
```env
NODE_ENV=production
MONGODB_URI=mongodb://your-production-mongodb-uri
JWT_SECRET=your-production-jwt-secret
OPENAI_API_KEY=your-openai-api-key
CORS_ORIGIN=https://yourdomain.com
```

## 📊 Monitoring & Logging

### Logging
- **Winston**: Structured logging with multiple levels
- **File Rotation**: Automatic log file management
- **Error Tracking**: Comprehensive error logging

### Health Checks
- Database connection status
- File system statistics
- API endpoint health checks
- Real-time connection monitoring

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test             # Run test suite
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage
```

### Frontend Testing
```bash
cd ai-chatbot-frontend
npm test             # Run test suite
npm run test:watch   # Run tests in watch mode
```

## 📝 API Documentation

### Request/Response Examples

#### Create Chat
```bash
POST /api/chat
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "title": "New Conversation",
  "model": "gpt-3.5-turbo"
}
```

#### Send Message
```bash
POST /api/chat/:chatId/message
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "content": "Hello, how are you?",
  "role": "user"
}
```

#### Upload File
```bash
POST /api/chat/:chatId/upload
Authorization: Bearer <jwt-token>
Content-Type: multipart/form-data

file: <file-upload>
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting
