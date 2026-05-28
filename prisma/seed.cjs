const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clear existing data
  await prisma.review.deleteMany();
  await prisma.recruiter.deleteMany();
  await prisma.placementStat.deleteMany();
  await prisma.course.deleteMany();
  await prisma.savedCollege.deleteMany();
  await prisma.compareItem.deleteMany();
  await prisma.college.deleteMany();
  await prisma.user.deleteMany();

  // Demo user
  const hashedPassword = await bcrypt.hash('password123', 10);
  const demoUser = await prisma.user.create({
    data: {
      name: 'Demo User',
      email: 'demo@univfind.in',
      password: hashedPassword,
    },
  });

  // You can continue copying the rest of your seed logic from seed.ts here
  // ...
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
