import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';
import { User, ModerationRule, PlatformConfig, ApiKey, AuditLog, PlatformStats } from '@/src/types';

// ============ USER MANAGEMENT ============
export const adminService = {
  // List all users with pagination
  async listUsers(pageSize = 50, startAfter?: string) {
    const usersRef = collection(db, 'users');
    let q = query(
      usersRef,
      orderBy('created_at', 'desc'),
      limit(pageSize + 1)
    );

    const snapshot = await getDocs(q);
    const users: User[] = [];
    snapshot.docs.forEach((doc) => {
      users.push(doc.data() as User);
    });

    return {
      users: users.slice(0, pageSize),
      hasMore: users.length > pageSize,
    };
  },

  // Get user by ID
  async getUserDetail(userId: string): Promise<User | null> {
    const userDoc = await getDoc(doc(db, 'users', userId));
    return userDoc.exists() ? (userDoc.data() as User) : null;
  },

  // Toggle user role (user <-> admin)
  async toggleUserRole(userId: string, newRole: 'user' | 'admin', adminId: string) {
    const userRef = doc(db, 'users', userId);
    const auditLog = {
      adminId,
      adminEmail: 'admin@stuhub.com', // Should come from auth
      action: 'toggle_role',
      targetId: userId,
      targetType: 'user' as const,
      details: { newRole },
      timestamp: new Date().toISOString(),
    };

    const batch = writeBatch(db);
    batch.update(userRef, { role: newRole });
    batch.set(doc(collection(db, 'audit_logs')), auditLog);
    await batch.commit();

    return true;
  },

  // Ban user
  async banUser(userId: string, reason: string, adminId: string) {
    const userRef = doc(db, 'users', userId);
    const auditLog = {
      adminId,
      action: 'ban_user',
      targetId: userId,
      targetType: 'user' as const,
      details: { reason },
      timestamp: new Date().toISOString(),
    };

    const batch = writeBatch(db);
    batch.update(userRef, {
      isBanned: true,
      bannedAt: new Date().toISOString(),
      banReason: reason,
    });
    batch.set(doc(collection(db, 'audit_logs')), auditLog);
    await batch.commit();

    return true;
  },

  // Unban user
  async unbanUser(userId: string, adminId: string) {
    const userRef = doc(db, 'users', userId);
    const auditLog = {
      adminId,
      action: 'unban_user',
      targetId: userId,
      targetType: 'user' as const,
      details: {},
      timestamp: new Date().toISOString(),
    };

    const batch = writeBatch(db);
    batch.update(userRef, {
      isBanned: false,
      bannedAt: undefined,
      banReason: undefined,
    });
    batch.set(doc(collection(db, 'audit_logs')), auditLog);
    await batch.commit();

    return true;
  },

  // ============ MODERATION RULES ============
  async listModerationRules() {
    try {
      const rulesRef = collection(db, 'moderation_rules');
      const q = query(rulesRef, orderBy('updatedAt', 'desc'));
      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => doc.data() as ModerationRule);
    } catch (error) {
      console.warn('Error fetching moderation rules:', error);
      // Return empty array if collection doesn't exist
      return [];
    }
  },

  async createModerationRule(
    rule: Omit<ModerationRule, 'id' | 'createdAt' | 'updatedAt'>,
    adminId: string
  ) {
    const ruleRef = doc(collection(db, 'moderation_rules'));
    const now = new Date().toISOString();

    const newRule = {
      ...rule,
      id: ruleRef.id,
      createdAt: now,
      updatedAt: now,
    };

    const auditLog = {
      adminId,
      action: 'create_moderation_rule',
      targetId: ruleRef.id,
      targetType: 'rule' as const,
      details: newRule,
      timestamp: now,
    };

    const batch = writeBatch(db);
    batch.set(ruleRef, newRule);
    batch.set(doc(collection(db, 'audit_logs')), auditLog);
    await batch.commit();

    return newRule;
  },

  async updateModerationRule(
    ruleId: string,
    updates: Partial<ModerationRule>,
    adminId: string
  ) {
    const ruleRef = doc(db, 'moderation_rules', ruleId);
    const now = new Date().toISOString();

    const auditLog = {
      adminId,
      action: 'update_moderation_rule',
      targetId: ruleId,
      targetType: 'rule' as const,
      details: updates,
      timestamp: now,
    };

    const batch = writeBatch(db);
    batch.update(ruleRef, { ...updates, updatedAt: now });
    batch.set(doc(collection(db, 'audit_logs')), auditLog);
    await batch.commit();

    return true;
  },

  async deleteModerationRule(ruleId: string, adminId: string) {
    const ruleRef = doc(db, 'moderation_rules', ruleId);
    const now = new Date().toISOString();

    const auditLog = {
      adminId,
      action: 'delete_moderation_rule',
      targetId: ruleId,
      targetType: 'rule' as const,
      details: {},
      timestamp: now,
    };

    const batch = writeBatch(db);
    batch.delete(ruleRef);
    batch.set(doc(collection(db, 'audit_logs')), auditLog);
    await batch.commit();

    return true;
  },

  // ============ PLATFORM CONFIG ============
  async getPlatformConfig(): Promise<PlatformConfig> {
    const configRef = doc(db, 'platform_config', 'main');
    const configDoc = await getDoc(configRef);

    if (!configDoc.exists()) {
      // Return defaults
      return {
        id: 'main',
        maintenanceMode: false,
        notificationsEnabled: true,
        emailNotifications: true,
        uploadNotifications: true,
        moderationNotifications: true,
        maxUploadSize: 100,
        updatedAt: new Date().toISOString(),
      };
    }

    return configDoc.data() as PlatformConfig;
  },

  async updatePlatformConfig(
    updates: Partial<PlatformConfig>,
    adminId: string
  ) {
    const configRef = doc(db, 'platform_config', 'main');
    const now = new Date().toISOString();

    const auditLog = {
      adminId,
      action: 'update_platform_config',
      targetId: 'main',
      targetType: 'config' as const,
      details: updates,
      timestamp: now,
    };

    const batch = writeBatch(db);
    batch.set(configRef, { ...updates, updatedAt: now }, { merge: true });
    batch.set(doc(collection(db, 'audit_logs')), auditLog);
    await batch.commit();

    return true;
  },

  // ============ AUDIT LOGS ============
  async getAuditLogs(pageSize = 100) {
    try {
      const logsRef = collection(db, 'audit_logs');
      const q = query(logsRef, orderBy('timestamp', 'desc'), limit(pageSize));
      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => doc.data() as AuditLog);
    } catch (error) {
      console.warn('Error fetching audit logs:', error);
      // Return empty array if collection doesn't exist
      return [];
    }
  },

  async logAdminAction(
    adminId: string,
    action: string,
    targetId: string,
    targetType: string,
    details: Record<string, any>
  ) {
    const logRef = doc(collection(db, 'audit_logs'));
    const log = {
      adminId,
      action,
      targetId,
      targetType,
      details,
      timestamp: new Date().toISOString(),
    };

    await setDoc(logRef, log);
  },

  // ============ API KEY MANAGEMENT ============
  async listApiKeys(adminId: string) {
    try {
      const keysRef = collection(db, 'api_keys');
      const q = query(keysRef, where('createdBy', '==', adminId));
      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => {
        const data = doc.data() as ApiKey;
        return { ...data, key: '***' }; // Hide full key
      });
    } catch (error) {
      console.warn('Error fetching API keys:', error);
      // Return empty array if collection doesn't exist
      return [];
    }
  },

  async createApiKey(
    name: string,
    permissions: string[],
    createdBy: string
  ) {
    const keyRef = doc(collection(db, 'api_keys'));
    const newKey = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    // In production, hash this with bcrypt before storing

    const apiKey = {
      id: keyRef.id,
      name,
      key: newKey,
      createdBy,
      createdAt: new Date().toISOString(),
      isActive: true,
      permissions,
    };

    await setDoc(keyRef, apiKey);

    return apiKey;
  },

  async deactivateApiKey(keyId: string, adminId: string) {
    const keyRef = doc(db, 'api_keys', keyId);
    const auditLog = {
      adminId,
      action: 'deactivate_api_key',
      targetId: keyId,
      targetType: 'apikey' as const,
      details: {},
      timestamp: new Date().toISOString(),
    };

    const batch = writeBatch(db);
    batch.update(keyRef, { isActive: false });
    batch.set(doc(collection(db, 'audit_logs')), auditLog);
    await batch.commit();

    return true;
  },

  // ============ PLATFORM STATS ============
  async getPlatformStats(): Promise<PlatformStats> {
    // In production, these should be pre-computed and cached
    const usersRef = collection(db, 'users');
    const materialsRef = collection(db, 'materials');

    const usersSnap = await getDocs(usersRef);
    const materialsSnap = await getDocs(materialsRef);

    const users = usersSnap.docs.map((d) => d.data() as User);
    const materials = materialsSnap.docs.map((d) => d.data());

    const bannedCount = users.filter((u) => u.isBanned).length;
    const approvedCount = materials.filter((m) => m.status === 'approved').length;
    const pendingCount = materials.filter((m) => m.status === 'pending').length;
    const flaggedCount = materials.filter((m) => m.status === 'flagged').length;

    return {
      totalUsers: users.length,
      activeUsers: users.length, // Simplified; should check lastActivity
      totalMaterials: materials.length,
      approvedMaterials: approvedCount,
      pendingMaterials: pendingCount,
      flaggedMaterials: flaggedCount,
      bannedUsers: bannedCount,
      totalApiCalls: 0, // Track separately
      storageUsed: 0, // Track with Firebase Storage
      lastUpdated: new Date().toISOString(),
    };
  },
};
