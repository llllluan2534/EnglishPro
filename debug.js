const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugDB() {
  try {
    const user = await prisma.user.findFirst();
    if (!user) return console.log('No user');
    console.log('User found:', user.id);

    const lesson = await prisma.lesson.findFirst();
    if (!lesson) return console.log('No lesson');
    console.log('Lesson found:', lesson.id);

    const lessonWithVocab = await prisma.lesson.findUnique({
      where: { id: lesson.id },
      include: { vocabularies: true }
    });
    console.log('Vocabs count:', lessonWithVocab?.vocabularies?.length || 0);

    const amount = 20;
    
    console.log('Testing UserXP Upsert...');
    await prisma.userXP.upsert({
      where: { userId: user.id },
      update: { totalXP: { increment: amount }, weeklyXP: { increment: amount }, monthlyXP: { increment: amount } },
      create: { userId: user.id, totalXP: amount, level: 1, weeklyXP: amount, monthlyXP: amount }
    });
    console.log('UserXP UPSERT OK');
    
    console.log('Testing XPHistory Create...');
    await prisma.xPHistory.create({
      data: { userId: user.id, amount, reason: 'LESSON_COMPLETE', refId: lesson.id }
    });
    console.log('XPHistory CREATE OK');

    console.log('Testing Streak Update/Create...');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const streak = await prisma.streak.findUnique({ where: { userId: user.id } });
    if (!streak) {
      await prisma.streak.create({ data: { userId: user.id, currentStreak: 1, longestStreak: 1, lastStudyDate: today } });
      console.log('Streak CREATE OK');
    } else {
      const newStreak = streak.currentStreak + 1;
      await prisma.streak.update({
        where: { userId: user.id },
        data: {
          currentStreak: newStreak,
          longestStreak: Math.max(streak.longestStreak, newStreak),
          lastStudyDate: today
        }
      });
      console.log('Streak UPDATE OK');
    }

    if (lessonWithVocab && lessonWithVocab.vocabularies.length > 0) {
      console.log('Testing FlashcardReview Upsert...');
      await Promise.all(
        lessonWithVocab.vocabularies.map((vocab) => 
          prisma.flashcardReview.upsert({
            where: {
              userId_vocabularyId: {
                userId: user.id,
                vocabularyId: vocab.id
              }
            },
            update: {}, 
            create: {
              userId: user.id,
              vocabularyId: vocab.id,
              easeFactor: 2.5,
              interval: 0,
              repetitions: 0,
              nextReviewAt: new Date(),
            }
          })
        )
      );
      console.log('FlashcardReview UPSERT OK');
    }

  } catch (e) {
    console.error('ERROR OCCURRED:', e);
  } finally {
    process.exit(0);
  }
}
debugDB();
