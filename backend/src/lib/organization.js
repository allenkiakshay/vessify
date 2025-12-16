import { prisma } from './db.js';
/**
 * Create a new organization with the creator as owner
 */
export async function createOrganization(params) {
    const { name, slug, description, logo, creatorUserId } = params;
    // Create organization and add creator as owner in a transaction
    const organization = await prisma.organization.create({
        data: {
            name,
            slug,
            description,
            logo,
            members: {
                create: {
                    userId: creatorUserId,
                    role: 'owner',
                },
            },
        },
        include: {
            members: {
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            name: true,
                            image: true,
                        },
                    },
                },
            },
        },
    });
    return organization;
}
/**
 * Add a user to an organization
 */
export async function addUserToOrganization(params) {
    const { userId, organizationId, role = 'member' } = params;
    const member = await prisma.organizationMember.create({
        data: {
            userId,
            organizationId,
            role,
        },
        include: {
            user: {
                select: {
                    id: true,
                    email: true,
                    name: true,
                    image: true,
                },
            },
            organization: true,
        },
    });
    return member;
}
/**
 * Remove a user from an organization
 */
export async function removeUserFromOrganization(params) {
    const { userId, organizationId } = params;
    await prisma.organizationMember.delete({
        where: {
            userId_organizationId: {
                userId,
                organizationId,
            },
        },
    });
}
/**
 * Update user's role in an organization
 */
export async function updateUserRole(params) {
    const { userId, organizationId, role } = params;
    const member = await prisma.organizationMember.update({
        where: {
            userId_organizationId: {
                userId,
                organizationId,
            },
        },
        data: {
            role,
        },
        include: {
            user: {
                select: {
                    id: true,
                    email: true,
                    name: true,
                    image: true,
                },
            },
        },
    });
    return member;
}
/**
 * Get all organizations for a user
 */
export async function getUserOrganizations(userId) {
    const memberships = await prisma.organizationMember.findMany({
        where: {
            userId,
        },
        include: {
            organization: true,
        },
        orderBy: {
            createdAt: 'desc',
        },
    });
    return memberships.map((m) => ({
        ...m.organization,
        role: m.role,
    }));
}
/**
 * Get all members of an organization
 */
export async function getOrganizationMembers(organizationId) {
    const members = await prisma.organizationMember.findMany({
        where: {
            organizationId,
        },
        include: {
            user: {
                select: {
                    id: true,
                    email: true,
                    name: true,
                    image: true,
                    emailVerified: true,
                },
            },
        },
        orderBy: {
            createdAt: 'asc',
        },
    });
    return members;
}
/**
 * Check if user has access to organization
 */
export async function hasOrganizationAccess(userId, organizationId) {
    const member = await prisma.organizationMember.findUnique({
        where: {
            userId_organizationId: {
                userId,
                organizationId,
            },
        },
    });
    return !!member;
}
/**
 * Check if user has specific role in organization
 */
export async function hasOrganizationRole(userId, organizationId, requiredRole) {
    const member = await prisma.organizationMember.findUnique({
        where: {
            userId_organizationId: {
                userId,
                organizationId,
            },
        },
    });
    if (!member)
        return false;
    // Role hierarchy: owner > admin > member
    const roleHierarchy = { owner: 3, admin: 2, member: 1 };
    return roleHierarchy[member.role] >= roleHierarchy[requiredRole];
}
/**
 * Get organization by slug
 */
export async function getOrganizationBySlug(slug) {
    const organization = await prisma.organization.findUnique({
        where: { slug },
        include: {
            members: {
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            name: true,
                            image: true,
                        },
                    },
                },
            },
        },
    });
    return organization;
}
/**
 * Get organization by ID
 */
export async function getOrganizationById(id) {
    const organization = await prisma.organization.findUnique({
        where: { id },
        include: {
            members: {
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            name: true,
                            image: true,
                        },
                    },
                },
            },
        },
    });
    return organization;
}
/**
 * Update organization details
 */
export async function updateOrganization(params) {
    const { organizationId, ...data } = params;
    const organization = await prisma.organization.update({
        where: { id: organizationId },
        data,
    });
    return organization;
}
/**
 * Delete an organization
 */
export async function deleteOrganization(organizationId) {
    await prisma.organization.delete({
        where: { id: organizationId },
    });
}
