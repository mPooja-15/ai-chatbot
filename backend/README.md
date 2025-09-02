# Chat System Backend

A robust, scalable backend for an AI-powered chat system with file upload support, built with Node.js, Express, and MongoDB.

## 🚀 Features

- **User Authentication**: Secure JWT-based authentication with bcrypt password hashing
- **AI Chat Integration**: OpenAI GPT models for intelligent conversations
- **File Upload Support**: PDF and CSV file processing with text extraction
- **Real-time Chat**: Maintains conversation context and history
- **Security**: Helmet, CORS, rate limiting, and input validation
- **Error Handling**: Comprehensive error handling and logging
- **Database**: MongoDB with Mongoose ODM
- **File Processing**: PDF parsing and CSV data extraction

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT + bcryptjs
- **AI Integration**: OpenAI API
- **File Processing**: pdf-parse, csv-parser
- **Security**: Helmet, CORS, express-rate-limit
- **Validation**: express-validator
- **File Upload**: Multer

## 📁 Project Structure

```
backend/
├── controller/          # Business logic controllers
│   ├── authController.js
│   ├── chatController.js
│   └── userController.js
├── model/              # Database models
│   ├── User.js
│   ├── Chat.js
│   └── File.js
├── router/             # API route definitions
│   ├── auth.js
│   ├── chat.js
│   └── user.js
├── utils/              # Utility functions
│   ├── auth.js
│   ├── errorHandler.js
│   └── fileProcessor.js
├── validation/         # Input validation rules
│   ├── authValidation.js
│   ├── chatValidation.js
│   ├── userValidation.js
│   └── index.js
├── database/           # Database connection
│   └── db.js
├── server.js           # Main application file
├── package.json        # Dependencies and scripts
└── .env               # Environment variables
```

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ChatSystem/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start MongoDB**
   ```bash
   # Make sure MongoDB is running on your system
   mongod
   ```

5. **Run the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## ⚙️ Environment Variables

Create a `.env` file in the backend directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/chat_system

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key-here

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOADS_DIR=../uploads

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Security
CORS_ORIGIN=http://localhost:3000
```

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

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 📁 File Upload

Supported file types:
- **PDF**: Text extraction with metadata
- **CSV**: Data parsing with column information

File size limit: 10MB (configurable)

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

## 🚨 Error Handling

The application includes comprehensive error handling:
- Validation errors with detailed messages
- Database connection error handling
- File processing error management
- Rate limiting error responses
- Development vs production error details

## 📊 Health Monitoring

- Database connection status
- File system statistics
- API endpoint health checks
- Real-time connection monitoring

## 🔧 Development

### Running in Development Mode
```bash
npm run dev
```

### Code Structure
- **Controllers**: Handle HTTP requests and responses
- **Models**: Define database schemas and methods
- **Routes**: Define API endpoints and middleware
- **Utils**: Reusable utility functions
- **Validation**: Request input validation rules

### Adding New Features
1. Create/update models in `model/` directory
2. Add business logic in `controller/` directory
3. Define routes in `router/` directory
4. Add validation rules in `validation/` directory
5. Update error handling in `utils/errorHandler.js`

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
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support and questions, please open an issue in the repository.
