# BITS Alum Connect

BITS Alum Connect is a platform designed to foster connections between BITS alumni and current students. It facilitates mentorship, networking, and collaboration opportunities within the BITS community.

## Features

- **Student-Alumni Connection**: Students can request mentorship or assistance from alumni, and alumni can offer their expertise.
- **Mentorship Requests/Offers**: A structured system for students to articulate their needs and for alumni to specify their areas of contribution.
- **Real-time Communication**: (Currently a dummy UI) A dedicated workspace for connected students and alumni to communicate.
- **File Sharing**: Functionality for sharing relevant documents and resources within the connection workspace.
- **Notification System**: Keeps users informed about new connection requests, status updates, and other important activities.

## Technologies Used

- **Frontend**: Next.js, React, Tailwind CSS, TypeScript
- **Backend**: Next.js API Routes, Prisma (ORM)
- **Authentication**: NextAuth.js
- **Database**: PostgreSQL (or compatible)

## Getting Started

Follow these steps to set up the project locally:

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL database (or another database supported by Prisma)

### Installation

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd bits-alum-connect
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Environment Variables**: Create a `.env` file in the root directory and add your environment variables. A `.env.example` file might be provided as a guide.

    ```env
    DATABASE_URL="postgresql://user:password@localhost:5432/bitsalumconnect"
    NEXTAUTH_SECRET="YOUR_NEXTAUTH_SECRET"
    NEXTAUTH_URL="http://localhost:3000"
    # Add other necessary environment variables
    ```

4.  **Database Setup**: Apply Prisma migrations to set up your database schema.
    ```bash
    npx prisma migrate dev --name init
    ```

5.  **Start the development server**:
    ```bash
    npm run dev
    # or
    yarn dev
    ```

    Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Deployment

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
