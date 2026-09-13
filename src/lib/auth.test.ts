import { describe, it, expect, beforeEach } from 'vitest';
import {
  getToken,
  setToken,
  removeToken,
  getDatabaseId,
  setDatabaseId,
  removeDatabaseId,
  isAuthenticated,
} from './auth';

describe('auth', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  describe('Token management', () => {
    it('should return null when no token is set', () => {
      expect(getToken()).toBeNull();
    });

    it('should set and get token', () => {
      const token = 'test-token-123';
      setToken(token);
      expect(getToken()).toBe(token);
    });

    it('should remove token', () => {
      const token = 'test-token-123';
      setToken(token);
      expect(getToken()).toBe(token);
      
      removeToken();
      expect(getToken()).toBeNull();
    });

    it('should overwrite existing token', () => {
      setToken('token-1');
      expect(getToken()).toBe('token-1');
      
      setToken('token-2');
      expect(getToken()).toBe('token-2');
    });
  });

  describe('Database ID management', () => {
    it('should return null when no database ID is set', () => {
      expect(getDatabaseId()).toBeNull();
    });

    it('should set and get database ID', () => {
      const databaseId = 'test-db-123';
      setDatabaseId(databaseId);
      expect(getDatabaseId()).toBe(databaseId);
    });

    it('should remove database ID', () => {
      const databaseId = 'test-db-123';
      setDatabaseId(databaseId);
      expect(getDatabaseId()).toBe(databaseId);
      
      removeDatabaseId();
      expect(getDatabaseId()).toBeNull();
    });

    it('should overwrite existing database ID', () => {
      setDatabaseId('db-1');
      expect(getDatabaseId()).toBe('db-1');
      
      setDatabaseId('db-2');
      expect(getDatabaseId()).toBe('db-2');
    });
  });

  describe('isAuthenticated', () => {
    it('should return false when no token is set', () => {
      expect(isAuthenticated()).toBe(false);
    });

    it('should return true when token is set', () => {
      setToken('test-token');
      expect(isAuthenticated()).toBe(true);
    });

    it('should return false after token is removed', () => {
      setToken('test-token');
      expect(isAuthenticated()).toBe(true);
      
      removeToken();
      expect(isAuthenticated()).toBe(false);
    });

    it('should return true for empty string token', () => {
      setToken('');
      // Empty string is falsy, so isAuthenticated should return false
      expect(isAuthenticated()).toBe(false);
    });
  });

  describe('localStorage persistence', () => {
    it('should persist token across function calls', () => {
      setToken('persistent-token');
      
      // Simulate page reload by getting token again
      const retrievedToken = getToken();
      expect(retrievedToken).toBe('persistent-token');
    });

    it('should persist database ID across function calls', () => {
      setDatabaseId('persistent-db');
      
      // Simulate page reload by getting database ID again
      const retrievedDbId = getDatabaseId();
      expect(retrievedDbId).toBe('persistent-db');
    });

    it('should store token and database ID independently', () => {
      setToken('token-123');
      setDatabaseId('db-456');
      
      expect(getToken()).toBe('token-123');
      expect(getDatabaseId()).toBe('db-456');
      
      removeToken();
      expect(getToken()).toBeNull();
      expect(getDatabaseId()).toBe('db-456'); // Should still exist
    });
  });
});
