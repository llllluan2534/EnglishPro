import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET() {
  try {
    const session = await auth()

    // Get top 10 users by totalXP
    const topUsers = await prisma.userXP.findMany({
      orderBy: { totalXP: 'desc' },
      take: 10,
      include: {
        user: {
          select: {
            name: true,
            image: true,
            id: true
          }
        }
      }
    })

    const formattedTopUsers = topUsers.map((xp, index) => ({
      rank: index + 1,
      userId: xp.userId,
      name: xp.user.name,
      image: xp.user.image,
      level: xp.level,
      totalXP: xp.totalXP
    }))

    let currentUserRank = null

    if (session && session.user?.id) {
      // Find current user's rank if they are logged in
      const currentUserIndex = formattedTopUsers.findIndex(u => u.userId === session.user?.id)
      
      if (currentUserIndex !== -1) {
        currentUserRank = formattedTopUsers[currentUserIndex]
      } else {
        // Find their actual rank
        const currentUserXP = await prisma.userXP.findUnique({
          where: { userId: session.user.id },
          include: {
            user: { select: { name: true, image: true } }
          }
        })

        if (currentUserXP) {
          const higherXpCount = await prisma.userXP.count({
            where: { totalXP: { gt: currentUserXP.totalXP } }
          })
          
          currentUserRank = {
            rank: higherXpCount + 1,
            userId: session.user.id,
            name: currentUserXP.user.name,
            image: currentUserXP.user.image,
            level: currentUserXP.level,
            totalXP: currentUserXP.totalXP
          }
        }
      }
    }

    return NextResponse.json({
      leaderboard: formattedTopUsers,
      currentUserRank
    })

  } catch (error) {
    console.error('Leaderboard error:', error)
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 })
  }
}
