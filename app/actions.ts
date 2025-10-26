'use server'

import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { revalidatePath } from 'next/cache'

// Helper function to create notifications
async function createNotification(
  userId: string,
  type: 'CONNECTION_REQUEST' | 'CONNECTION_ACCEPTED' | 'CONNECTION_DENIED' | 'CONNECTION_COMPLETED' | 'KUDOS_RECEIVED' | 'CONNECTION_WORKSPACE_UPDATED',
  title: string,
  message: string,
  connectionId?: string
) {
  await prisma.notification.create({
    data: {
      userId,
      type,
      title,
      message,
      connectionId,
    },
  })
}

export async function createAsk(formData: FormData) {
  const session = await getServerSession()
  
  if (!session?.user?.email) {
    throw new Error('You must be logged in to create an ask')
  }

  // Get user from database
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

  if (!user) {
    throw new Error('User not found')
  }

  const title = (formData.get('title') as string || '').trim()
  const description = formData.get('description') as string
  const tagsString = formData.get('tags') as string
  const githubUrl = formData.get('githubUrl') as string

  // Title length cap
  const MAX_TITLE = 100
  if (title.length === 0) throw new Error('Title is required')
  if (title.length > MAX_TITLE) throw new Error(`Title must be at most ${MAX_TITLE} characters`)

  const tags = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)

  await prisma.ask.create({
    data: {
      title,
      description,
      tags,
      githubUrl: githubUrl || null,
      authorId: user.id,
    },
  })

  revalidatePath('/student')

  return { success: true, message: 'Ask created successfully!' }
}

export async function createOffer(formData: FormData) {
  const session = await getServerSession()
  
  if (!session?.user?.email) {
    throw new Error('You must be logged in to create an offer')
  }

  // Get user from database
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

  if (!user) {
    throw new Error('User not found')
  }

  const title = (formData.get('title') as string || '').trim()
  const description = formData.get('description') as string
  const tagsString = formData.get('tags') as string
  const slotsString = formData.get('slots') as string

  // Title length cap
  const MAX_TITLE = 100
  if (title.length === 0) throw new Error('Title is required')
  if (title.length > MAX_TITLE) throw new Error(`Title must be at most ${MAX_TITLE} characters`)

  const tags = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
  const slots = Number(slotsString)

  await prisma.offer.create({
    data: {
      title,
      description,
      tags,
      slots,
      totalSlots: slots, // Set totalSlots to initial slots value for monthly tracking
      authorId: user.id,
    },
  })

  revalidatePath('/alumni')

  return { success: true, message: 'Offer created successfully!' }
}

export async function requestConnection(askId: string, offerId: string, alumId: string) {
  const session = await getServerSession()
  
  if (!session?.user?.email) {
    throw new Error('You must be logged in to request a connection')
  }

  // Get user from database
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

  if (!user) {
    throw new Error('User not found')
  }

  // Role-based access control - must be a STUDENT
  if (user.role !== 'STUDENT') {
    throw new Error('Only students can request connections')
  }

  // Verify the Ask exists and belongs to the student
  const ask = await prisma.ask.findUnique({
    where: { id: askId },
  })

  if (!ask) {
    throw new Error('Ask not found')
  }

  if (ask.authorId !== user.id) {
    throw new Error('You can only request connections for your own asks')
  }

  // Verify the Offer exists
  const offer = await prisma.offer.findUnique({
    where: { id: offerId },
  })

  if (!offer) {
    throw new Error('Offer not found')
  }

  // Check if a connection already exists
  const existingConnection = await prisma.connection.findFirst({
    where: {
      studentId: user.id,
      alumId,
      askId,
      offerId,
    },
  })

  if (existingConnection) {
    throw new Error('A connection request already exists for this match')
  }

  // Create the connection
  const connection = await prisma.connection.create({
    data: {
      status: 'PENDING',
      studentId: user.id,
      alumId,
      askId,
      offerId,
    },
    include: {
      student: { select: { name: true } },
      ask: { select: { title: true } },
    },
  })

  // Create notification for the alumni
  await createNotification(
    alumId,
    'CONNECTION_REQUEST',
    'New Connection Request',
    `${connection.student.name || 'A student'} wants to connect about "${connection.ask.title}"`,
    connection.id
  )

  revalidatePath('/student/ask/' + askId)
  revalidatePath('/alumni')

  return { success: true, message: 'Connection requested successfully!' }
}

