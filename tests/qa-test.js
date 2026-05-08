/**
 * QA Testing Script for Global Green Services
 * Run with: node tests/qa-test.js
 * 
 * Tests all major API endpoints and form submissions
 */

const API_BASE = 'http://localhost:3000/api'

// Test results storage
const results = {
  passed: [],
  failed: [],
}

function log(message, type = 'info') {
  const colors = {
    info: '\x1b[36m',
    success: '\x1b[32m',
    error: '\x1b[31m',
    warning: '\x1b[33m',
  }
  console.log(`${colors[type] || ''}${message}\x1b[0m`)
}

async function testEndpoint(name, method, path, body = null, expectedStatus = 200) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    }
    
    if (body) {
      options.body = JSON.stringify(body)
    }
    
    const response = await fetch(`${API_BASE}${path}`, options)
    const data = await response.json().catch(() => ({}))
    
    if (response.status === expectedStatus || (expectedStatus === 200 && response.ok)) {
      results.passed.push(name)
      log(`✅ PASS: ${name}`, 'success')
      return { success: true, data, status: response.status }
    } else {
      results.failed.push({ name, status: response.status, error: data.error || 'Unknown error' })
      log(`❌ FAIL: ${name} (${response.status}) - ${data.error || 'Unknown error'}`, 'error')
      return { success: false, data, status: response.status }
    }
  } catch (error) {
    results.failed.push({ name, error: error.message })
    log(`❌ ERROR: ${name} - ${error.message}`, 'error')
    return { success: false, error: error.message }
  }
}

async function runTests() {
  console.log('\n🧪 Global Green Services - QA Test Suite\n')
  console.log('='.repeat(50))
  
  // Test 1: Services API
  log('\n📋 Testing Services API...', 'info')
  await testEndpoint('GET /api/services', 'GET', '/services')
  
  // Test 2: Contact Form API
  log('\n📧 Testing Contact Form API...', 'info')
  await testEndpoint('POST /api/contact', 'POST', '/contact', {
    name: 'Test User',
    email: 'test@example.com',
    subject: 'Test Subject',
    message: 'This is a test message from the QA script.',
  })
  
  // Test 3: User Registration
  log('\n👤 Testing User Registration...', 'info')
  const timestamp = Date.now()
  const testEmail = `testuser${timestamp}@example.com`
  const regResult = await testEndpoint('POST /api/auth/register', 'POST', '/auth/register', {
    name: 'Test User',
    email: testEmail,
    password: 'TestPassword123!',
    phone: '+1234567890',
  }, 200)
  
  // Test 4: Custom Service Request
  log('\n🔧 Testing Custom Service Request API...', 'info')
  await testEndpoint('POST /api/custom-service-requests', 'POST', '/custom-service-requests', {
    name: 'Custom Test User',
    email: 'customtest@example.com',
    phone: '+1234567890',
    description: 'Test custom cleaning service request',
    location: '123 Test Street, Test City, TS 12345',
    preferredDate: '2026-06-15',
    preferredTime: '10:00',
    budget: '$200 - $400',
  })
  
  // Test 5: Admin Services API
  log('\n⚙️ Testing Admin Services API...', 'info')
  await testEndpoint('GET /api/admin/services', 'GET', '/admin/services')
  
  // Test 6: Admin Categories API
  log('\n📁 Testing Admin Categories API...', 'info')
  await testEndpoint('GET /api/admin/service-categories', 'GET', '/admin/service-categories')
  
  // Test 7: Admin Stats API
  log('\n📊 Testing Admin Stats API...', 'info')
  await testEndpoint('GET /api/admin/stats', 'GET', '/admin/stats')
  
  // Print summary
  log('\n' + '='.repeat(50), 'info')
  log('\n📊 Test Results Summary', 'info')
  log(`✅ Passed: ${results.passed.length}`, 'success')
  log(`❌ Failed: ${results.failed.length}`, results.failed.length > 0 ? 'error' : 'success')
  
  if (results.failed.length > 0) {
    log('\n❌ Failed Tests:', 'error')
    results.failed.forEach(f => {
      log(`   - ${f.name}: ${f.error || `HTTP ${f.status}`}`, 'error')
    })
  }
  
  log('\n' + '='.repeat(50), 'info')
  
  // Exit with appropriate code
  process.exit(results.failed.length > 0 ? 1 : 0)
}

runTests().catch(console.error)
