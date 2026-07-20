#!/usr/bin/env node
/**
 * Daily X Post Generator — Digitalmenue.com
 *
 * Reads recent git activity, drafts a build-in-public post, and emails
 * it to the founder.
 *
 * Schedule via Windows Task Scheduler (see: ../SCHEDULE-X-POST.md)
 *
 * Usage:
 *   node scripts/daily-x-post.js "Optional custom message about today's work"
 */

const nodemailer = require('nodemailer');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// ─── Config ──────────────────────────────────────────────────────────
const CONFIG = {
  email: {
    from: process.env.X_POST_FROM || 'Digitalmenue X Post <founder@digitalmenue.com>',
    to: process.env.X_POST_TO || '',
    subject: '📱 Daily X Post Draft — Digitalmenue.com',
  },
  // Uses env vars so credentials stay out of the codebase.
  GMAIL_USER: process.env.GMAIL_USER || '',
  GMAIL_APP_PASS: process.env.GMAIL_APP_PASS || '',
  repoPath: path.resolve(__dirname, '..'),
  dayCounterPath: path.resolve(__dirname, '..', '.x-post-day.json'),
};

// ─── Git helpers ─────────────────────────────────────────────────────
function runGit(args) {
  try {
    return execSync(`git ${args}`, {
      cwd: CONFIG.repoPath,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 15000,
    }).trim();
  } catch (e) {
    console.error(`[git] Warning: git ${args} failed —`, e.message.slice(0, 200));
    return '';
  }
}

// ─── Get today's work summary ────────────────────────────────────────
function getTodayWork() {
  const today = new Date();
  const since = new Date(today);
  since.setHours(0, 0, 0, 0);

  // Handle different timezone offsets: use local midnight
  const sinceStr = since.toISOString().replace('T', ' ').slice(0, 19);
  const yesterdayStr = new Date(since.getTime() - 86400000)
    .toISOString()
    .replace('T', ' ')
    .slice(0, 19);

  // Get today's commits (local timezone-aware)
  let commits = runGit(`log --oneline --since="${sinceStr}" --until="${new Date().toISOString().replace('T', ' ').slice(0, 19)}"`);
  if (!commits) {
    // If no commits today, get yesterday's (for morning runs before first commit)
    commits = runGit(`log --oneline --since="${yesterdayStr}" --until="${sinceStr}"`);
    if (commits) commits = `[Yesterday's commits]\n${commits}`;
  }
  if (!commits) {
    // Fallback: last 5 commits (for first-ever run or days off)
    commits = runGit(`log --oneline -5 --format="%h %s"`);
    if (commits) commits = `[Recent commits]\n${commits}`;
  }

  // Get recent changed files (last 3 commits)
  const changedFiles = runGit(`diff --name-only HEAD~3..HEAD -- .`);
  const commitMessages = runGit(`log --oneline -5 --format="%h %s"`);

  return { commits: commits || 'No commits today', changedFiles, commitMessages };
}

// ─── Day counter (persisted, auto-incrementing) ──────────────────────
function getDay() {
  try {
    const data = JSON.parse(fs.readFileSync(CONFIG.dayCounterPath, 'utf-8'));
    const today = new Date().toISOString().slice(0, 10);
    if (data.date === today) return data.day; // already ran today, reuse
    return data.day + 1;                       // new day, increment
  } catch {
    return 1;                                  // first-ever run
  }
}

function saveDayCounter(day) {
  const today = new Date().toISOString().slice(0, 10);
  fs.writeFileSync(CONFIG.dayCounterPath, JSON.stringify({ date: today, day }), 'utf-8');
}