export async function updateConnectionStatus(connectionId: string, status: 'ACCEPTED' | 'DENIED' | 'COMPLETED') {
  const session = await getServerSession()
  
  if (!session?.user?.email) {
    throw new Error('You must be logged in to update connection status')
  }

  // Get user from database
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

  if (!user) {
    throw new Error('User not found')
  }

  // Role-based access control - must be an ALUMNI
  if (user.role !== 'ALUMNI') {
    throw new Error('Only alumni can update connection status')
  }

  // Find the connection
  const connection = await prisma.connection.findUnique({
    where: { id: connectionId },
    include: { 
      offer: { select: { id: true, slots: true, title: true } },
      alum: { select: { name: true } },
      student: { select: { id: true, name: true } },
      ask: { select: { title: true } },
    },
  })

  if (!connection) {
    throw new Error('Connection not found')
  }

  // Verify the user is the alumni on this connection
  if (connection.alumId !== user.id) {
    throw new Error('You can only update your own connections')
  }

  // Update the connection status
  await prisma.connection.update({
    where: { id: connectionId },
    data: { status },
  })

  // If accepting, decrement the offer slots
  if (status === 'ACCEPTED' && connection.offer.slots > 0) {
    await prisma.offer.update({
      where: { id: connection.offerId },
      data: { slots: { decrement: 1 } },
    })
  }

  // Create notification for the student
  let notificationTitle = ''
  let notificationMessage = ''
  let notificationType: 'CONNECTION_ACCEPTED' | 'CONNECTION_DENIED' | 'CONNECTION_COMPLETED' = 'CONNECTION_ACCEPTED'

  if (status === 'ACCEPTED') {
    notificationType = 'CONNECTION_ACCEPTED'
    notificationTitle = '🎉 Connection Accepted!'
    notificationMessage = `${connection.alum.name || 'An alumni'} accepted your request for "${connection.offer.title}"`
  } else if (status === 'DENIED') {
    notificationType = 'CONNECTION_DENIED'
    notificationTitle = 'Connection Declined'
    notificationMessage = `Your request for "${connection.offer.title}" was declined. Keep trying!`
  } else if (status === 'COMPLETED') {
    notificationType = 'CONNECTION_COMPLETED'
    notificationTitle = '✅ Connection Completed'
    notificationMessage = `${connection.alum.name || 'An alumni'} marked your connection about "${connection.ask.title}" as complete`
  }

  await createNotification(
    connection.studentId,
    notificationType,
    notificationTitle,
    notificationMessage,
    connectionId
  )

  revalidatePath('/alumni')
  revalidatePath('/connection/' + connectionId)

  return { success: true, message: `Connection ${status.toLowerCase()} successfully!` }
}

export async function giveKudos(alumId: string) {
  const session = await getServerSession()
  
  if (!session?.user?.email) {
    throw new Error('You must be logged in to give kudos')
  }

  // Get user from database
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

  if (!user) {
    throw new Error('User not found')
  }

  // Increment kudos for the alumni
  const alum = await prisma.user.update({
    where: { id: alumId },
    data: { kudos: { increment: 1 } },
    select: { name: true, kudos: true },
  })

  // Create notification for the alumni
  await createNotification(
    alumId,
    'KUDOS_RECEIVED',
    '🏆 You received Kudos!',
    `${user.name || 'Someone'} gave you kudos! You now have ${alum.kudos} kudos.`,
  )

  revalidatePath('/profile/' + alumId)

  return { success: true, message: 'Kudos given! 🏆' }
}

// Notification actions
export async function getNotifications() {
  const session = await getServerSession()
  
  if (!session?.user?.email) {
    return []
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

  if (!user) {
    return []
  }

  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 20, // Limit to 20 most recent notifications
  })

  return notifications
}

export async function markNotificationAsRead(notificationId: string) {
  const session = await getServerSession()
  
  if (!session?.user?.email) {
    throw new Error('You must be logged in')
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

  if (!user) {
    throw new Error('User not found')
  }

  // Verify the notification belongs to the user
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
  })

  if (!notification || notification.userId !== user.id) {
    throw new Error('Notification not found')
  }

  await prisma.notification.update({
    where: { id: notificationId },
    data: { read: true },
  })

  revalidatePath('/')

  return { success: true }
}

export async function markAllNotificationsAsRead() {
  const session = await getServerSession()
  
  if (!session?.user?.email) {
    throw new Error('You must be logged in')
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

  if (!user) {
    throw new Error('User not found')
  }

  await prisma.notification.updateMany({
    where: { userId: user.id, read: false },
    data: { read: true },
  })

  revalidatePath('/')

  return { success: true }
}

export async function updateProfile(formData: FormData) {
  'use server'
  
  const session = await getServerSession()
  
  if (!session?.user?.email) {
    throw new Error('You must be logged in to update your profile')
  }

  // Get the user ID from the database
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true }
  })

  if (!user) {
    throw new Error('User not found')
  }

  const headline = formData.get('headline') as string
  const education = formData.get('education') as string
  const image = formData.get('image') as string
  const skillsString = formData.get('skills') as string
  const availability = formData.get('availability') as string
  const name = formData.get('name') as string
  
  const skills = skillsString ? skillsString.split(',').map(s => s.trim()).filter(s => s) : []
  
  await prisma.user.update({
    where: { id: user.id },
    data: {
      headline,
      education,
      image,
      skills,
      availability,
      name,
    },
  })
  
  revalidatePath('/profile/' + user.id)
  revalidatePath('/student')
  revalidatePath('/alumni')
  
  return { success: true }
}

export async function updateConnectionWorkspace(
  connectionId: string,
  zoomLink: string | null,
  alumFeedbackFile: string | null,
  studentUploadFile: string | null
) {
  try {
    const connection = await prisma.connection.update({
      where: { id: connectionId },
      data: {
        zoomLink,
        alumFeedbackFile,
        studentUploadFile,
      },
      include: {
        student: { select: { id: true, name: true } },
        alum: { select: { id: true, name: true } },
        ask: { select: { title: true } },
      },
    });

    // Create notifications for both student and alum
    const notificationMessage = `The connection workspace for "${connection.ask.title}" has been updated.`;

    await createNotification(
      connection.studentId,
      'CONNECTION_WORKSPACE_UPDATED',
      'Connection Workspace Updated',
      notificationMessage,
      connection.id
    );

    await createNotification(
      connection.alumId,
      'CONNECTION_WORKSPACE_UPDATED',
      'Connection Workspace Updated',
      notificationMessage,
      connection.id
    );

    revalidatePath(`/connection/${connectionId}`);
    return { success: true };
  } catch (error) {
    console.error("Error updating connection workspace:", error);
    return { success: false, error: "Failed to update connection workspace." };
  }
}