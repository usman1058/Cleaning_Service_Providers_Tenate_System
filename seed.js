import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Seeding admin user...")

  const adminEmail = "admin@ggcs.com"
  const adminPassword = "Admin@123"

  // Check if admin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  })

  if (existingAdmin) {
    console.log("⚠️ Admin already exists. Skipping creation.")
    return
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(adminPassword, 10)

  // Create admin
  const admin = await prisma.user.create({
    data: {
      email: adminEmail,
      password: hashedPassword,
      name: "System Administrator",
      role: "ADMIN",
    },
  })

  console.log("✅ Admin user created successfully")
  console.log({
    id: admin.id,
    email: admin.email,
    role: admin.role,
  })
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:", error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
