/**
 * KotaPay Scheduled Tasks Configuration
 * 
 * Manages automated settlement and reconciliation processes
 */

import { settlementService } from '../services/SettlementService';
import { securityService } from '../services/SecurityService';
import { notificationService } from '../services/notifications';

export interface ScheduledTask {
  name: string;
  schedule: string; // Cron expression
  enabled: boolean;
  lastRun?: string;
  nextRun?: string;
  status: 'idle' | 'running' | 'failed';
}

class TaskScheduler {
  private tasks: ScheduledTask[] = [
    {
      name: 'nightly_reconciliation',
      schedule: '0 2 * * *', // 2 AM daily
      enabled: true,
      status: 'idle'
    },
    {
      name: 'settlement_queue_processing',
      schedule: '*/15 * * * *', // Every 15 minutes
      enabled: true,
      status: 'idle'
    },
    {
      name: 'security_metrics_cleanup',
      schedule: '0 0 * * 0', // Weekly on Sunday
      enabled: true,
      status: 'idle'
    },
    {
      name: 'transaction_monitoring',
      schedule: '*/5 * * * *', // Every 5 minutes
      enabled: true,
      status: 'idle'
    }
  ];

  constructor() {
    this.initializeScheduler();
  }

  private initializeScheduler(): void {
    console.log('🕒 Initializing KotaPay Task Scheduler...');
    
    // In production, use a proper cron library like node-cron
    // For development, we'll simulate with intervals
    this.simulateScheduledTasks();
  }

  private simulateScheduledTasks(): void {
    // Simulate nightly reconciliation (run every 30 seconds in dev)
    setInterval(async () => {
      await this.executeTask('nightly_reconciliation');
    }, 30000);

    // Simulate settlement queue processing (run every 10 seconds in dev)
    setInterval(async () => {
      await this.executeTask('settlement_queue_processing');
    }, 10000);

    // Simulate security monitoring (run every 15 seconds in dev)
    setInterval(async () => {
      await this.executeTask('transaction_monitoring');
    }, 15000);

    console.log('✅ Task scheduler initialized with development intervals');
  }

  async executeTask(taskName: string): Promise<void> {
    const task = this.tasks.find(t => t.name === taskName);
    
    if (!task || !task.enabled) {
      return;
    }

    if (task.status === 'running') {
      console.log(`⏭️ Skipping ${taskName} - already running`);
      return;
    }

    try {
      task.status = 'running';
      task.lastRun = new Date().toISOString();
      
      console.log(`▶️ Executing task: ${taskName}`);

      switch (taskName) {
        case 'nightly_reconciliation':
          await settlementService.runNightlyReconciliation();
          break;
          
        case 'settlement_queue_processing':
          await settlementService.processSettlementQueue();
          break;
          
        case 'security_metrics_cleanup':
          await this.cleanupSecurityMetrics();
          break;
          
        case 'transaction_monitoring':
          await this.monitorTransactions();
          break;
          
        default:
          console.warn(`Unknown task: ${taskName}`);
      }

      task.status = 'idle';
      console.log(`✅ Task completed: ${taskName}`);
      
    } catch (error) {
      task.status = 'failed';
      console.error(`❌ Task failed: ${taskName}`, error);
      
      // Send alert for critical task failures
      if (['nightly_reconciliation', 'settlement_queue_processing'].includes(taskName)) {
        await notificationService.sendSecurityAlert(
          'scheduled_task_failed',
          `Critical task failed: ${taskName}`,
          { error: error instanceof Error ? error.message : 'Unknown error' }
        );
      }
    }
  }

  private async cleanupSecurityMetrics(): Promise<void> {
    console.log('🧹 Cleaning up old security metrics...');
    
    // Clean up old device binding data
    await securityService.cleanupOldDeviceBindings();
    
    // Clean up old velocity tracking data
    await securityService.cleanupOldVelocityData();
    
    console.log('✅ Security metrics cleanup completed');
  }

  private async monitorTransactions(): Promise<void> {
    console.log('👁️ Monitoring transactions for suspicious activity...');
    
    try {
      // Check for suspicious transaction patterns
      const suspiciousUsers = await securityService.detectSuspiciousPatterns();
      
      if (suspiciousUsers.length > 0) {
        console.log(`🚨 Found ${suspiciousUsers.length} users with suspicious activity`);
        
        for (const userId of suspiciousUsers) {
          await notificationService.sendSecurityAlert(
            'suspicious_activity_detected',
            'Suspicious transaction pattern detected',
            { userId, timestamp: new Date().toISOString() }
          );
        }
      }
      
    } catch (error) {
      console.error('Error monitoring transactions:', error);
    }
  }

  getTaskStatus(): ScheduledTask[] {
    return this.tasks.map(task => ({
      ...task,
      nextRun: this.calculateNextRun(task.schedule)
    }));
  }

  private calculateNextRun(cronExpression: string): string {
    // Simplified next run calculation for development
    // In production, use a proper cron parser
    const now = new Date();
    const nextRun = new Date(now.getTime() + 60000); // Next minute for demo
    return nextRun.toISOString();
  }

  enableTask(taskName: string): void {
    const task = this.tasks.find(t => t.name === taskName);
    if (task) {
      task.enabled = true;
      console.log(`✅ Task enabled: ${taskName}`);
    }
  }

  disableTask(taskName: string): void {
    const task = this.tasks.find(t => t.name === taskName);
    if (task) {
      task.enabled = false;
      console.log(`❌ Task disabled: ${taskName}`);
    }
  }

  async runTaskManually(taskName: string): Promise<void> {
    console.log(`🔧 Running task manually: ${taskName}`);
    await this.executeTask(taskName);
  }
}

export const taskScheduler = new TaskScheduler();
export default taskScheduler;
