# KnowledgeForge

KnowledgeForge is an AI-powered knowledge management and RAG (Retrieval-Augmented Generation) platform designed to transform documents into a searchable, intelligent knowledge base. It enables teams to upload documents, organize them into workspaces, ask questions in natural language, and receive context-aware answers with source citations.

Built for modern teams who work with large amounts of technical, legal, product, research, or internal documentation, KnowledgeForge brings AI, semantic search, and document processing into a single workflow.

## Team

This project was created by a 3-member team:

- Member 1: [Your Name] — Project Lead / Backend Development
- Member 2: [Your Name] — Frontend Development / UI Design
- Member 3: [Your Name] — AI / Data / System Integration

You can replace these names with your real team members as needed.

## Project Overview

KnowledgeForge combines:

- Document ingestion from PDF, DOCX, TXT, and CSV formats
- Workspace-based organization for projects and teams
- Semantic search and vector retrieval
- AI-powered chat with grounded answers from uploaded content
- User authentication, profile management, and onboarding flow
- Analytics and project activity tracking
- Secure and scalable architecture for enterprise-style knowledge systems

## Why This Project

Most teams lose valuable time searching across scattered documents and disconnected knowledge sources. KnowledgeForge solves this by turning raw documents into a live, searchable knowledge layer powered by AI.

Instead of manually digging through files, users can:

- upload files into a workspace
- let the system process and index them
- ask questions in plain language
- get answers based on the actual content stored in their documents

## Key Features

### Document Intelligence
- Supports PDF, DOCX, TXT, and CSV uploads
- Extracts and processes content for indexing
- Tracks document status and chunk processing progress
- Handles large document sets in workspaces

### AI-Powered Q&A
- Ask questions about uploaded documents
- Retrieves relevant context from indexed chunks
- Generates grounded responses using LLMs
- Provides citations/source references for trust and transparency

### Smart Knowledge Workspaces
- Create separate workspaces for different teams or projects
- Organize all documents and conversations by context
- Manage multiple knowledge domains from one dashboard

### Analytics and Insights
- Monitor document activity and workspace stats
- Track conversations and knowledge usage
- View project-level insight summaries

### User Experience
- Modern landing page and product UI
- Auth flows for sign up, login, password reset, onboarding
- Dashboard with workspace summaries and quick actions
- Responsive design for desktop and tablet use

## Tech Stack

### Frontend
- React
- Vite
- TypeScript
- Tailwind CSS
- Framer Motion
- React Router
- Zustand
- TanStack React Query

### Backend
- Python
- FastAPI
- Pydantic
- JWT authentication
- Redis
- Rate limiting
- Structured logging

### AI & Data Layer
- Qdrant vector database
- MongoDB for metadata and app data
- FastEmbed / embedding pipeline
- Groq LLM integration
- RAG orchestration with semantic retrieval

### Infrastructure / Services
- Docker Compose support
- REST API architecture
- Secure environment-based configuration

## Architecture Overview

KnowledgeForge follows a modern RAG architecture:

1. User uploads documents into a workspace.
2. Backend processes and extracts document content.
3. Content is split into chunks and embedded.
4. Embeddings are stored in a vector database (Qdrant).
5. User asks a question in the chat interface.
6. Relevant chunks are retrieved semantically.
7. LLM generates a contextual answer based on retrieved content.
8. The response is returned with citations and stored in the conversation.

## Project Structure

```text
KnowledgeForge/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── db/
│   │   ├── integrations/
│   │   ├── models/
│   │   ├── modules/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── utils/
│   │   └── main.py
│   ├── storage/
│   ├── requirements.txt
│   ├── .env
│   └── myenv/
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── .env.example
│   └── .env
├── docker-compose.yml
├── README.md
└── hello.py
```

## Product Demo

### Demo Video

Add your short project demo video here:

```html
<video controls width="100%" poster="./assets/video-poster.png">
  <source src="./assets/project-demo.mp4" type="video/mp4" />
  Your browser does not support the video tag.
</video>
```

