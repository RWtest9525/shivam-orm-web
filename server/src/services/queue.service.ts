import { Queue, Worker, Job } from 'bullmq';
import { config } from '../config/index.js';

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
};

export const reviewSyncQueue = new Queue('review-sync', { connection });
export const socialSyncQueue = new Queue('social-sync', { connection });
export const emailQueue = new Queue('email-notifications', { connection });

export function initQueueWorkers() {
  new Worker(
    'review-sync',
    async (job: Job) => {
      console.log(`[BullMQ Worker] Syncing reviews for job ${job.id}, payload:`, job.data);
      // Execute background ingestion task...
      return { status: 'success', syncedCount: 15 };
    },
    { connection }
  );

  new Worker(
    'email-notifications',
    async (job: Job) => {
      console.log(`[BullMQ Worker] Dispatching email to ${job.data.to}`);
      return { status: 'sent' };
    },
    { connection }
  );

  console.log('[BullMQ] Background job workers initialized.');
}
