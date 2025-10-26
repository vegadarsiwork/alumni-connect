import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log(`Start seeding ...`);

  // --- CLEANUP ---
  await prisma.connection.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.ask.deleteMany();
  await prisma.offer.deleteMany();
  await prisma.user.deleteMany();
  console.log('Deleted existing data.');

  // --- CREATE USERS ---

  // Alumni
  const hashedPassword = await bcrypt.hash('password123', 10); // Use the same simple password for all demo users

  const alum1 = await prisma.user.create({
    data: {
      email: 'priya.sharma@alum.bits.ac.in',
      name: 'Priya Sharma',
      password: hashedPassword,
      role: Role.ALUMNI,
      headline: 'Senior Data Scientist @ Google',
      education: 'M.Sc Data Science @ Stanford',
      image: 'https://images.unsplash.com/photo-1521119989659-a83eee488004?q=80&w=2823&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // Placeholder image URL
      skills: ['Python', 'Machine Learning', 'Computer Vision', 'TensorFlow', 'Cloud AI'],
      availability: "AVAILABLE",
      kudos: 12, // Give her Top Mentor status
    },
  });

  const alum2 = await prisma.user.create({
    data: {
      email: 'rahul.verma@alum.bits.ac.in',
      name: 'Rahul Verma',
      password: hashedPassword,
      role: Role.ALUMNI,
      headline: 'Staff Engineer @ Microsoft',
      education: 'B.Tech CS @ BITS Pilani',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=2787&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      skills: ['React', 'Node.js', 'TypeScript', 'Systems Design', 'AWS', 'Web Development'],
      availability: "AVAILABLE",
      kudos: 5,
    },
  });

  const alum3 = await prisma.user.create({
    data: {
      email: 'aisha.khan@alum.bits.ac.in',
      name: 'Aisha Khan',
      password: hashedPassword,
      role: Role.ALUMNI,
      headline: 'Founder @ YC S25 Startup',
      education: 'MBA @ IIM Ahmedabad',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=2787&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      skills: ['Startups', 'Fundraising', 'Marketing', 'Business Operations', 'Product Management'],
      availability: "BUSY", // Show this feature
      kudos: 8,
    },
  });

  // Students
  const student1 = await prisma.user.create({
    data: {
      email: 'rohan.kumar@student.bits.ac.in',
      name: 'Rohan Kumar',
      password: hashedPassword,
      role: Role.STUDENT,
      headline: '3rd Year CS Student | Aspiring AI Engineer',
      education: 'B.Tech Computer Science @ BITS Pilani (Expected 2027)',
      image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=2787&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      skills: ['Python', 'C++', 'Basic ML'], // Fewer skills
    },
  });

  const student2 = await prisma.user.create({
    data: {
      email: 'sneha.patel@student.bits.ac.in',
      name: 'Sneha Patel',
      password: hashedPassword,
      role: Role.STUDENT,
      headline: '2nd Year EEE Student | Web Dev Enthusiast',
      education: 'B.Tech EEE @ BITS Pilani (Expected 2028)',
      image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=2787&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      skills: ['JavaScript', 'HTML', 'CSS', 'React Basics'],
    },
  });

  console.log('Created users.');

  // --- CREATE OFFERS (Supply for the Marketplace) ---

  await prisma.offer.create({ // Priya's CV Offer (Good match for Rohan)
    data: {
      title: 'Mentorship for Computer Vision / ML Projects',
      description: 'Happy to do a 30-min call to review code or discuss concepts for students working on CV or applied ML projects.',
      tags: ['Computer Vision', 'Machine Learning', 'Python', 'TensorFlow'],
      slots: 3,
      authorId: alum1.id,
    },
  });

  await prisma.offer.create({ // Rahul's Mock Interview Offer (Good match for Sneha)
    data: {
      title: 'Mock Interviews for SDE Intern Roles (Web Dev)',
      description: 'Realistic 45-min technical mock interview focusing on React, Node.js, and basic system design.',
      tags: ['React', 'Node.js', 'Web Development', 'Mock Interview', 'Systems Design'],
      slots: 2,
      authorId: alum2.id,
    },
  });

  await prisma.offer.create({ // Rahul's Second Offer (Web Dev general)
    data: {
      title: 'MERN Stack Project Code Review',
      description: 'Stuck on your MERN project? I can do a 30-min code review and debugging session.',
      tags: ['MongoDB', 'Express', 'React', 'Node.js', 'Web Development'],
      slots: 4,
      authorId: alum2.id,
    },
  });

  await prisma.offer.create({ // Aisha's Resume Review (But she's BUSY)
    data: {
      title: 'Resume Reviews for Startup Roles (Non-Tech)',
      description: 'Async video feedback on resumes for marketing, bizops, or PM roles at startups.',
      tags: ['Startups', 'Resume Review', 'Marketing', 'Business Operations'],
      slots: 5, // Even though she has slots, her status is BUSY
      authorId: alum3.id,
    },
  });

  console.log('Created offers.');

  // --- CREATE ASKS (Demand - To Showcase Matching) ---

  await prisma.ask.create({ // Rohan's "WOW" Ask (Matches Priya via GitHub)
    data: {
      title: 'Help with Python Sign Language Detection Project',
      description: 'My final year project using OpenCV & CNN isn\'t detecting my model correctly. Need a 15-min chat with a CV expert to look at the code structure.',
      tags: ['Python', 'Computer Vision', 'OpenCV', 'Deep Learning'], // Specific tags
      githubUrl: 'https://github.com/octocat/Spoon-Knife', // Use a REAL, simple GitHub repo URL for demo
      authorId: student1.id,
    },
  });

  await prisma.ask.create({ // Sneha's Ask (Matches Rahul)
    data: {
      title: 'Mock Interview for Web Dev Intern Role',
      description: 'Need practice for a frontend/full-stack intern interview. Focus on React basics and maybe some Node.js API questions.',
      tags: ['React', 'Web Development', 'Mock Interview', 'Internship'],
      authorId: student2.id,
    },
  });

   await prisma.ask.create({ // An Ask with NO good match (Shows the Gap)
     data: {
       title: 'Guidance on Quantum Computing Career Path',
       description: 'Interested in pursuing Quantum Computing research. Looking for a 15-min chat with someone in the field.',
       tags: ['Quantum Computing', 'Research', 'Career Chat'],
       authorId: student1.id, // Rohan asks this too
     },
   });


  console.log(`Seeding finished.`);
}

main()
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });