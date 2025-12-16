import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals'
import { prisma } from '../../lib/db.js'
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
} from '../../lib/organization.js'

describe('Organization API', () => {
  let testUser1: any
  let testUser2: any
  let testUser3: any

  beforeAll(async () => {
    // Clean up any existing test data first
    await prisma.user.deleteMany({
      where: {
        email: {
          contains: 'orguser',
        },
      },
    })

    // Create test users
    testUser1 = await prisma.user.create({
      data: {
        email: `orguser1${Date.now()}@test.com`,
        name: 'Org User 1',
        emailVerified: true,
      },
    })

    testUser2 = await prisma.user.create({
      data: {
        email: `orguser2${Date.now()}@test.com`,
        name: 'Org User 2',
        emailVerified: true,
      },
    })

    testUser3 = await prisma.user.create({
      data: {
        email: `orguser3${Date.now()}@test.com`,
        name: 'Org User 3',
        emailVerified: true,
      },
    })

    // Verify users were created
    expect(testUser1).toBeDefined()
    expect(testUser1.id).toBeDefined()
    expect(testUser2).toBeDefined()
    expect(testUser2.id).toBeDefined()
    expect(testUser3).toBeDefined()
    expect(testUser3.id).toBeDefined()
  })

  afterAll(async () => {
    // Clean up in correct order to avoid foreign key constraints
    try {
      // First delete all transactions
      await prisma.transaction.deleteMany({
        where: {
          organization: {
            members: {
              some: {
                userId: {
                  in: [testUser1?.id, testUser2?.id, testUser3?.id].filter(Boolean),
                },
              },
            },
          },
        },
      })

      // Then delete all organization members
      await prisma.organizationMember.deleteMany({
        where: {
          userId: {
            in: [testUser1?.id, testUser2?.id, testUser3?.id].filter(Boolean),
          },
        },
      })

      // Then delete all organizations
      await prisma.organization.deleteMany({
        where: {
          slug: {
            contains: 'test-org',
          },
        },
      })

      // Finally delete test users
      await prisma.user.deleteMany({
        where: {
          id: {
            in: [testUser1?.id, testUser2?.id, testUser3?.id].filter(Boolean),
          },
        },
      })
    } catch (error) {
      console.error('Cleanup error:', error)
    } finally {
      await prisma.$disconnect()
    }
  })

  describe('Organization Creation', () => {
    it('should create organization with owner', async () => {
      const org = await createOrganization({
        name: 'Test Organization',
        slug: `test-org-${Date.now()}`,
        description: 'A test organization',
        creatorUserId: testUser1.id,
      })

      expect(org).toBeDefined()
      expect(org.name).toBe('Test Organization')
      expect(org.slug).toContain('test-org-')
      expect(org.members).toBeDefined()
      expect(org.members.length).toBe(1)
      expect(org.members[0].role).toBe('owner')
      expect(org.members[0].userId).toBe(testUser1.id)
    })

    it('should not create organization with duplicate slug', async () => {
      const slug = `unique-slug-${Date.now()}`

      await createOrganization({
        name: 'First Org',
        slug,
        creatorUserId: testUser1.id,
      })

      await expect(
        createOrganization({
          name: 'Second Org',
          slug,
          creatorUserId: testUser2.id,
        })
      ).rejects.toThrow()
    })

    it('should create organization with optional fields', async () => {
      const org = await createOrganization({
        name: 'Minimal Org',
        slug: `minimal-${Date.now()}`,
        creatorUserId: testUser1.id,
      })

      expect(org.description).toBeNull()
      expect(org.logo).toBeNull()
    })
  })

  describe('Organization Retrieval', () => {
    let testOrg: any

    beforeAll(async () => {
      testOrg = await createOrganization({
        name: 'Retrieval Test Org',
        slug: `retrieval-test-${Date.now()}`,
        description: 'For testing retrieval',
        creatorUserId: testUser1.id,
      })
    })

    it('should get organization by ID', async () => {
      const org = await getOrganizationById(testOrg.id)

      expect(org).toBeDefined()
      expect(org?.id).toBe(testOrg.id)
      expect(org?.name).toBe('Retrieval Test Org')
    })

    it('should get organization by slug', async () => {
      const org = await getOrganizationBySlug(testOrg.slug)

      expect(org).toBeDefined()
      expect(org?.slug).toBe(testOrg.slug)
      expect(org?.name).toBe('Retrieval Test Org')
    })

    it('should return null for non-existent organization', async () => {
      const org = await getOrganizationById('non-existent-id')

      expect(org).toBeNull()
    })
  })

  describe('Organization Membership', () => {
    let memberOrg: any

    beforeEach(async () => {
      memberOrg = await createOrganization({
        name: 'Member Test Org',
        slug: `member-test-${Date.now()}`,
        creatorUserId: testUser1.id,
      })
    })

    it('should add member to organization', async () => {
      const member = await addUserToOrganization({
        userId: testUser2.id,
        organizationId: memberOrg.id,
        role: 'member',
      })

      expect(member).toBeDefined()
      expect(member.userId).toBe(testUser2.id)
      expect(member.organizationId).toBe(memberOrg.id)
      expect(member.role).toBe('member')
    })

    it('should add admin to organization', async () => {
      const admin = await addUserToOrganization({
        userId: testUser2.id,
        organizationId: memberOrg.id,
        role: 'admin',
      })

      expect(admin.role).toBe('admin')
    })

    it('should not add duplicate members', async () => {
      await addUserToOrganization({
        userId: testUser2.id,
        organizationId: memberOrg.id,
        role: 'member',
      })

      await expect(
        addUserToOrganization({
          userId: testUser2.id,
          organizationId: memberOrg.id,
          role: 'member',
        })
      ).rejects.toThrow()
    })

    it('should get organization members', async () => {
      await addUserToOrganization({
        userId: testUser2.id,
        organizationId: memberOrg.id,
        role: 'member',
      })

      await addUserToOrganization({
        userId: testUser3.id,
        organizationId: memberOrg.id,
        role: 'admin',
      })

      const members = await getOrganizationMembers(memberOrg.id)

      expect(members.length).toBeGreaterThanOrEqual(3) // Owner + 2 added members
      expect(members.some((m) => m.userId === testUser1.id)).toBe(true)
      expect(members.some((m) => m.userId === testUser2.id)).toBe(true)
      expect(members.some((m) => m.userId === testUser3.id)).toBe(true)
    })

    it('should remove member from organization', async () => {
      await addUserToOrganization({
        userId: testUser2.id,
        organizationId: memberOrg.id,
        role: 'member',
      })

      await removeUserFromOrganization({
        userId: testUser2.id,
        organizationId: memberOrg.id,
      })

      const members = await getOrganizationMembers(memberOrg.id)
      expect(members.some((m) => m.userId === testUser2.id)).toBe(false)
    })
  })

  describe('Role Management', () => {
    let roleOrg: any

    beforeEach(async () => {
      roleOrg = await createOrganization({
        name: 'Role Test Org',
        slug: `role-test-${Date.now()}`,
        creatorUserId: testUser1.id,
      })

      await addUserToOrganization({
        userId: testUser2.id,
        organizationId: roleOrg.id,
        role: 'member',
      })
    })

    it('should update user role', async () => {
      const updated = await updateUserRole({
        userId: testUser2.id,
        organizationId: roleOrg.id,
        role: 'admin',
      })

      expect(updated.role).toBe('admin')
    })

    it('should check if user has owner role', async () => {
      const hasOwner = await hasOrganizationRole(
        testUser1.id,
        roleOrg.id,
        'owner'
      )

      expect(hasOwner).toBe(true)
    })

    it('should check if user has admin role', async () => {
      await updateUserRole({
        userId: testUser2.id,
        organizationId: roleOrg.id,
        role: 'admin',
      })

      const hasAdmin = await hasOrganizationRole(
        testUser2.id,
        roleOrg.id,
        'admin'
      )

      expect(hasAdmin).toBe(true)
    })

    it('should check if user has member role', async () => {
      const hasMember = await hasOrganizationRole(
        testUser2.id,
        roleOrg.id,
        'member'
      )

      expect(hasMember).toBe(true)
    })

    it('should return false for user not in organization', async () => {
      const hasRole = await hasOrganizationRole(
        testUser3.id,
        roleOrg.id,
        'member'
      )

      expect(hasRole).toBe(false)
    })

    it('should enforce role hierarchy', async () => {
      // Owner should have admin privileges
      const ownerHasAdmin = await hasOrganizationRole(
        testUser1.id,
        roleOrg.id,
        'admin'
      )

      expect(ownerHasAdmin).toBe(true)

      // Owner should have member privileges
      const ownerHasMember = await hasOrganizationRole(
        testUser1.id,
        roleOrg.id,
        'member'
      )

      expect(ownerHasMember).toBe(true)
    })
  })

  describe('User Organizations', () => {
    it('should get all organizations for a user', async () => {
      const org1 = await createOrganization({
        name: 'User Org 1',
        slug: `user-org-1-${Date.now()}`,
        creatorUserId: testUser1.id,
      })

      const org2 = await createOrganization({
        name: 'User Org 2',
        slug: `user-org-2-${Date.now()}`,
        creatorUserId: testUser2.id,
      })

      // Add testUser1 to org2
      await addUserToOrganization({
        userId: testUser1.id,
        organizationId: org2.id,
        role: 'member',
      })

      const userOrgs = await getUserOrganizations(testUser1.id)

      expect(userOrgs.length).toBeGreaterThanOrEqual(2)
      expect(userOrgs.some((o) => o.id === org1.id)).toBe(true)
      expect(userOrgs.some((o) => o.id === org2.id)).toBe(true)
    })

    it('should return empty array for user with no organizations', async () => {
      const newUser = await prisma.user.create({
        data: {
          email: `noorg${Date.now()}@test.com`,
          name: 'No Org User',
          emailVerified: true,
        },
      })

      const userOrgs = await getUserOrganizations(newUser.id)

      expect(userOrgs).toEqual([])

      // Cleanup
      await prisma.user.delete({
        where: { id: newUser.id },
      })
    })
  })

  describe('Organization Updates', () => {
    let updateOrg: any

    beforeEach(async () => {
      updateOrg = await createOrganization({
        name: 'Update Test Org',
        slug: `update-test-${Date.now()}`,
        description: 'Original description',
        creatorUserId: testUser1.id,
      })
    })

    it('should update organization name', async () => {
      const updated = await updateOrganization({
        organizationId: updateOrg.id,
        name: 'Updated Name',
      })

      expect(updated.name).toBe('Updated Name')
    })

    it('should update organization description', async () => {
      const updated = await updateOrganization({
        organizationId: updateOrg.id,
        description: 'New description',
      })

      expect(updated.description).toBe('New description')
    })

    it('should update organization slug', async () => {
      const newSlug = `new-slug-${Date.now()}`
      const updated = await updateOrganization({
        organizationId: updateOrg.id,
        slug: newSlug,
      })

      expect(updated.slug).toBe(newSlug)
    })

    it('should not update to duplicate slug', async () => {
      const existingSlug = `existing-${Date.now()}`
      
      await createOrganization({
        name: 'Existing Org',
        slug: existingSlug,
        creatorUserId: testUser2.id,
      })

      await expect(
        updateOrganization({
          organizationId: updateOrg.id,
          slug: existingSlug,
        })
      ).rejects.toThrow()
    })
  })

  describe('Organization Deletion', () => {
    it('should delete organization and its members', async () => {
      const deleteOrg = await createOrganization({
        name: 'Delete Test Org',
        slug: `delete-test-${Date.now()}`,
        creatorUserId: testUser1.id,
      })

      await addUserToOrganization({
        userId: testUser2.id,
        organizationId: deleteOrg.id,
        role: 'member',
      })

      await deleteOrganization(deleteOrg.id)

      // Verify organization is deleted
      const org = await getOrganizationById(deleteOrg.id)
      expect(org).toBeNull()

      // Verify members are deleted (cascade)
      const members = await prisma.organizationMember.findMany({
        where: {
          organizationId: deleteOrg.id,
        },
      })
      expect(members).toEqual([])
    })

    it('should delete organization transactions on cascade', async () => {
      const cascadeOrg = await createOrganization({
        name: 'Cascade Test Org',
        slug: `cascade-test-${Date.now()}`,
        creatorUserId: testUser1.id,
      })

      // Create transaction
      await prisma.transaction.create({
        data: {
          text: 'Test transaction',
          amount: 100,
          date: new Date(),
          description: 'Test',
          category: 'Other',
          confidence: 0.9,
          organizationId: cascadeOrg.id,
          userId: testUser1.id,
        },
      })

      await deleteOrganization(cascadeOrg.id)

      // Verify transactions are deleted
      const transactions = await prisma.transaction.findMany({
        where: {
          organizationId: cascadeOrg.id,
        },
      })
      expect(transactions).toEqual([])
    })
  })

  describe('Access Control', () => {
    let accessOrg: any

    beforeEach(async () => {
      accessOrg = await createOrganization({
        name: 'Access Control Org',
        slug: `access-${Date.now()}`,
        creatorUserId: testUser1.id,
      })
    })

    it('should grant owner full access', async () => {
      const hasOwner = await hasOrganizationRole(
        testUser1.id,
        accessOrg.id,
        'owner'
      )
      const hasAdmin = await hasOrganizationRole(
        testUser1.id,
        accessOrg.id,
        'admin'
      )
      const hasMember = await hasOrganizationRole(
        testUser1.id,
        accessOrg.id,
        'member'
      )

      expect(hasOwner).toBe(true)
      expect(hasAdmin).toBe(true)
      expect(hasMember).toBe(true)
    })

    it('should grant admin partial access', async () => {
      await addUserToOrganization({
        userId: testUser2.id,
        organizationId: accessOrg.id,
        role: 'admin',
      })

      const hasOwner = await hasOrganizationRole(
        testUser2.id,
        accessOrg.id,
        'owner'
      )
      const hasAdmin = await hasOrganizationRole(
        testUser2.id,
        accessOrg.id,
        'admin'
      )
      const hasMember = await hasOrganizationRole(
        testUser2.id,
        accessOrg.id,
        'member'
      )

      expect(hasOwner).toBe(false)
      expect(hasAdmin).toBe(true)
      expect(hasMember).toBe(true)
    })

    it('should grant member basic access only', async () => {
      await addUserToOrganization({
        userId: testUser2.id,
        organizationId: accessOrg.id,
        role: 'member',
      })

      const hasOwner = await hasOrganizationRole(
        testUser2.id,
        accessOrg.id,
        'owner'
      )
      const hasAdmin = await hasOrganizationRole(
        testUser2.id,
        accessOrg.id,
        'admin'
      )
      const hasMember = await hasOrganizationRole(
        testUser2.id,
        accessOrg.id,
        'member'
      )

      expect(hasOwner).toBe(false)
      expect(hasAdmin).toBe(false)
      expect(hasMember).toBe(true)
    })
  })
})
