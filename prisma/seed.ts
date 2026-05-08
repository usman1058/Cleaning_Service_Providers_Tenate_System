import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting comprehensive database seed...')

  // Clear existing data in correct order (respecting foreign keys)
  console.log('🧹 Clearing existing data...')
  await prisma.ticket.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.auditLog.deleteMany()
  await prisma.vendorContract.deleteMany()
  await prisma.vendorApplication.deleteMany()
  await prisma.vendorProfile.deleteMany()
  await prisma.serviceAssignment.deleteMany()
  await prisma.receipt.deleteMany()
  await prisma.serviceRequest.deleteMany()
  await prisma.service.deleteMany()
  await prisma.serviceSubcategory.deleteMany()
  await prisma.serviceCategory.deleteMany()
  await prisma.systemSettings.deleteMany()
  await prisma.contractTemplate.deleteMany()
  await prisma.user.deleteMany()

  // ==================== USERS ====================
  console.log('\n👥 Creating users...')

  const adminPassword = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.create({
    data: {
      email: 'admin@ggc.com',
      password: adminPassword,
      name: 'Sarah Admin',
      role: 'ADMIN',
      permissions: 'manage_admins,manage_vendors,manage_clients,manage_services,view_reports',
    },
  })

  const clientPassword = await bcrypt.hash('client123', 12)
  const client1 = await prisma.user.create({
    data: {
      email: 'client@ggc.com',
      password: clientPassword,
      name: 'John Client',
      role: 'CLIENT',
    },
  })

  const client2 = await prisma.user.create({
    data: {
      email: 'jane.smith@email.com',
      password: clientPassword,
      name: 'Jane Smith',
      role: 'CLIENT',
    },
  })

  const client3 = await prisma.user.create({
    data: {
      email: 'bob.jones@email.com',
      password: clientPassword,
      name: 'Bob Jones',
      role: 'CLIENT',
    },
  })

  const vendorPassword = await bcrypt.hash('vendor123', 12)
  const vendor1 = await prisma.user.create({
    data: {
      email: 'vendor@ggc.com',
      password: vendorPassword,
      name: 'Clean Pro Services',
      role: 'VENDOR',
    },
  })

  const vendor2 = await prisma.user.create({
    data: {
      email: 'sparkleclean@email.com',
      password: vendorPassword,
      name: 'Sparkle Clean Co',
      role: 'VENDOR',
    },
  })

  console.log('✅ Created 6 users (1 admin, 3 clients, 2 vendors)')
  console.log('   Admin: admin@ggc.com / admin123')
  console.log('   Client: client@ggc.com / client123')
  console.log('   Vendor: vendor@ggc.com / vendor123')

  // ==================== VENDOR PROFILES ====================
  console.log('\n🏢 Creating vendor profiles...')

  await prisma.vendorProfile.create({
    data: {
      userId: vendor1.id,
      companyName: 'Clean Pro Services LLC',
      businessType: 'LLC',
      serviceLocations: JSON.stringify(['New York', 'Brooklyn', 'Queens', 'Manhattan']),
      experienceYears: 8,
      teamSize: 12,
      dailyCapacity: 5,
      availability: 'Mon-Fri 8:00 AM - 6:00 PM',
      description: 'Professional cleaning services with 8+ years of experience in residential and commercial cleaning',
      status: 'APPROVED',
      reviewedBy: admin.id,
      reviewedAt: new Date(),
    },
  })

  await prisma.vendorProfile.create({
    data: {
      userId: vendor2.id,
      companyName: 'Sparkle Clean Co',
      businessType: 'Corporation',
      serviceLocations: JSON.stringify(['Los Angeles', 'Santa Monica', 'Pasadena']),
      experienceYears: 5,
      teamSize: 8,
      dailyCapacity: 3,
      availability: 'Mon-Sat 9:00 AM - 5:00 PM',
      description: 'Eco-friendly cleaning solutions for homes and offices',
      status: 'APPROVED',
      reviewedBy: admin.id,
      reviewedAt: new Date(),
    },
  })

  console.log('✅ Created 2 vendor profiles')

  // ==================== SERVICE CATEGORIES ====================
  console.log('\n📂 Creating service categories...')

  const residential = await prisma.serviceCategory.create({
    data: {
      name: 'Residential Cleaning',
      slug: 'residential-cleaning',
      description: 'Regular home cleaning services for your peace of mind',
      icon: 'Home',
      isActive: true,
      displayOrder: 1,
    },
  })

  const commercial = await prisma.serviceCategory.create({
    data: {
      name: 'Commercial Cleaning',
      slug: 'commercial-cleaning',
      description: 'Professional office and commercial space cleaning',
      icon: 'Building',
      isActive: true,
      displayOrder: 2,
    },
  })

  const deepClean = await prisma.serviceCategory.create({
    data: {
      name: 'Deep Cleaning',
      slug: 'deep-cleaning',
      description: 'Thorough deep cleaning services for a spotless environment',
      icon: 'Sparkles',
      isActive: true,
      displayOrder: 3,
    },
  })

  console.log('✅ Created 3 service categories')

  // ==================== SERVICES ====================
  console.log('\n🧹 Creating services...')

  const services = await prisma.service.createMany({
    data: [
      // Residential
      {
        name: 'Standard Home Cleaning',
        slug: 'standard-home-cleaning',
        description: 'Regular cleaning for your home including dusting, vacuuming, mopping, and bathroom sanitization',
        startingPrice: 99.99,
        duration: '2-3 hours',
        isActive: true,
        categoryId: residential.id,
      },
      {
        name: 'Move In/Out Cleaning',
        slug: 'move-in-out-cleaning',
        description: 'Thorough cleaning for when you are moving in or out. Includes inside cabinets, appliances, and deep sanitization',
        startingPrice: 199.99,
        duration: '4-6 hours',
        isActive: true,
        categoryId: residential.id,
      },
      {
        name: 'Weekly Maintenance Cleaning',
        slug: 'weekly-maintenance-cleaning',
        description: 'Scheduled weekly cleaning to keep your home consistently fresh and tidy',
        startingPrice: 79.99,
        duration: '1.5-2 hours',
        isActive: true,
        categoryId: residential.id,
      },
      // Commercial
      {
        name: 'Office Cleaning',
        slug: 'office-cleaning',
        description: 'Professional office cleaning including desks, common areas, restrooms, and break rooms',
        startingPrice: 149.99,
        duration: '3-4 hours',
        isActive: true,
        categoryId: commercial.id,
      },
      {
        name: 'Retail Space Cleaning',
        slug: 'retail-space-cleaning',
        description: 'Keep your retail space pristine for customers with our thorough cleaning service',
        startingPrice: 129.99,
        duration: '2-3 hours',
        isActive: true,
        categoryId: commercial.id,
      },
      // Deep Cleaning
      {
        name: 'Deep House Cleaning',
        slug: 'deep-house-cleaning',
        description: 'Comprehensive deep cleaning for your entire home including hard-to-reach areas',
        startingPrice: 249.99,
        duration: '5-8 hours',
        isActive: true,
        categoryId: deepClean.id,
      },
      {
        name: 'Carpet Cleaning',
        slug: 'carpet-cleaning',
        description: 'Professional carpet cleaning and stain removal using eco-friendly solutions',
        startingPrice: 79.99,
        duration: '1-2 hours',
        isActive: true,
        categoryId: deepClean.id,
      },
      {
        name: 'Post-Construction Cleaning',
        slug: 'post-construction-cleaning',
        description: 'Complete cleanup after construction or renovation work including dust removal and debris cleanup',
        startingPrice: 299.99,
        duration: '6-10 hours',
        isActive: true,
        categoryId: deepClean.id,
      },
      {
        name: 'Window Cleaning',
        slug: 'window-cleaning',
        description: 'Interior and exterior window cleaning for crystal clear views',
        startingPrice: 59.99,
        duration: '1-2 hours',
        isActive: true,
        categoryId: deepClean.id,
      },
    ],
  })

  const allServices = await prisma.service.findMany()
  console.log(`✅ Created ${allServices.length} services`)

  // ==================== SERVICE REQUESTS ====================
  console.log('\n📋 Creating service requests...')

  const standardService = allServices.find(s => s.slug === 'standard-home-cleaning')!
  const deepService = allServices.find(s => s.slug === 'deep-house-cleaning')!
  const officeService = allServices.find(s => s.slug === 'office-cleaning')!
  const moveService = allServices.find(s => s.slug === 'move-in-out-cleaning')!
  const carpetService = allServices.find(s => s.slug === 'carpet-cleaning')!

  // Client 1 requests
  const req1 = await prisma.serviceRequest.create({
    data: {
      userId: client1.id,
      serviceId: standardService.id,
      name: 'John Client',
      email: client1.email,
      phone: '555-0123',
      location: '123 Main St, New York, NY 10001',
      preferredDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      preferredTime: '10:00',
      additionalNotes: 'Please bring eco-friendly cleaning products',
      status: 'PENDING_VERIFICATION',
    },
  })

  const req2 = await prisma.serviceRequest.create({
    data: {
      userId: client1.id,
      serviceId: deepService.id,
      name: 'John Client',
      email: client1.email,
      phone: '555-0123',
      location: '456 Oak Ave, Brooklyn, NY 11201',
      preferredDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      preferredTime: '09:00',
      additionalNotes: 'Deep clean needed before holiday guests arrive',
      status: 'ASSIGNED',
    },
  })

  const req3 = await prisma.serviceRequest.create({
    data: {
      userId: client1.id,
      serviceId: carpetService.id,
      name: 'John Client',
      email: client1.email,
      phone: '555-0123',
      location: '789 Pine Rd, Queens, NY 11354',
      preferredDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      preferredTime: '14:00',
      status: 'COMPLETED',
    },
  })

  // Client 2 requests
  const req4 = await prisma.serviceRequest.create({
    data: {
      userId: client2.id,
      serviceId: officeService.id,
      name: 'Jane Smith',
      email: client2.email,
      phone: '555-0456',
      location: '100 Business Park Dr, Manhattan, NY 10005',
      preferredDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      preferredTime: '18:00',
      additionalNotes: 'Office has 20 desks, 2 conference rooms, and 3 restrooms',
      status: 'VERIFIED',
    },
  })

  const req5 = await prisma.serviceRequest.create({
    data: {
      userId: client2.id,
      serviceId: moveService.id,
      name: 'Jane Smith',
      email: client2.email,
      phone: '555-0456',
      location: '555 New Home Blvd, Brooklyn, NY 11215',
      preferredDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      preferredTime: '08:00',
      status: 'COMPLETED',
    },
  })

  // Client 3 requests
  const req6 = await prisma.serviceRequest.create({
    data: {
      userId: client3.id,
      serviceId: standardService.id,
      name: 'Bob Jones',
      email: client3.email,
      phone: '555-0789',
      location: '200 Park Ave, New York, NY 10017',
      preferredDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      preferredTime: '11:00',
      status: 'PENDING_VERIFICATION',
    },
  })

  console.log('✅ Created 6 service requests')

  // ==================== RECEIPTS ====================
  console.log('\n🧾 Creating receipts...')

  await prisma.receipt.create({
    data: {
      serviceRequestId: req1.id,
      fileUrl: '/uploads/receipts/receipt-1.pdf',
      fileSize: 245000,
      fileName: 'payment-receipt-1.pdf',
      status: 'PENDING',
      uploadedBy: client1.id,
    },
  })

  await prisma.receipt.create({
    data: {
      serviceRequestId: req4.id,
      fileUrl: '/uploads/receipts/receipt-4.pdf',
      fileSize: 312000,
      fileName: 'payment-receipt-4.pdf',
      status: 'PENDING',
      uploadedBy: client2.id,
    },
  })

  const receipt3 = await prisma.receipt.create({
    data: {
      serviceRequestId: req3.id,
      fileUrl: '/uploads/receipts/receipt-3.pdf',
      fileSize: 189000,
      fileName: 'payment-receipt-3.pdf',
      status: 'APPROVED',
      uploadedBy: client1.id,
      reviewedBy: admin.id,
      reviewedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  })

  const receipt5 = await prisma.receipt.create({
    data: {
      serviceRequestId: req5.id,
      fileUrl: '/uploads/receipts/receipt-5.pdf',
      fileSize: 278000,
      fileName: 'payment-receipt-5.pdf',
      status: 'APPROVED',
      uploadedBy: client2.id,
      reviewedBy: admin.id,
      reviewedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    },
  })

  console.log('✅ Created 4 receipts (2 pending, 2 approved)')

  // ==================== SERVICE ASSIGNMENTS ====================
  console.log('\n📌 Creating service assignments...')

  const assign1 = await prisma.serviceAssignment.create({
    data: {
      serviceRequestId: req2.id,
      vendorId: vendor1.id,
      status: 'IN_PROGRESS',
      vendorNotes: 'Client requested eco-friendly products. Scheduling for next week.',
      startedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
  })

  await prisma.serviceAssignment.create({
    data: {
      serviceRequestId: req3.id,
      vendorId: vendor1.id,
      status: 'COMPLETED',
      vendorNotes: 'Carpet cleaning completed. All stains removed successfully.',
      startedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
  })

  await prisma.serviceAssignment.create({
    data: {
      serviceRequestId: req5.id,
      vendorId: vendor2.id,
      status: 'COMPLETED',
      vendorNotes: 'Move-out cleaning done. All rooms thoroughly cleaned.',
      startedAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    },
  })

  const assign4 = await prisma.serviceAssignment.create({
    data: {
      serviceRequestId: req4.id,
      vendorId: vendor1.id,
      status: 'ASSIGNED',
      vendorNotes: 'Office cleaning scheduled for after business hours.',
    },
  })

  console.log('✅ Created 4 service assignments')

  // ==================== TICKETS ====================
  console.log('\n🎫 Creating support tickets...')

  await prisma.ticket.create({
    data: {
      userId: client1.id,
      subject: 'Carpet stain not fully removed',
      category: 'SERVICE_ISSUE',
      description: 'After the carpet cleaning service, there is still a visible stain in the living room area.',
      status: 'OPEN',
      priority: 'NORMAL',
      relatedEntityType: 'ASSIGNMENT',
      relatedEntityId: assign1.id,
    },
  })

  await prisma.ticket.create({
    data: {
      userId: client2.id,
      subject: 'Need to reschedule office cleaning',
      category: 'OTHER',
      description: 'Our office will be closed on the scheduled date. Can we reschedule to next week?',
      status: 'IN_REVIEW',
      priority: 'HIGH',
    },
  })

  await prisma.ticket.create({
    data: {
      userId: client3.id,
      subject: 'Payment receipt not uploading',
      category: 'TECHNICAL',
      description: 'I am trying to upload my payment receipt but the upload keeps failing.',
      status: 'OPEN',
      priority: 'URGENT',
    },
  })

  console.log('✅ Created 3 support tickets')

  // ==================== NOTIFICATIONS ====================
  console.log('\n🔔 Creating notifications...')

  await prisma.notification.createMany({
    data: [
      {
        userId: client1.id,
        title: 'Service Assigned',
        message: 'Your deep cleaning service has been assigned to Clean Pro Services LLC.',
        type: 'SUCCESS',
        isRead: false,
        relatedEntityType: 'SERVICE_REQUEST',
        relatedEntityId: req2.id,
      },
      {
        userId: client1.id,
        title: 'Carpet Cleaning Completed',
        message: 'Your carpet cleaning service has been marked as completed.',
        type: 'INFO',
        isRead: true,
        relatedEntityType: 'SERVICE_REQUEST',
        relatedEntityId: req3.id,
      },
      {
        userId: client2.id,
        title: 'Office Cleaning Assigned',
        message: 'Your office cleaning has been assigned and will be scheduled soon.',
        type: 'SUCCESS',
        isRead: false,
        relatedEntityType: 'SERVICE_REQUEST',
        relatedEntityId: req4.id,
      },
      {
        userId: vendor1.id,
        title: 'New Assignment',
        message: 'You have been assigned a new deep cleaning service at 456 Oak Ave, Brooklyn.',
        type: 'INFO',
        isRead: false,
        relatedEntityType: 'ASSIGNMENT',
        relatedEntityId: assign1.id,
      },
      {
        userId: vendor1.id,
        title: 'Payment Verified',
        message: 'The payment receipt for carpet cleaning has been approved.',
        type: 'SUCCESS',
        isRead: true,
        relatedEntityType: 'RECEIPT',
        relatedEntityId: receipt3.id,
      },
      {
        userId: admin.id,
        title: 'New Vendor Application',
        message: 'A new vendor application has been submitted and needs review.',
        type: 'WARNING',
        isRead: false,
      },
    ],
  })

  console.log('✅ Created 6 notifications')

  // ==================== VENDOR APPLICATIONS ====================
  console.log('\n📝 Creating vendor applications...')

  await prisma.vendorApplication.create({
    data: {
      userId: (await prisma.user.create({
        data: {
          email: 'newvendor@email.com',
          password: vendorPassword,
          name: 'Fresh Clean Solutions',
          role: 'VENDOR',
        },
      })).id,
      contactName: 'Mike Wilson',
      email: 'newvendor@email.com',
      phone: '555-0999',
      address: '300 Startup Blvd, Brooklyn, NY 11220',
      businessName: 'Fresh Clean Solutions',
      businessType: 'LLC',
      serviceLocations: JSON.stringify(['Brooklyn', 'Staten Island']),
      servicesOffered: JSON.stringify(['residential', 'deepCleaning']),
      experience: '3 years',
      availability: JSON.stringify({ weekdays: '8AM-6PM', weekends: '10AM-4PM' }),
      status: 'PENDING',
    },
  })

  console.log('✅ Created 1 vendor application')

  // ==================== VENDOR CONTRACTS ====================
  console.log('\n📄 Creating vendor contracts...')

  await prisma.vendorContract.create({
    data: {
      vendorId: vendor1.id,
      contractUrl: '/uploads/contracts/clean-pro-2024.pdf',
      fileSize: 524000,
      fileName: 'clean-pro-service-agreement-2024.pdf',
      version: 1,
      isActive: true,
      uploadedBy: admin.id,
    },
  })

  await prisma.vendorContract.create({
    data: {
      vendorId: vendor2.id,
      contractUrl: '/uploads/contracts/sparkle-clean-2024.pdf',
      fileSize: 489000,
      fileName: 'sparkle-clean-service-agreement-2024.pdf',
      version: 1,
      isActive: true,
      uploadedBy: admin.id,
    },
  })

  console.log('✅ Created 2 vendor contracts')

  // ==================== CONTRACT TEMPLATES ====================
  console.log('\n📜 Creating contract templates...')

  await prisma.contractTemplate.createMany({
    data: [
      {
        title: 'Standard Service Agreement',
        fileUrl: '/uploads/templates/standard-agreement.pdf',
        fileName: 'standard-service-agreement.pdf',
        fileSize: 1024000,
        description: 'Default contract for all new residential and commercial cleaning partners.',
        uploadedBy: admin.id,
      },
      {
        title: 'Independent Contractor Policy',
        fileUrl: '/uploads/templates/contractor-policy.pdf',
        fileName: 'contractor-policy.pdf',
        fileSize: 512000,
        description: 'Mandatory safety and conduct guidelines for independent vendors.',
        uploadedBy: admin.id,
      },
    ],
  })

  console.log('✅ Created 2 contract templates')

  // ==================== AUDIT LOGS ====================
  console.log('\n📊 Creating audit logs...')

  await prisma.auditLog.createMany({
    data: [
      {
        action: 'CREATE',
        entityType: 'SERVICE',
        entityId: standardService.id,
        userId: admin.id,
        userName: 'Sarah Admin',
        userEmail: admin.email,
        userRole: 'ADMIN',
        details: 'Created service: Standard Home Cleaning',
      },
      {
        action: 'UPDATE',
        entityType: 'RECEIPT',
        entityId: receipt3.id,
        userId: admin.id,
        userName: 'Sarah Admin',
        userEmail: admin.email,
        userRole: 'ADMIN',
        details: 'Approved receipt for service request',
      },
      {
        action: 'ASSIGN',
        entityType: 'ASSIGNMENT',
        entityId: assign1.id,
        userId: admin.id,
        userName: 'Sarah Admin',
        userEmail: admin.email,
        userRole: 'ADMIN',
        details: 'Assigned deep cleaning to Clean Pro Services',
      },
      {
        action: 'APPROVE',
        entityType: 'VENDOR_PROFILE',
        entityId: vendor1.id,
        userId: admin.id,
        userName: 'Sarah Admin',
        userEmail: admin.email,
        userRole: 'ADMIN',
        details: 'Approved vendor profile for Clean Pro Services LLC',
      },
    ],
  })

  console.log('✅ Created 4 audit logs')

  // ==================== SYSTEM SETTINGS ====================
  console.log('\n⚙️ Creating system settings...')

  await prisma.systemSettings.createMany({
    data: [
      {
        key: 'maxUploadFileSize',
        value: '10485760',
        description: 'Maximum file size for receipt uploads (10MB)',
        category: 'upload',
      },
      {
        key: 'maxContractFileSize',
        value: '52428800',
        description: 'Maximum file size for contract uploads (50MB)',
        category: 'upload',
      },
    ],
  })

  console.log('✅ Created system settings')

  // ==================== SUMMARY ====================
  console.log('\n' + '='.repeat(50))
  console.log('🌱 DATABASE SEED COMPLETED SUCCESSFULLY!')
  console.log('='.repeat(50))
  console.log('\n📊 Summary:')
  console.log('   👥 Users:           6 (1 admin, 3 clients, 2 vendors)')
  console.log('   🏢 Vendor Profiles: 2')
  console.log('   📂 Categories:      3')
  console.log('   🧹 Services:        9')
  console.log('   📋 Service Requests:6')
  console.log('   🧾 Receipts:        4')
  console.log('   📌 Assignments:     4')
  console.log('   🎫 Tickets:         3')
  console.log('   🔔 Notifications:   6')
  console.log('   📝 Applications:    1')
  console.log('   📄 Contracts:       2')
  console.log('   📊 Audit Logs:      4')
  console.log('\n🔐 Login Credentials:')
  console.log('   Admin:  admin@ggc.com / admin123')
  console.log('   Client: client@ggc.com / client123')
  console.log('   Vendor: vendor@ggc.com / vendor123')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
