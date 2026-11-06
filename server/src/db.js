import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
const DB_PATH = path.join(DATA_DIR, 'db.json');
const SEED_PATH = path.join(DATA_DIR, 'seed.json');

// Memory cache
let dbState = {
  users: [],
  resources: [],
  requests: []
};

// Initialize DB from disk or seed
export function initDB() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_PATH)) {
      const raw = fs.readFileSync(DB_PATH, 'utf-8');
      dbState = JSON.parse(raw);
    } else if (fs.existsSync(SEED_PATH)) {
      const raw = fs.readFileSync(SEED_PATH, 'utf-8');
      dbState = JSON.parse(raw);
      persistDB();
    }
  } catch (err) {
    console.warn('[DB] Warning loading db.json, falling back to seed:', err.message);
    if (fs.existsSync(SEED_PATH)) {
      const raw = fs.readFileSync(SEED_PATH, 'utf-8');
      dbState = JSON.parse(raw);
    }
  }
}

export function persistDB() {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(dbState, null, 2), 'utf-8');
  } catch (err) {
    console.error('[DB] Error persisting to db.json:', err.message);
  }
}

export function resetToSeed() {
  if (fs.existsSync(SEED_PATH)) {
    const raw = fs.readFileSync(SEED_PATH, 'utf-8');
    dbState = JSON.parse(raw);
    persistDB();
    return true;
  }
  return false;
}

// User Operations
export function getUsers() {
  return dbState.users.map(({ password, ...u }) => u);
}

export function getUserByEmail(email) {
  return dbState.users.find(u => u.email.toLowerCase() === email.toLowerCase());
}

export function getUserById(id) {
  const user = dbState.users.find(u => u.id === id);
  if (!user) return null;
  const { password, ...safeUser } = user;
  return safeUser;
}

export function createUser({ name, email, password, department, year, role = 'student' }) {
  const existing = getUserByEmail(email);
  if (existing) {
    throw new Error('A user with this college email already exists.');
  }

  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(p => p[0].toUpperCase())
    .join('') || 'ST';

  const newUser = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    name,
    email: email.toLowerCase(),
    password, // Demo prototype authentication only
    department: department || 'General Engineering',
    year: year || '1st Year',
    avatar: initials,
    role: role || 'student',
    createdAt: new Date().toISOString()
  };

  dbState.users.push(newUser);
  persistDB();

  const { password: _, ...safeUser } = newUser;
  return safeUser;
}

