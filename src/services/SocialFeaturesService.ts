/**
 * KotaPay Social Features Service
 * 
 * Implements contact sync, split bill, and chat functionality
 */

import * as Crypto from 'expo-crypto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppwriteService from './AppwriteService';
import { notificationService } from './notifications';

export interface Contact {
  id: string;
  name: string;
  phoneNumber: string;
  hashedPhoneNumber: string;
  isKotaPayUser: boolean;
  userId?: string;
  avatar?: string;
  lastSeen?: string;
}

export interface SplitBillGroup {
  id: string;
  creatorId: string;
  title: string;
  description: string;
  totalAmount: number;
  members: SplitBillMember[];
  status: 'active' | 'completed' | 'cancelled';
  createdAt: string;
  completedAt?: string;
}

export interface SplitBillMember {
  userId: string;
  name: string;
  phoneNumber: string;
  amount: number;
  status: 'pending' | 'paid' | 'declined';
  paidAt?: string;
  transactionId?: string;
}

export interface ChatMessage {
  id: string;
  transactionId: string;
  senderId: string;
  senderName: string;
  message: string;
  messageType: 'text' | 'payment_request' | 'payment_confirmation' | 'system';
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  metadata?: any;
}

export interface ChatThread {
  id: string;
  transactionId: string;
  participants: string[];
  lastMessage?: ChatMessage;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

class SocialFeaturesService {
  // Contact Sync Implementation
  async syncContacts(deviceContacts: { name: string; phoneNumber: string }[]): Promise<Contact[]> {
    console.log(`📱 Syncing ${deviceContacts.length} contacts...`);
    
    try {
      const syncedContacts: Contact[] = [];
      
      for (const contact of deviceContacts) {
        const hashedPhoneNumber = await this.hashPhoneNumber(contact.phoneNumber);
        
        // Check if contact is a KotaPay user
        const kotaPayUser = await this.findUserByHashedPhone(hashedPhoneNumber);
        
        const syncedContact: Contact = {
          id: `contact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: contact.name,
          phoneNumber: contact.phoneNumber,
          hashedPhoneNumber,
          isKotaPayUser: !!kotaPayUser,
          userId: kotaPayUser?.userId,
          avatar: kotaPayUser?.avatar
        };
        
        syncedContacts.push(syncedContact);
      }
      
      // Store synced contacts locally
      await AsyncStorage.setItem('synced_contacts', JSON.stringify(syncedContacts));
      
      const kotaPayUsers = syncedContacts.filter(c => c.isKotaPayUser);
      console.log(`✅ Contact sync completed: ${kotaPayUsers.length}/${syncedContacts.length} are KotaPay users`);
      
      return syncedContacts;
    } catch (error) {
      console.error('❌ Contact sync failed:', error);
      throw error;
    }
  }

  private async hashPhoneNumber(phoneNumber: string): Promise<string> {
    // Normalize phone number (remove spaces, hyphens, etc.)
    const normalizedPhone = phoneNumber.replace(/[\s\-\(\)]/g, '');
    
    // Hash using SHA256 for privacy
    const hash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      normalizedPhone
    );
    
    return hash;
  }

  private async findUserByHashedPhone(hashedPhoneNumber: string): Promise<{ userId: string; avatar?: string } | null> {
    try {
      // In production, query Appwrite database for user with matching hashed phone
      // For now, return mock data for demonstration
      const mockUsers = [
        { hashedPhone: '1a2b3c4d5e', userId: 'user_123', avatar: 'https://example.com/avatar1.jpg' },
        { hashedPhone: '6f7g8h9i0j', userId: 'user_456', avatar: 'https://example.com/avatar2.jpg' }
      ];
      
      const user = mockUsers.find(u => u.hashedPhone === hashedPhoneNumber.substring(0, 10));
      return user ? { userId: user.userId, avatar: user.avatar } : null;
    } catch (error) {
      console.error('Error finding user by hashed phone:', error);
      return null;
    }
  }

  async getSyncedContacts(): Promise<Contact[]> {
    try {
      const contactsData = await AsyncStorage.getItem('synced_contacts');
      return contactsData ? JSON.parse(contactsData) : [];
    } catch (error) {
      console.error('Error getting synced contacts:', error);
      return [];
    }
  }

  async getKotaPayContacts(): Promise<Contact[]> {
    const allContacts = await this.getSyncedContacts();
    return allContacts.filter(contact => contact.isKotaPayUser);
  }

  // Split Bill Implementation
  async createSplitBill(data: {
    title: string;
    description: string;
    totalAmount: number;
    members: { userId: string; name: string; phoneNumber: string; amount: number }[];
    creatorId: string;
  }): Promise<SplitBillGroup> {
    console.log(`💸 Creating split bill: ${data.title} (₦${(data.totalAmount / 100).toFixed(2)})`);
    
    try {
      const splitBill: SplitBillGroup = {
        id: `split_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        creatorId: data.creatorId,
        title: data.title,
        description: data.description,
        totalAmount: data.totalAmount,
        members: data.members.map(member => ({
          ...member,
          status: 'pending'
        })),
        status: 'active',
        createdAt: new Date().toISOString()
      };
      
      // In production, save to Appwrite database
      await this.saveSplitBillToDatabase(splitBill);
      
      // Send individual payment requests to each member
      for (const member of splitBill.members) {
        await this.sendSplitBillRequest(splitBill, member);
      }
      
      console.log(`✅ Split bill created with ${splitBill.members.length} members`);
      return splitBill;
    } catch (error) {
      console.error('❌ Failed to create split bill:', error);
      throw error;
    }
  }

  private async saveSplitBillToDatabase(splitBill: SplitBillGroup): Promise<void> {
    try {
      // Mock database save - in production, use Appwrite
      console.log('💾 Split bill saved to database:', splitBill.id);
    } catch (error) {
      console.error('Error saving split bill:', error);
      throw error;
    }
  }

  private async sendSplitBillRequest(splitBill: SplitBillGroup, member: SplitBillMember): Promise<void> {
    try {
      // Create individual payment request
      await AppwriteService.createTransaction({
        userId: member.userId,
        type: 'debit',
        amount: member.amount,
        description: `Split bill: ${splitBill.title}`,
        reference: `split_${splitBill.id}_${member.userId}`,
        status: 'pending',
        recipientId: splitBill.creatorId
      });
      
      // Send notification using existing method
      await notificationService.sendPaymentSentNotification(
        member.userId,
        splitBill.creatorId,
        member.amount,
        `Split bill: ${splitBill.title}`
      );
      
      console.log(`📤 Split bill request sent to ${member.name}: ₦${(member.amount / 100).toFixed(2)}`);
    } catch (error) {
      console.error(`Error sending split bill request to ${member.name}:`, error);
    }
  }

  async paySplitBillShare(splitBillId: string, memberId: string, pin: string): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    try {
      console.log(`💳 Processing split bill payment for ${splitBillId}`);
      
      // Get split bill details
      const splitBill = await this.getSplitBillById(splitBillId);
      if (!splitBill) {
        return { success: false, error: 'Split bill not found' };
      }
      
      const member = splitBill.members.find(m => m.userId === memberId);
      if (!member) {
        return { success: false, error: 'Member not found in split bill' };
      }
      
      if (member.status === 'paid') {
        return { success: false, error: 'Payment already completed' };
      }
      
      // Process payment (mock implementation)
      const transactionId = `txn_split_${Date.now()}`;
      
      // Update member status
      member.status = 'paid';
      member.paidAt = new Date().toISOString();
      member.transactionId = transactionId;
      
      // Check if all members have paid
      const allPaid = splitBill.members.every(m => m.status === 'paid');
      if (allPaid) {
        splitBill.status = 'completed';
        splitBill.completedAt = new Date().toISOString();
        
        // Notify creator that split bill is complete
        await notificationService.sendPaymentReceivedNotification(
          splitBill.creatorId,
          'Split Bill Members',
          splitBill.totalAmount,
          `Split bill "${splitBill.title}" completed`
        );
      }
      
      // Update database
      await this.updateSplitBillInDatabase(splitBill);
      
      console.log(`✅ Split bill payment successful: ${transactionId}`);
      return { success: true, transactionId };
    } catch (error) {
      console.error('❌ Split bill payment failed:', error);
      return { success: false, error: 'Payment processing failed' };
    }
  }