You can replace the placeholder path with your actual video file when ready.

### UI Screenshots / Response Views

Add your landing page, dashboard, chat interface, and answer screenshots here for a better presentation:

```md
![Landing Page](./assets/landing-page.png)
![Dashboard](./assets/dashboard.png)
![Workspace](./assets/workspace.png)
![Chat Response](./assets/chat-response.png)
![Analytics](./assets/analytics.png)
```

You can store these images in an `assets/` folder and update the paths accordingly.

## Features Included in the App

The current interface includes key product sections such as:

- Landing page
- Sign up and login
- Forgot password and reset password
- Onboarding flow
- Dashboard overview
- Workspace management
- Document upload and document list
- AI chat conversations
- Analytics and workspace insights
- Settings and profile page

## Getting Started

### Prerequisites

Make sure you have the following installed:

- Python 3.10+
- Node.js 18+
- npm or yarn
- MongoDB running locally or accessible remotely
- Qdrant instance
- Redis instance
- Groq API key

### 1. Backend Setup

```bash
cd backend
python -m venv myenv

# Windows
myenv\Scripts\activate

# macOS/Linux
source myenv/bin/activate

pip install -r requirements.txt
```

Create or update your `.env` file with your project settings before running the server.

Start the backend:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend will typically run at:

- http://localhost:5173

Backend API will typically run at:

- http://localhost:8000

### 3. Docker Setup

You can also run the app using Docker Compose:

```bash
docker-compose up --build
```

## Environment Variables

Below is the standard structure for configuration values used by the app:

### Backend `.env`

```env
MONGODB_URL=your_mongodb_connection_string
DATABASE_NAME=knowledgeforge_db
SECRET_KEY=your_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your_email
MAIL_PASSWORD=your_app_password
MAIL_FROM=your_email
GROQ_API_KEY=your_groq_api_key
QDRANT_URL=your_qdrant_url
QDRANT_API_KEY=your_qdrant_api_key
QDRANT_COLLECTION_NAME=knowledgeforge_chunks
GROQ_MODEL=openai/gpt-oss-20b
REDIS_URL=redis://localhost:6379
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### Frontend `.env`

```env
VITE_API_URL=http://localhost:8000
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

## Main User Flows

### User Sign Up and Login
- New users can create an account
- Login and token-based authentication are supported
- Password reset flow is included

### Workspace Creation
- Users can create multiple workspaces
- A workspace acts as an isolated knowledge domain

### Document Upload
- Users upload files from the document tab
- The backend validates type and size
- Content is processed and indexed for retrieval

### AI Chat
- Users start a conversation in a workspace
- Relevant context from uploaded content is retrieved
- Answers are generated using AI and returned with citations

### Analytics
- Users can review workspace metrics and recent activity
- Helps understand knowledge usage and document health

## Security Notes

- JWT-based authentication for protected routes
- Environment variables used for sensitive credentials
- CORS configuration for frontend/local development
- Rate limiting enabled in backend services
- Storage and vector endpoints separated by service logic

## Future Enhancements

Potential roadmap improvements:

- Multi-user permissions and access control
- Role-based workspace management
- Admin dashboard and audit logs
- Better document versioning
- More file types and OCR support
- Exporting chat responses and reports
- Improved evaluation and RAG quality scoring

## License

This project is currently shared as an internal or open project without a formal license file. If you plan to publish it publicly, add a license such as MIT or Apache 2.0.

## Contact / Collaboration

For questions, collaboration, or deployment support, please reach out to the project team.

- Team Lead: [Your Name]
- Email: [your.email@example.com]
- GitHub: [your-github-profile]

## Final Note

KnowledgeForge is a strong AI knowledge platform foundation for building document-driven enterprise search and assistant experiences. It is designed to be scalable, practical, and easy to extend as your product grows.

If you want, this README can also be tailored for:

- GitHub portfolio presentation
- Academic project submission
- Client-facing product showcase
- Startup pitch / demo deck
