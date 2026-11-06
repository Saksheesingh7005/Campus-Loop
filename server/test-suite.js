// Automated Integration Test Suite for Campus Resource Sharing
// Verifies APIs, Borrowing Life Cycle, Validation, and Calculations

const API_BASE = 'http://localhost:5000/api';

async function runTests() {
  console.log('--- Starting Campus Resource Sharing Test Suite ---');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${message}`);
      failed++;
    }
  }

  try {
    // 1. Health check
    const healthRes = await fetch(`${API_BASE}/health`).then(r => r.json());
    assert(healthRes.status === 'ok', 'Backend API health check responds with ok');

    // 2. Demo Login - Student
    const loginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'aarav@campus.edu', password: 'password123' })
    });
    const loginData = await loginRes.json();
    assert(loginRes.ok && loginData.user.id === 'usr_1', 'Demo student login succeeds');

    // 3. Demo Login - Admin
    const adminLoginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@campus.edu', password: 'adminpassword' })
    });
    const adminData = await adminLoginRes.json();
    assert(adminLoginRes.ok && adminData.user.role === 'admin', 'Demo admin login succeeds');

    // 4. Invalid Login Validation
    const badLoginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'aarav@campus.edu', password: 'wrongpassword' })
    });
    assert(badLoginRes.status === 401, 'Invalid password rejected with 401');

    // 5. Explore Resources & Filters
    const allRes = await fetch(`${API_BASE}/resources`).then(r => r.json());
    assert(allRes.resources.length >= 16, `Seed resources loaded (found ${allRes.resources.length})`);

    // Search filter
    const searchRes = await fetch(`${API_BASE}/resources?search=Casio`).then(r => r.json());
    assert(searchRes.resources.some(r => r.name.includes('Casio')), 'Search filter finds Casio calculator');

    // Category filter
    const catRes = await fetch(`${API_BASE}/resources?category=Books and Notes`).then(r => r.json());
    assert(catRes.resources.every(r => r.category === 'Books and Notes'), 'Category filter correctly isolates Books & Notes');

    // Free filter
    const freeRes = await fetch(`${API_BASE}/resources?availability=Free`).then(r => r.json());
    assert(freeRes.resources.every(r => r.dailyPrice === 0), 'Free availability filter isolates items with dailyPrice 0');

    // 6. Listing a Resource
    const newListingRes = await fetch(`${API_BASE}/resources`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': 'usr_1'
      },
      body: JSON.stringify({
        name: 'Automated Test Drafter Unit',
        category: 'Stationery',
        condition: 'Like New',
        dailyPrice: 25,
        location: 'Drawing Hall B',
        description: 'Test instrument for architectural graphics.',
        terms: 'Return with scales intact.'
      })
    });
    const newListingData = await newListingRes.json();
    assert(newListingRes.status === 201 && newListingData.resource.id, 'Student can list a new resource');
    const createdId = newListingData.resource.id;

    // 7. Verify Marketplace Updates
    const verifyList = await fetch(`${API_BASE}/resources?search=Automated Test Drafter`).then(r => r.json());
    assert(verifyList.resources.some(r => r.id === createdId), 'New listing appears immediately in marketplace search');

    // 8. Borrow Request Lifecycle & INR Calculation
    // Vikram (usr_3) requests the new listing created by Aarav (usr_1) for 4 days at ₹25/day = ₹100
    const reqCreateRes = await fetch(`${API_BASE}/requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': 'usr_3'
      },
      body: JSON.stringify({
        resourceId: createdId,
        days: 4,
        startDate: '2026-10-25',
        notes: 'Machine drawing tutorial sessions'
      })
    });
    const reqCreateData = await reqCreateRes.json();
    assert(reqCreateRes.status === 201, 'Borrow request created in pending state');
    assert(reqCreateData.request.totalCost === 100, `INR calculation verified: 4 days * ₹25 = ₹${reqCreateData.request.totalCost} (expected ₹100)`);
    const reqId = reqCreateData.request.id;

    // 9. Prevent Duplicate Active Request
    const dupRes = await fetch(`${API_BASE}/requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': 'usr_3'
      },
      body: JSON.stringify({
        resourceId: createdId,
        days: 2
      })
    });
    assert(dupRes.status === 400, 'Duplicate active borrow request correctly rejected with 400');

    // 10. Status Transitions: Pending -> Approved (by Owner usr_1)
    const approveRes = await fetch(`${API_BASE}/requests/${reqId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': 'usr_1'
      },
      body: JSON.stringify({ status: 'approved' })
    });
    const approveData = await approveRes.json();
    assert(approveRes.ok && approveData.request.status === 'approved', 'Owner successfully approves pending request');

    // 11. Status Transition: Approved -> Borrowed (Handover)
    const borrowRes = await fetch(`${API_BASE}/requests/${reqId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': 'usr_3'
      },
      body: JSON.stringify({ status: 'borrowed' })
    });
    const borrowData = await borrowRes.json();
    assert(borrowRes.ok && borrowData.request.status === 'borrowed', 'Handover transitions status to borrowed');

    // 12. Unavailable resources cannot be borrowed
    // Now the resource is borrowed, another student (usr_4) attempts to request it:
    const blockedRes = await fetch(`${API_BASE}/requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': 'usr_4'
      },
      body: JSON.stringify({
        resourceId: createdId,
        days: 3
      })
    });
    assert(blockedRes.status === 400, 'Attempt to borrow unavailable/borrowed item blocked with 400');

    // 13. Status Transition: Borrowed -> Returned
    const returnRes = await fetch(`${API_BASE}/requests/${reqId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': 'usr_3'
      },
      body: JSON.stringify({ status: 'returned' })
    });
    const returnData = await returnRes.json();
    assert(returnRes.ok && returnData.request.status === 'returned', 'Returning item transitions status to returned');
    assert(returnData.resource.availability === 'Available', 'Resource availability automatically resets to Available after return');

    // 14. Clean up test listing
    const delRes = await fetch(`${API_BASE}/resources/${createdId}`, {
      method: 'DELETE',
      headers: { 'x-user-id': 'usr_1' }
    });
    assert(delRes.ok, 'Resource listing removed after test');

    // 15. Stats endpoint verification
    const statsRes = await fetch(`${API_BASE}/stats`).then(r => r.json());
    assert(statsRes.stats.totalResources >= 16, 'Stats totalResources count verified');
    assert(statsRes.stats.registeredStudents >= 4, 'Stats registeredStudents count verified');

    console.log(`\n--- Test Suite Complete: ${passed} Passed, ${failed} Failed ---`);
    if (failed > 0) process.exit(1);
  } catch (e) {
    console.error('Test suite error:', e);
    process.exit(1);
  }
}

runTests();