  private async getSplitBillById(splitBillId: string): Promise<SplitBillGroup | null> {
    // Mock implementation - in production, query from database
    return null;
  }

  private async updateSplitBillInDatabase(splitBill: SplitBillGroup): Promise<void> {
    console.log('💾 Split bill updated in database:', splitBill.id);
  }

  async getUserSplitBills(userId: string): Promise<SplitBillGroup[]> {
    // Mock implementation - in production, query from database
    const mockSplitBills: SplitBillGroup[] = [
      {
        id: 'split_001',
        creatorId: 'user_123',
        title: 'Dinner at KFC',
        description: 'Group dinner with friends',
        totalAmount: 1500000, // ₦15,000
        members: [
          { userId: 'user_456', name: 'John Doe', phoneNumber: '+2348012345678', amount: 500000, status: 'paid', paidAt: new Date().toISOString() },
          { userId: 'user_789', name: 'Jane Smith', phoneNumber: '+2348087654321', amount: 500000, status: 'pending' },
          { userId: userId, name: 'Current User', phoneNumber: '+2348011111111', amount: 500000, status: 'pending' }
        ],
        status: 'active',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      }
    ];
    
    return mockSplitBills.filter(bill => 
      bill.creatorId === userId || bill.members.some(m => m.userId === userId)
    );
  }

