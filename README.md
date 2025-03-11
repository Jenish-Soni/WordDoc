# Quillmatic  - AI-Powered Collaborative Document Editor

## Overview
Quillmatic  is a real-time collaborative document editor with integrated AI-powered grammar checking capabilities. Built with React for the frontend and Node.js for the backend, it combines the power of Google's Gemini AI for grammar analysis with real-time collaboration features.

## Features
- **Real-time Collaboration**: Multiple users can edit documents simultaneously
- **AI Grammar Checking**: Powered by Google's Gemini AI
- **Rich Text Editing**: Full-featured text editor with formatting options
- **User Authentication**: Secure JWT-based authentication system
- **Auto-saving**: Automatic document saving
- **Document Management**: Create, edit, and organize documents
- **Real-time Grammar Suggestions**: Instant feedback on grammar and writing style

## Tech Stack

### Frontend
- React.js
- React Router for navigation
- React-Quill for rich text editing
- Socket.io-client for real-time collaboration
- Axios for API communication
- Context API for state management

### Backend
- Node.js
- Express.js
- MongoDB for database
- Socket.io for real-time features
- JWT for authentication
- Google Generative AI SDK
- Redis for caching

## Project Structure

## Setup and Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- Redis
- Google Gemini API key

### Backend Setup
1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a .env file:
```env
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
REDIS_URL=your_redis_url
PORT=5000
```

4. Start the server:
```bash
npm start
```

### Frontend Setup
1. Navigate to the frontend directory:
```bash
cd Frontend/docs
```

2. Install dependencies:
```bash
npm install
```

3. Create a .env file:
```env
REACT_APP_API_URL=http://localhost:5000
```

4. Start the development server:
```bash
npm start
```

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `GET /auth/check` - Verify authentication
- `POST /auth/logout` - User logout

### Documents
- `GET /api/documents` - Get all documents
- `POST /api/documents` - Create new document
- `GET /api/documents/:id` - Get specific document
- `PUT /api/documents/:id` - Update document
- `DELETE /api/documents/:id` - Delete document

### Grammar Check
- `POST /api/grammar/check` - Check text for grammar issues
- `POST /api/grammar/stream` - Stream grammar suggestions

## Real-time Features
- Document collaboration using Socket.io
- Cursor position sharing
- Real-time content updates
- Presence awareness

## AI Grammar Checking
The application uses Google's Gemini AI to provide:
- Grammar error detection
- Style suggestions
- Spelling corrections
- Writing improvements

## Security Features
- JWT-based authentication
- Password hashing
- Rate limiting
- Input validation
- XSS protection

## Caching Strategy
- Redis caching for frequently accessed documents
- Session management
- Rate limiting implementation

## Error Handling
- Comprehensive error handling for API requests
- Real-time connection error recovery
- Graceful degradation of AI features

## Future Enhancements
1. Document version history
2. Advanced formatting options
3. Document sharing and permissions
4. Mobile responsive design
5. Offline support
6. Export to different formats
7. Integration with cloud storage

## Contributing
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License
This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments
- Google Gemini AI for grammar checking
- React-Quill for rich text editing
- Socket.io for real-time features
- MongoDB for database management
- Redis for caching

## Contact
For any queries or support, please contact [Your Contact Information]

## Project Status
Currently in active development. Version 1.0.0 