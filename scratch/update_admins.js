const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const admins = await prisma.user.updateMany({
    where: { role: 'ADMIN' },
    data: {
      permissions: 'manage_admins,manage_vendors,manage_clients,manage_services,view_reports'
    }
  })
  console.log(`Updated ${admins.count} admins with full permissions.`)
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())