// ─── Draft the post ──────────────────────────────────────────────────
function draftPost(work, customMessage) {
  const lines = work.commits.split('\n').filter(Boolean);
  const today = new Date();

  const day = getDay();
  saveDayCounter(day);

  const dateStr = today.toLocaleDateString('en-PK', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Extract what was shipped from commit messages
  const features = [];
  const fixes = [];

  const cleanMsg = (raw) => {
    return raw
      .replace(/^[a-f0-9]+\s+/, '')                // strip commit hash
      .replace(/^(feat|feature|fix|chore|refactor|docs|style|test|perf|ci|build)(\([^)]+\))?:\s*/i, '') // strip conventional commit prefix
      .replace(/^fix\s*/i, '')
      .trim();
  };

  for (const line of lines) {
    const msg = cleanMsg(line);
    if (!msg) continue;
    // Categorize based on original line
    const raw = line.replace(/^[a-f0-9]+\s+/, '');
    if (/feat|feature|add|new/i.test(raw)) {
      features.push(msg);
    } else if (/fix|improve/i.test(raw)) {
      fixes.push(msg);
    } else if (/chore|refactor|ci|build/i.test(raw)) {
      fixes.push(msg);  // treat infrastructure work as a fix/improvement
    }
  }

  // Build the "Improved" line
  let improvedItems = [];
  if (features.length) {
    improvedItems.push(...features.slice(0, 2));
  }
  if (fixes.length) {
    improvedItems.push(...fixes.slice(0, 1));
  }
  if (customMessage) {
    improvedItems.push(customMessage);
  }

  if (!improvedItems.length) {
    improvedItems.push('general improvements across the platform');
  }

  const improved = improvedItems.slice(0, 3).join(', ');

  // Pick hook style based on day number to rotate
  const hooks = [
    'If you run a restaurant in Pakistan — free trial is open, no card needed: https://www.digitalmenue.com/signup/restaurant',
    'Curious what a QR + WhatsApp menu looks like for your restaurant? Try it free: https://www.digitalmenue.com/signup/restaurant',
    'Know a restaurant owner tired of app commissions? Send them this: https://www.digitalmenue.com/signup/restaurant',
    'Building this in public — the product itself is free to try: https://www.digitalmenue.com/signup/restaurant',
  ];
  const hook = hooks[(day - 1) % hooks.length];

  // Build post
  let post = `Day ${day} building Digitalmenue.com 🇵🇰\n\n`;
  post += `✅ Improved: ${improved}\n`;
  post += `⏳ Pending: continuing to iterate, more updates soon\n\n`;
  post += hook;
  post += `\n\n#buildinpublic #Pakistan #SaaS #restauranttech`;

  return { post, day, dateStr };
}

// ─── Send email ──────────────────────────────────────────────────────
async function sendEmail(draft) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: CONFIG.GMAIL_USER,
      pass: CONFIG.GMAIL_APP_PASS,
    },
  });

  const mailOptions = {
    from: CONFIG.email.from,
    to: CONFIG.email.to,
    subject: `${CONFIG.email.subject} (Day ${draft.day})`,
    text: `☕ Daily X Post Draft — ${draft.dateStr}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Your draft post is ready. Review, tweak, and post on X:

${'─'.repeat(60)}

${draft.post}

${'─'.repeat(60)}

Reply to change/review before posting.
────────────────────────────────

PRO TIP:
• Open https://x.com/compose/post and paste the above
• If today was quiet, just shorten the "Improved" line
• Wait at least 1 hour after the last commit for accurate summary
`,
    html: `
      <div style="font-family: -apple-system, sans-serif; max-width: 540px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #000; margin: 0 0 4px;">☕ Daily X Post Draft</h2>
        <p style="color: #666; margin: 0 0 20px;">${draft.dateStr}</p>

        <div style="background: #f5f5f5; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
          <pre style="white-space: pre-wrap; font-family: inherit; margin: 0; line-height: 1.6;">${draft.post}</pre>
        </div>

        <p style="color: #888; font-size: 13px;">
          ⏳ <strong>Pro tip:</strong> If today was quiet, shorten the "Improved" line.<br>
          Open <a href="https://x.com/compose/post" style="color: #1da1f2;">X.com</a> to post.
        </p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
  console.log(`✓ Email sent to ${CONFIG.email.to}`);
}

// ─── Main ────────────────────────────────────────────────────────────
async function main() {
  const customMessage = process.argv[2];
  const work = getTodayWork();

  console.log('📋 Today\'s git activity:');
  console.log(work.commits.slice(0, 500));
  console.log('');

  const draft = draftPost(work, customMessage);
  console.log(`📝 Draft (Day ${draft.day}):\n`);
  console.log(draft.post);
  console.log('');

  try {
    await sendEmail(draft);
    console.log(`\n✅ Daily post draft sent to ${CONFIG.email.to}`);
  } catch (err) {
    console.error('\n❌ Failed to send email:', err.message);
    console.log('\nPost text to copy manually:');
    console.log('─'.repeat(60));
    console.log(draft.post);
    console.log('─'.repeat(60));
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
