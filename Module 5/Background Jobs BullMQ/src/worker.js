'use strict';

const { Worker } = require('bullmq');
const { transporter } = require('./email');
const { connection } = require('./queue');

const worker = new Worker(
  'email',
  async (job) => {
    if (job.name === 'otp') {
      const { to, otp } = job.data;
      await transporter.sendMail({
        from: process.env.SMTP_USER || 'noreply@example.com',
        to,
        subject: 'Your OTP Verification Code',
        text: `Your OTP is: ${otp}. It expires in 10 minutes.`,
        html: `<p>Your OTP is: <strong>${otp}</strong>. It expires in 10 minutes.</p>`,
      });
    }
  },
  { connection }
);

worker.on('completed', (job) => {
  console.log(`Job ${job.id} (${job.name}) completed`);
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} (${job?.name}) failed:`, err.message);
});

module.exports = { worker };
