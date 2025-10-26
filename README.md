# Auxilium

Auxilium is a platform designed to foster connections between BITS alumni and current students. It facilitates mentorship, networking, and collaboration opportunities within the BITS community.

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

## Deployment

Auxilium is deployed on Vercel and can be accessed at [auxilium-alumniconnect.vercel.app/landing](https://auxilium-alumniconnect.vercel.app/landing).

## How to Use

1.  **Login**: Use your college credentials to log in. If you are a new user, you will be guided through an onboarding process to set up your profile.
2.  **Browse/Search**: Students can browse or search for alumni based on their skills, interests, or offers. Alumni can view student requests.
3.  **Connect**: Students can send connection requests to alumni. Alumni can accept or deny these requests.
4.  **Collaborate**: Once connected, students and alumni can communicate in a dedicated workspace, share files, and collaborate on projects or mentorship.
5.  **Notifications**: Stay updated with real-time notifications for new requests, messages, and other activities.

## Local Development (Optional)

If you wish to run the project locally for development or contribution, follow these steps:

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL database (or another database supported by Prisma)

### Installation

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd auxilium
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Environment Variables**: Create a `.env` file in the root directory and add your environment variables. A `.env.example` file might be provided as a guide.

    ```env
    DATABASE_URL="postgresql://user:password@localhost:5432/auxilium"
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

## Contributing

We welcome contributions! Please see our `CONTRIBUTING.md` (if available) for guidelines on how to contribute to Auxilium.

## License

This project is licensed under the MIT License - see the `LICENSE` file for details.

