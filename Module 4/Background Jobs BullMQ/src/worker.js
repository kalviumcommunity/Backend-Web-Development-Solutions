'use strict';

const { Worker } = require('bullmq');
const { connection } = require('./queue');
const { transporter } = require('./email');

const worker = new Worker('email', async (job) => {
  console.log(`[worker] processing job ${job.id}: ${job.name}`);

  if (job.name === 'otp') {
    await transporter.sendMail({
      from: process.env.SMTP_USER || 'noreply@threadbase.app',
      to: job.data.to,
      subject: 'Your verification code',
      text: `Your OTP is: ${job.data.otp}. It expires in 10 minutes. Do not share it.`,
    });
  }

  // Returning without throwing = completed
}, {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 },  // 1s, 2s, 4s
  },
});

worker.on('completed', (job) => {
  console.log(`[worker] job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
  console.error(`[worker] job ${job?.id} failed: ${err.message}`);
});

module.exports = { worker };
