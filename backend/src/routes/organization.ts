import { Hono } from 'hono'
import type { Context, Next } from 'hono'
import { auth } from '../lib/auth.js'
import type { Session } from '../lib/auth.js'
import { rateLimit, rateLimitPresets } from '../middleware/rateLimit.js'
import {
  createOrganization,
  addUserToOrganization,
  removeUserFromOrganization,
  updateUserRole,
  getUserOrganizations,
  getOrganizationMembers,
  getOrganizationBySlug,
  getOrganizationById,
  updateOrganization,
  deleteOrganization,
  hasOrganizationRole,
} from '../lib/organization.js'

type Variables = {
  user: Session['user']
  session: Session
}

const organizationRouter = new Hono<{ Variables: Variables }>()

// Middleware to verify session with Better Auth or NextAuth headers
const requireAuth = async (c: Context<{ Variables: Variables }>, next: Next): Promise<Response | void> => {
  try {
    // First, try to get session from Better Auth
    let session = null
    try {
      session = await auth.api.getSession({ headers: c.req.raw.headers })
    } catch (e) {
      // Better Auth session not found, try NextAuth headers
    }
    
    // If Better Auth session exists, use it
    if (session?.user) {
      c.set('user', session.user)
      c.set('session', session)
      await next()
      return
    }

    // Otherwise, check for NextAuth proxy headers
    const userId = c.req.header('X-User-Id')
    const userEmail = c.req.header('X-User-Email')
    
    if (userId && userEmail) {
      // Create a minimal user object from the headers
      const proxyUser = {
        id: userId,
        email: userEmail,
        name: userEmail.split('@')[0],
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        image: null,
      } as Session['user']
      
      c.set('user', proxyUser)
      await next()
      return
    }

    // No valid authentication found
    return c.json({ error: 'Unauthorized - Please login' }, 401)
  } catch (error) {
    console.error('Auth error:', error)
    return c.json({ error: 'Unauthorized - Invalid session' }, 401)
  }
}

// Create a new organization - Rate limited to prevent abuse
organizationRouter.post(
  '/',
  requireAuth,
  rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10, // Max 10 organizations per hour
    keyGenerator: (c) => {
      const user = c.get('user')
      return `create-org:${user?.id || 'anonymous'}`
    },
  }),
  async (c) => {
  try {
    const user = c.get('user')
    const { name, slug, description, logo } = await c.req.json()

    if (!name || !slug) {
      return c.json({ error: 'Name and slug are required' }, 400)
    }

    const organization = await createOrganization({
      name,
      slug,
      description,
      logo,
      creatorUserId: user.id,
    })

    return c.json(organization, 201)
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return c.json({ error: 'Organization slug already exists' }, 409)
    }
    console.error('Error creating organization:', error)
    return c.json({ error: 'Failed to create organization' }, 500)
  }
})

// Get all organizations for current user
organizationRouter.get('/my-organizations', requireAuth, async (c) => {
  try {
    const user = c.get('user')
    const organizations = await getUserOrganizations(user.id)
    return c.json(organizations)
  } catch (error) {
    console.error('Error fetching organizations:', error)
    return c.json({ error: 'Failed to fetch organizations' }, 500)
  }
})

// Get organization by slug
organizationRouter.get('/slug/:slug', requireAuth, async (c) => {
  try {
    const slug = c.req.param('slug')
    const organization = await getOrganizationBySlug(slug)

    if (!organization) {
      return c.json({ error: 'Organization not found' }, 404)
    }

    return c.json(organization)
  } catch (error) {
    console.error('Error fetching organization:', error)
    return c.json({ error: 'Failed to fetch organization' }, 500)
  }
})

// Get organization by ID
organizationRouter.get('/:id', requireAuth, async (c) => {
  try {
    const id = c.req.param('id')
    const organization = await getOrganizationById(id)

    if (!organization) {
      return c.json({ error: 'Organization not found' }, 404)
    }

    return c.json(organization)
  } catch (error) {
    console.error('Error fetching organization:', error)
    return c.json({ error: 'Failed to fetch organization' }, 500)
  }
})

// Update organization (admin/owner only)
organizationRouter.put('/:id', requireAuth, async (c) => {
  try {
    const user = c.get('user')
    const id = c.req.param('id')
    
    // Check if user has admin or owner role
    const hasPermission = await hasOrganizationRole(user.id, id, 'admin')
    if (!hasPermission) {
      return c.json({ error: 'Insufficient permissions' }, 403)
    }

    const { name, slug, description, logo } = await c.req.json()

    const organization = await updateOrganization({
      organizationId: id,
      name,
      slug,
      description,
      logo,
    })

    return c.json(organization)
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return c.json({ error: 'Organization slug already exists' }, 409)
    }
    console.error('Error updating organization:', error)
    return c.json({ error: 'Failed to update organization' }, 500)
  }
})

// Delete organization (owner only)
organizationRouter.delete('/:id', requireAuth, async (c) => {
  try {
    const user = c.get('user')
    const id = c.req.param('id')
    
    // Check if user is owner
    const isOwner = await hasOrganizationRole(user.id, id, 'owner')
    if (!isOwner) {
      return c.json({ error: 'Only organization owner can delete' }, 403)
    }

    await deleteOrganization(id)
    return c.json({ message: 'Organization deleted successfully' })
  } catch (error) {
    console.error('Error deleting organization:', error)
    return c.json({ error: 'Failed to delete organization' }, 500)
  }
})

// Get organization members
organizationRouter.get('/:id/members', requireAuth, async (c) => {
  try {
    const user = c.get('user')
    const id = c.req.param('id')
    
    // Check if user has access to organization
    const hasAccess = await hasOrganizationRole(user.id, id, 'member')
    if (!hasAccess) {
      return c.json({ error: 'Access denied' }, 403)
    }

    const members = await getOrganizationMembers(id)
    return c.json(members)
  } catch (error) {
    console.error('Error fetching members:', error)
    return c.json({ error: 'Failed to fetch members' }, 500)
  }
})

// Add user to organization (admin/owner only)
organizationRouter.post('/:id/members', requireAuth, async (c) => {
  try {
    const user = c.get('user')
    const id = c.req.param('id')
    const { userId, role = 'member' } = await c.req.json()

    if (!userId) {
      return c.json({ error: 'User ID is required' }, 400)
    }

    // Check if requester has admin or owner role
    const hasPermission = await hasOrganizationRole(user.id, id, 'admin')
    if (!hasPermission) {
      return c.json({ error: 'Insufficient permissions' }, 403)
    }

    const member = await addUserToOrganization({
      userId,
      organizationId: id,
      role,
    })

    return c.json(member, 201)
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return c.json({ error: 'User is already a member' }, 409)
    }
    console.error('Error adding member:', error)
    return c.json({ error: 'Failed to add member' }, 500)
  }
})

// Update user role (admin/owner only)
organizationRouter.put('/:id/members/:userId', requireAuth, async (c) => {
  try {
    const user = c.get('user')
    const id = c.req.param('id')
    const userId = c.req.param('userId')
    const { role } = await c.req.json()

    if (!role) {
      return c.json({ error: 'Role is required' }, 400)
    }

    // Check if requester has admin or owner role
    const hasPermission = await hasOrganizationRole(user.id, id, 'admin')
    if (!hasPermission) {
      return c.json({ error: 'Insufficient permissions' }, 403)
    }

    const member = await updateUserRole({
      userId,
      organizationId: id,
      role,
    })

    return c.json(member)
  } catch (error) {
    console.error('Error updating member role:', error)
    return c.json({ error: 'Failed to update member role' }, 500)
  }
})

// Remove user from organization (admin/owner only)
organizationRouter.delete('/:id/members/:userId', requireAuth, async (c) => {
  try {
    const user = c.get('user')
    const id = c.req.param('id')
    const userId = c.req.param('userId')

    // Check if requester has admin or owner role
    const hasPermission = await hasOrganizationRole(user.id, id, 'admin')
    if (!hasPermission) {
      return c.json({ error: 'Insufficient permissions' }, 403)
    }

    await removeUserFromOrganization({
      userId,
      organizationId: id,
    })

    return c.json({ message: 'Member removed successfully' })
  } catch (error) {
    console.error('Error removing member:', error)
    return c.json({ error: 'Failed to remove member' }, 500)
  }
})

export default organizationRouter
