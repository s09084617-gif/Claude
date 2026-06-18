/**
 * FitWid.fit — Daily Workout Reminder via Zernio WhatsApp API
 * ─────────────────────────────────────────────────────────────
 * Runs every morning at 7:00 AM IST (Asia/Kolkata).
 * Reads all clients from Firebase RTDB, finds each person's
 * workout for today, and sends a personalised WhatsApp message
 * through Zernio's Broadcasts API.
 *
 * REQUIRED ENVIRONMENT VARIABLES (set via Firebase CLI):
 *   firebase functions:secrets:set ZERNIO_API_KEY
 *   firebase functions:secrets:set ZERNIO_ACCOUNT_ID
 *   firebase functions:secrets:set ZERNIO_TEMPLATE_NAME   (e.g. "daily_workout")
 *
 * ZERNIO SETUP (one-time, do this in your Zernio dashboard):
 *   1. Connect your WhatsApp Business number under "Accounts".
 *   2. Create a message template named "daily_workout" (or whatever
 *      you set for ZERNIO_TEMPLATE_NAME) with one body variable:
 *        Template body: "{{1}}"
 *        Category: UTILITY
 *   3. Wait for Meta to approve the template (~24 h).
 *   4. Copy your API key from Settings → API Keys.
 *   5. Copy your Account ID from Settings → Accounts.
 *
 * DEPLOY:
 *   npm install -g firebase-tools
 *   firebase login
 *   firebase use fitness-b506f
 *   cd functions && npm install
 *   firebase deploy --only functions
 */

'use strict';

const { onSchedule } = require('firebase-functions/v2/scheduler');
const { logger }     = require('firebase-functions');
const admin          = require('firebase-admin');
const axios          = require('axios');

admin.initializeApp();
const db = admin.database();

const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const ZERNIO_BASE = 'https://zernio.com/api/v1';

// ─── helpers ────────────────────────────────────────────────────────────────

function zernioHeaders(apiKey) {
  return {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  };
}

function normalisePhone(raw) {
  const digits = String(raw).replace(/\D/g, '');
  return digits.startsWith('+') ? digits : `+${digits}`;
}

function buildWorkoutText(client, today) {
  const wp      = client.workoutPlan || {};
  const dayData = (wp.days || {})[today] || null;

  if (!dayData || !dayData.exercises || !dayData.exercises.length) return null;

  const name    = (client.name || 'Hey').split(' ')[0];
  const focus   = dayData.focus || wp.split || 'Training';

  let lines = [];
  lines.push(`🏋️ *${name}!* Time to train — *${today}*`);
  lines.push('');
  lines.push(`🎯 Focus: *${focus}*`);
  lines.push('');

  dayData.exercises.forEach((ex, i) => {
    const rest = ex.rest ? ` | rest ${ex.rest}` : '';
    lines.push(`${i + 1}. *${ex.name}* — ${ex.sets} × ${ex.reps}${rest}`);
  });

  lines.push('');
  lines.push('💪 Let\'s crush it! — Coach Sahil');

  return lines.join('\n');
}

// ─── main scheduled function ─────────────────────────────────────────────────

exports.dailyWorkoutReminder = onSchedule(
  {
    schedule:   '0 7 * * *',       // 7:00 AM
    timeZone:   'Asia/Kolkata',    // IST
    secrets:    ['ZERNIO_API_KEY', 'ZERNIO_ACCOUNT_ID', 'ZERNIO_TEMPLATE_NAME'],
    memory:     '256MiB',
    timeoutSeconds: 120,
  },
  async (event) => {
    const apiKey      = process.env.ZERNIO_API_KEY;
    const accountId   = process.env.ZERNIO_ACCOUNT_ID;
    const templateName = process.env.ZERNIO_TEMPLATE_NAME || 'daily_workout';

    if (!apiKey || !accountId) {
      logger.error('Missing ZERNIO_API_KEY or ZERNIO_ACCOUNT_ID secrets');
      return;
    }

    const today = DAYS[new Date().getDay()];
    logger.info(`Running daily workout reminder for ${today}`);

    // ── 1. Fetch all clients ──────────────────────────────────────
    const snap    = await db.ref('clients').once('value');
    const clients = snap.val() || {};

    const toSend = []; // { phone, text }

    for (const [key, client] of Object.entries(clients)) {
      if (!client.pin) continue; // incomplete / test records

      const phone = normalisePhone(client.phone || key);
      if (phone.replace(/\D/g, '').length < 10) continue; // invalid number

      const text = buildWorkoutText(client, today);
      if (!text) continue; // rest day or no plan set

      toSend.push({ phone, text });
    }

    if (!toSend.length) {
      logger.info(`No clients with workouts scheduled for ${today}`);
      return;
    }

    logger.info(`Sending to ${toSend.length} client(s)`);

    // ── 2. Create a Zernio broadcast ─────────────────────────────
    const broadcastRes = await axios.post(
      `${ZERNIO_BASE}/broadcasts`,
      {
        accountId,
        platform: 'whatsapp',
        name: `Daily Workout · ${today} · ${new Date().toISOString().slice(0, 10)}`,
        template: {
          name:     templateName,
          language: 'en',
        },
      },
      { headers: zernioHeaders(apiKey) }
    );

    const broadcastId = broadcastRes.data.id || broadcastRes.data.data?.id;
    logger.info(`Broadcast created: ${broadcastId}`);

    // ── 3. Add recipients with personalised variable ──────────────
    //   Zernio template variable {{1}} receives the full workout text
    const BATCH = 100;
    for (let i = 0; i < toSend.length; i += BATCH) {
      const batch = toSend.slice(i, i + BATCH);

      await axios.post(
        `${ZERNIO_BASE}/broadcasts/${broadcastId}/recipients`,
        {
          recipients: batch.map(r => ({
            phone:     r.phone,
            variables: { '1': r.text },
          })),
        },
        { headers: zernioHeaders(apiKey) }
      );
    }

    // ── 4. Trigger the send ───────────────────────────────────────
    await axios.post(
      `${ZERNIO_BASE}/broadcasts/${broadcastId}/send`,
      {},
      { headers: zernioHeaders(apiKey) }
    );

    logger.info(`✅ Workout reminders dispatched for ${today}`);
  }
);