  // Chat Implementation
  async createChatThread(transactionId: string, participants: string[]): Promise<ChatThread> {
    console.log(`💬 Creating chat thread for transaction: ${transactionId}`);
    
    const chatThread: ChatThread = {
      id: `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      transactionId,
      participants,
      unreadCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // In production, save to database
    console.log('✅ Chat thread created:', chatThread.id);
    return chatThread;
  }

  async sendChatMessage(data: {
    threadId: string;
    transactionId: string;
    senderId: string;
    senderName: string;
    message: string;
    messageType?: 'text' | 'payment_request' | 'payment_confirmation' | 'system';
  }): Promise<ChatMessage> {
    console.log(`📤 Sending chat message from ${data.senderName}`);
    
    const chatMessage: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      transactionId: data.transactionId,
      senderId: data.senderId,
      senderName: data.senderName,
      message: data.message,
      messageType: data.messageType || 'text',
      timestamp: new Date().toISOString(),
      status: 'sent'
    };
    
    // In production, save to database and send real-time updates
    console.log('✅ Chat message sent:', chatMessage.id);
    
    // Send push notification to other participants
    await this.notifyParticipants(data.threadId, chatMessage);
    
    return chatMessage;
  }

  private async notifyParticipants(threadId: string, message: ChatMessage): Promise<void> {
    try {
      // Get thread participants and send notifications
      // Mock implementation
      console.log(`🔔 Notifying participants about new message in thread: ${threadId}`);
    } catch (error) {
      console.error('Error notifying participants:', error);
    }
  }

  async getChatMessages(transactionId: string, limit: number = 50, offset: number = 0): Promise<ChatMessage[]> {
    // Mock chat messages for demonstration
    const mockMessages: ChatMessage[] = [
      {
        id: 'msg_001',
        transactionId,
        senderId: 'user_123',
        senderName: 'John Doe',
        message: 'Payment sent! ₦5,000',
        messageType: 'payment_confirmation',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        status: 'read'
      },
      {
        id: 'msg_002',
        transactionId,
        senderId: 'user_456',
        senderName: 'Jane Smith',
        message: 'Thanks for the quick payment!',
        messageType: 'text',
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        status: 'delivered'
      },
      {
        id: 'msg_003',
        transactionId,
        senderId: 'system',
        senderName: 'KotaPay',
        message: 'Transaction completed successfully',
        messageType: 'system',
        timestamp: new Date().toISOString(),
        status: 'read'
      }
    ];
    
    return mockMessages.slice(offset, offset + limit);
  }

  async markMessagesAsRead(threadId: string, userId: string): Promise<void> {
    console.log(`👁️ Marking messages as read for user ${userId} in thread ${threadId}`);
    // In production, update message status in database
  }

  async getChatThreads(userId: string): Promise<ChatThread[]> {
    // Mock implementation - in production, query from database
    return [];
  }
}

export const socialFeaturesService = new SocialFeaturesService();
export default socialFeaturesService;
