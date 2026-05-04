const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Hash passwords
  const adminPassword = await bcrypt.hash('admin123', 10);
  const vendorPassword = await bcrypt.hash('vendor123', 10);
  const clientPassword = await bcrypt.hash('client123', 10);

  // Create users
  const admin = await prisma.user.upsert({
    where: { email: 'admin@greenservices.com' },
    update: {},
    create: {
      email: 'admin@greenservices.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  const vendor = await prisma.user.upsert({
    where: { email: 'vendor@greenservices.com' },
    update: {},
    create: {
      email: 'vendor@greenservices.com',
      name: 'Vendor User',
      password: vendorPassword,
      role: 'VENDOR',
    },
  });

  const client = await prisma.user.upsert({
    where: { email: 'client@greenservices.com' },
    update: {},
    create: {
      email: 'client@greenservices.com',
      name: 'Client User',
      password: clientPassword,
      role: 'CLIENT',
    },
  });

  console.log('✓ Users created:', { admin: admin.email, vendor: vendor.email, client: client.email });

  // Create service categories
  const cleaningCategory = await prisma.serviceCategory.upsert({
    where: { slug: 'cleaning' },
    update: {},
    create: {
      name: 'Cleaning Services',
      slug: 'cleaning',
      description: 'Professional cleaning services for homes and businesses',
      icon: 'broom',
      displayOrder: 1,
    },
  });

  const maintenanceCategory = await prisma.serviceCategory.upsert({
    where: { slug: 'maintenance' },
    update: {},
    create: {
      name: 'Maintenance Services',
      slug: 'maintenance',
      description: 'Maintenance and repair services',
      icon: 'wrench',
      displayOrder: 2,
    },
  });

  console.log('✓ Categories created:', { cleaning: cleaningCategory.slug, maintenance: maintenanceCategory.slug });

  // Create services
  const services = [
    {
      name: 'Residential Cleaning',
      slug: 'residential-cleaning',
      description: 'Complete home cleaning service including dusting, vacuuming, and sanitizing',
      startingPrice: 99.99,
      categoryId: cleaningCategory.id,
      isActive: true,
    },
    {
      name: 'Commercial Cleaning',
      slug: 'commercial-cleaning',
      description: 'Professional cleaning for offices, retail spaces, and commercial properties',
      startingPrice: 199.99,
      categoryId: cleaningCategory.id,
      isActive: true,
    },
    {
      name: 'Deep Cleaning',
      slug: 'deep-cleaning',
      description: 'Intensive cleaning service reaching every corner of your property',
      startingPrice: 149.99,
      categoryId: cleaningCategory.id,
      isActive: true,
    },
    {
      name: 'Move-In/Move-Out Cleaning',
      slug: 'move-in-move-out-cleaning',
      description: 'Specialized cleaning for moving transitions',
      startingPrice: 179.99,
      categoryId: cleaningCategory.id,
      isActive: true,
    },
    {
      name: 'Carpet & Upholstery Cleaning',
      slug: 'carpet-upholstery-cleaning',
      description: 'Professional carpet and furniture cleaning',
      startingPrice: 129.99,
      categoryId: cleaningCategory.id,
      isActive: true,
    },
    {
      name: 'Post-Construction Cleaning',
      slug: 'post-construction-cleaning',
      description: 'Thorough cleaning after renovation or construction work',
      startingPrice: 249.99,
      categoryId: cleaningCategory.id,
      isActive: true,
    },
  ];

  for (const service of services) {
    await prisma.service.upsert({
      where: { slug: service.slug },
      update: {},
      create: service,
    });
  }

  console.log('✓ Services created:', services.length);

  // Create system settings
  const settings = [
    {
      key: 'maxUploadFileSize',
      value: '5242880', // 5MB
      description: 'Maximum file upload size in bytes',
      category: 'upload',
    },
    {
      key: 'maxContractFileSize',
      value: '10485760', // 10MB
      description: 'Maximum contract file size in bytes',
      category: 'upload',
    },
    {
      key: 'allowedFileTypes',
      value: 'pdf,jpg,jpeg,png',
      description: 'Allowed file types for uploads',
      category: 'upload',
    },
  ];

  for (const setting of settings) {
    await prisma.systemSettings.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }

  console.log('✓ System settings created:', settings.length);
  console.log('Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