// Resource Operations
export function getResources(query = {}) {
  let list = [...dbState.resources];

  // Search filter (keyword in name, description, ownerName, location)
  if (query.search && query.search.trim()) {
    const q = query.search.trim().toLowerCase();
    list = list.filter(r =>
      r.name.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      r.category.toLowerCase().includes(q) ||
      (r.ownerName && r.ownerName.toLowerCase().includes(q)) ||
      (r.location && r.location.toLowerCase().includes(q))
    );
  }

  // Category filter
  if (query.category && query.category !== 'All') {
    list = list.filter(r => r.category.toLowerCase() === query.category.toLowerCase());
  }

  // Availability filter
  if (query.availability) {
    if (query.availability === 'Available') {
      list = list.filter(r => r.availability === 'Available');
    } else if (query.availability === 'Free') {
      list = list.filter(r => Number(r.dailyPrice) === 0);
    } else if (query.availability !== 'All') {
      list = list.filter(r => r.availability.toLowerCase() === query.availability.toLowerCase());
    }
  }

  // Owner filter
  if (query.ownerId) {
    list = list.filter(r => r.ownerId === query.ownerId);
  }

  // Sorting
  if (query.sort) {
    if (query.sort === 'price_asc') {
      list.sort((a, b) => Number(a.dailyPrice) - Number(b.dailyPrice));
    } else if (query.sort === 'price_desc') {
      list.sort((a, b) => Number(b.dailyPrice) - Number(a.dailyPrice));
    } else if (query.sort === 'name') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      // newest
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  } else {
    // Default newest
    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  return list;
}

export function getResourceById(id) {
  return dbState.resources.find(r => r.id === id) || null;
}

export function createResource(data, owner) {
  if (!data.name || !data.category) {
    throw new Error('Resource name and category are required.');
  }

  const price = Number(data.dailyPrice) || 0;
  if (price < 0) {
    throw new Error('Daily rental price cannot be negative.');
  }

  const newResource = {
    id: `res_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    name: data.name.trim(),
    category: data.category,
    condition: data.condition || 'Good',
    dailyPrice: price,
    ownerId: owner.id,
    ownerName: owner.name,
    ownerDept: owner.department || 'Campus Student',
    location: data.location || 'Campus Library / Student Center',
    availability: 'Available',
    description: data.description || 'No description provided.',
    terms: data.terms || 'Handle with reasonable care. Return in original condition on time.',
    itemType: data.itemType || 'default',
    createdAt: new Date().toISOString()
  };

  dbState.resources.unshift(newResource);
  persistDB();
  return newResource;
}

export function updateResource(id, data, actor) {
  const resource = dbState.resources.find(r => r.id === id);
  if (!resource) {
    throw new Error('Resource not found.');
  }

  // Only owner or admin can edit
  if (actor.role !== 'admin' && resource.ownerId !== actor.id) {
    throw new Error('You do not have permission to edit this listing.');
  }

  // Check if resource has an active approved or borrowed request
  const hasActiveBorrow = dbState.requests.some(
    req => req.resourceId === id && (req.status === 'borrowed' || req.status === 'approved')
  );

  if (hasActiveBorrow && data.availability && data.availability !== resource.availability) {
    throw new Error('Cannot change availability while an approved or borrowed request is active.');
  }

  if (data.name !== undefined) resource.name = data.name.trim();
  if (data.category !== undefined) resource.category = data.category;
  if (data.condition !== undefined) resource.condition = data.condition;
  if (data.dailyPrice !== undefined) resource.dailyPrice = Math.max(0, Number(data.dailyPrice) || 0);
  if (data.location !== undefined) resource.location = data.location;
  if (data.description !== undefined) resource.description = data.description;
  if (data.terms !== undefined) resource.terms = data.terms;
  if (data.itemType !== undefined) resource.itemType = data.itemType;
  if (data.availability !== undefined) resource.availability = data.availability;
  resource.updatedAt = new Date().toISOString();

  persistDB();
  return resource;
}

export function deleteResource(id, actor) {
  const index = dbState.resources.findIndex(r => r.id === id);
  if (index === -1) {
    throw new Error('Resource not found.');
  }

  const resource = dbState.resources[index];
  if (actor.role !== 'admin' && resource.ownerId !== actor.id) {
    throw new Error('You do not have permission to delete this listing.');
  }

  // Check active requests
  const hasActive = dbState.requests.some(
    req => req.resourceId === id && (req.status === 'borrowed' || req.status === 'approved')
  );
  if (hasActive) {
    throw new Error('Cannot delete a resource with an active borrow or approved request.');
  }

  dbState.resources.splice(index, 1);
  persistDB();
  return { success: true, message: 'Resource listing removed successfully.' };
}

// Request Operations
export function getRequests(query = {}, actor = null) {
  let list = [...dbState.requests];

  if (query.borrowerId) {
    list = list.filter(r => r.borrowerId === query.borrowerId);
  }
  if (query.ownerId) {
    list = list.filter(r => r.ownerId === query.ownerId);
  }
  if (query.resourceId) {
    list = list.filter(r => r.resourceId === query.resourceId);
  }
  if (query.status && query.status !== 'All') {
    list = list.filter(r => r.status.toLowerCase() === query.status.toLowerCase());
  }

  // Sort newest first
  list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return list;
}

export function getRequestById(id) {
  return dbState.requests.find(r => r.id === id) || null;
}

export function createRequest({ resourceId, days, startDate, notes }, borrower) {
  const resource = dbState.resources.find(r => r.id === resourceId);
  if (!resource) {
    throw new Error('Resource not found.');
  }

  if (resource.availability !== 'Available') {
    throw new Error(`This resource is currently ${resource.availability.toLowerCase()} and cannot be borrowed.`);
  }

  if (resource.ownerId === borrower.id) {
    throw new Error('You cannot submit a borrow request for your own listed item.');
  }

  // Check if borrower already has an active request for this item
  const existingActive = dbState.requests.find(
    req => req.resourceId === resourceId &&
           req.borrowerId === borrower.id &&
           ['pending', 'approved', 'borrowed'].includes(req.status)
  );

  if (existingActive) {
    throw new Error(`You already have an active request for this item with status: "${existingActive.status}".`);
  }

  const duration = Math.max(1, parseInt(days, 10) || 1);
  const totalCost = Number(resource.dailyPrice) * duration;

  const newRequest = {
    id: `req_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    resourceId: resource.id,
    resourceName: resource.name,
    resourceCategory: resource.category,
    borrowerId: borrower.id,
    borrowerName: borrower.name,
    borrowerDept: borrower.department,
    ownerId: resource.ownerId,
    ownerName: resource.ownerName,
    status: 'pending', // available -> pending
    days: duration,
    dailyPrice: resource.dailyPrice,
    totalCost,
    requestDate: new Date().toISOString().split('T')[0],
    startDate: startDate || new Date().toISOString().split('T')[0],
    pickupLocation: resource.location,
    notes: notes ? notes.trim() : 'No notes provided.',
    messages: notes && notes.trim() ? [
      {
        id: `msg_${Date.now()}_initial`,
        senderId: borrower.id,
        senderName: borrower.name,
        text: `Request Note: ${notes.trim()}`,
        timestamp: new Date().toISOString()
      }
    ] : [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  dbState.requests.unshift(newRequest);
  persistDB();
  return newRequest;
}

/**
 * Request Status Transitions:
 * - pending -> approved (by owner or admin)
 * - pending -> rejected (by owner or admin)
 * - pending -> cancelled (by borrower or admin)
 * - approved -> borrowed (by borrower, owner, or admin)
 * - approved -> cancelled (by borrower, owner, or admin) -> resets resource to Available
 * - borrowed -> returned (by borrower, owner, or admin) -> resets resource to Available
 */
export function updateRequestStatus(requestId, targetStatus, actor) {
  const request = dbState.requests.find(r => r.id === requestId);
  if (!request) {
    throw new Error('Borrow request not found.');
  }

  const resource = dbState.resources.find(r => r.id === request.resourceId);
  const currentStatus = request.status;
  const newStatus = targetStatus.toLowerCase();
  const isAdmin = actor.role === 'admin';
  const isOwner = request.ownerId === actor.id;
  const isBorrower = request.borrowerId === actor.id;

  // Validation of actor rights & allowed transitions
  if (currentStatus === 'pending') {
    if (newStatus === 'approved') {
      if (!isOwner && !isAdmin) {
        throw new Error('Only the resource owner or an administrator can approve this request.');
      }
      request.status = 'approved';
      if (resource) {
        resource.availability = 'Reserved (Approved)';
      }
    } else if (newStatus === 'rejected') {
      if (!isOwner && !isAdmin) {
        throw new Error('Only the resource owner or an administrator can reject this request.');
      }
      request.status = 'rejected';
      // Resource remains or reverts to available if no other active
      if (resource && resource.availability === 'Reserved (Approved)') {
        resource.availability = 'Available';
      }
    } else if (newStatus === 'cancelled') {
      if (!isBorrower && !isAdmin) {
        throw new Error('Only the borrower or an administrator can cancel this request.');
      }
      request.status = 'cancelled';
    } else {
      throw new Error(`Cannot transition request from "${currentStatus}" to "${newStatus}". Allowed: approved, rejected, cancelled.`);
    }
  } else if (currentStatus === 'approved') {
    if (newStatus === 'borrowed') {
      // Can be picked up / borrowed
      if (!isBorrower && !isOwner && !isAdmin) {
        throw new Error('Only the borrower, lender, or an administrator can confirm item handover.');
      }
      request.status = 'borrowed';
      if (resource) {
        resource.availability = 'Borrowed';
      }
    } else if (newStatus === 'cancelled') {
      if (!isBorrower && !isOwner && !isAdmin) {
        throw new Error('Only the borrower, lender, or an administrator can cancel this approved request.');
      }
      request.status = 'cancelled';
      if (resource) {
        resource.availability = 'Available';
      }
    } else {
      throw new Error(`Cannot transition request from "${currentStatus}" to "${newStatus}". Allowed: borrowed, cancelled.`);
    }
  } else if (currentStatus === 'borrowed') {
    if (newStatus === 'returned') {
      if (!isBorrower && !isOwner && !isAdmin) {
        throw new Error('Only the borrower, lender, or an administrator can mark an item as returned.');
      }
      request.status = 'returned';
      request.returnedDate = new Date().toISOString().split('T')[0];
      if (resource) {
        resource.availability = 'Available';
      }
    } else {
      throw new Error(`Cannot transition request from "${currentStatus}" to "${newStatus}". Allowed: returned.`);
    }
  } else if (currentStatus === 'returned' || currentStatus === 'rejected' || currentStatus === 'cancelled') {
    throw new Error(`This request is already finalized as "${currentStatus}" and cannot be changed.`);
  } else {
    throw new Error(`Unknown state transition for status: ${currentStatus}`);
  }

  request.updatedAt = new Date().toISOString();
  persistDB();

  return { request, resource };
}

// Request Messaging Operations (Campus Handover & Coordination Chat)
export function getRequestMessages(requestId, actor) {
  const request = dbState.requests.find(r => r.id === requestId);
  if (!request) {
    throw new Error('Borrow request not found.');
  }

  // Only borrower, lender, or admin can access chat
  if (actor.role !== 'admin' && request.borrowerId !== actor.id && request.ownerId !== actor.id) {
    throw new Error('You do not have permission to view the coordination messages for this request.');
  }

  return request.messages || [];
}

export function addRequestMessage(requestId, { text }, actor) {
  const request = dbState.requests.find(r => r.id === requestId);
  if (!request) {
    throw new Error('Borrow request not found.');
  }

  if (actor.role !== 'admin' && request.borrowerId !== actor.id && request.ownerId !== actor.id) {
    throw new Error('You do not have permission to send messages on this request.');
  }

  if (!text || !text.trim()) {
    throw new Error('Message text cannot be empty.');
  }

  if (!request.messages) {
    request.messages = [];
  }

  const newMessage = {
    id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    senderId: actor.id,
    senderName: actor.name,
    senderRole: actor.id === request.ownerId ? 'Lender' : actor.id === request.borrowerId ? 'Borrower' : 'Admin',
    text: text.trim(),
    timestamp: new Date().toISOString()
  };

  request.messages.push(newMessage);
  request.updatedAt = new Date().toISOString();
  persistDB();

  return { message: newMessage, allMessages: request.messages };
}

// Stats & Metrics
export function getStats() {
  const totalResources = dbState.resources.length;
  const availableResources = dbState.resources.filter(r => r.availability === 'Available').length;
  const totalRequests = dbState.requests.length;
  const activeRequests = dbState.requests.filter(r => ['pending', 'approved', 'borrowed'].includes(r.status)).length;
  const completedBorrows = dbState.requests.filter(r => r.status === 'returned').length;
  const registeredStudents = dbState.users.filter(u => u.role === 'student').length;

  // Calculate estimated total money saved by campus community (calculated from all active & completed requests)
  const totalSavedINR = dbState.requests
    .filter(r => ['approved', 'borrowed', 'returned'].includes(r.status))
    .reduce((acc, curr) => acc + (Number(curr.totalCost) || 0), 0);

  // Category counts
  const categoryCounts = {};
  dbState.resources.forEach(r => {
    categoryCounts[r.category] = (categoryCounts[r.category] || 0) + 1;
  });

  return {
    totalResources,
    availableResources,
    totalRequests,
    activeRequests,
    completedBorrows,
    registeredStudents,
    totalSavedINR,
    categoryCounts
  };
}
