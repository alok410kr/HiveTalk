# Discord Clone

A full-featured Discord clone built with Next.js 14, featuring real-time messaging, video calls, server management, and more.

## Features

-  **Authentication** - Secure user authentication with Clerk
-  **Real-time Messaging** - Socket.io powered chat system
-  **Video Calls** - LiveKit integration for video/audio calls
-  **Server Management** - Create and manage Discord-like servers
-  **Responsive Design** - Mobile-first responsive UI
-  **Modern UI** - Beautiful interface with Tailwind CSS and Radix UI
-  **Real-time Updates** - Live notifications and status updates
-  **File Uploads** - Upload and share files with UploadThing
-  **Emoji Support** - Rich emoji picker and reactions

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI
- **Database**: Prisma ORM with MySQL
- **Authentication**: Clerk
- **Real-time**: Socket.io
- **Video Calls**: LiveKit
- **File Uploads**: UploadThing
- **State Management**: Zustand
- **Forms**: React Hook Form with Zod validation

## Getting Started

### Prerequisites

- Node.js 18+
- MySQL database
- Clerk account for authentication
- UploadThing account for file uploads
- LiveKit account for video calls

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd discord-clone
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env.local
```

4. Configure your environment variables in `.env.local`:

```env
DATABASE_URL="mysql://username:password@localhost:3306/discord_clone"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your_clerk_publishable_key"
CLERK_SECRET_KEY="your_clerk_secret_key"
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/"
UPLOADTHING_SECRET="your_uploadthing_secret"
UPLOADTHING_APP_ID="your_uploadthing_app_id"
LIVEKIT_API_KEY="your_livekit_api_key"
LIVEKIT_API_SECRET="your_livekit_api_secret"
NEXT_PUBLIC_LIVEKIT_URL="your_livekit_url"
```

5. Set up the database:

```bash
npx prisma generate
npx prisma db push
```

6. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

```
discord-clone/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Authentication pages
│   ├── (main)/            # Main application pages
│   ├── api/               # API routes
│   └── globals.css        # Global styles
├── components/            # Reusable components
│   ├── chat/             # Chat-related components
│   ├── modals/           # Modal components
│   ├── navigation/       # Navigation components
│   ├── server/           # Server-related components
│   └── ui/               # Base UI components
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions and configurations
├── prisma/               # Database schema and migrations
└── types.ts              # TypeScript type definitions
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
