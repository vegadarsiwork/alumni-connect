'use server'

import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { revalidatePath } from 'next/cache'

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

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const tagsString = formData.get('tags') as string
  const githubUrl = formData.get('githubUrl') as string

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

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const tagsString = formData.get('tags') as string
  const slotsString = formData.get('slots') as string

  const tags = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
  const slots = Number(slotsString)

  await prisma.offer.create({
    data: {
      title,
      description,
      tags,
      slots,
      authorId: user.id,
    },
  })

  revalidatePath('/alumni')

  return { success: true, message: 'Offer created successfully!' }
}
