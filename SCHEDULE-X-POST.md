# 📱 Schedule Daily X Post Email

This script runs daily, reads recent git commits, drafts a build-in-public post using the project's X post template, and emails it to you for review before posting.

## Quick test first

```bash
cd C:\Users\Administrator\Desktop\qr_menue
node scripts\daily-x-post.js "Your custom note here"
```

You should receive the draft email within a few seconds. If it fails, check:
- Gmail App Password is correct (the one you shared)
- Less secure app access or 2FA settings

## Schedule with Windows Task Scheduler

1. **Open Task Scheduler**
   - Press `Win + R`, type `taskschd.msc`, press Enter

2. **Create a Basic Task**
   - Click **Create Basic Task** in the right panel
   - Name: `Digitalmenue Daily X Post`
   - Description: `Daily build-in-public post draft email`
   - Click **Next**

3. **Trigger — Daily at 9:00 AM**
   - Select **Daily**
   - Start: today's date
   - Time: `09:00:00`
   - Recur every: `1` days
   - Click **Next**

4. **Action — Start a program**
   - Action: **Start a program**
   - Program/script: `C:\Users\Administrator\Desktop\qr_menue\scripts\daily-x-post.bat`
   - Start in: `C:\Users\Administrator\Desktop\qr_menue`
   - Click **Next**

5. **Finish**
   - Review and click **Finish**

## Testing the scheduled task

Right-click the task → **Run** — it should run immediately and send you an email.

## Optional: Run at a different time

Edit the trigger and change the time. Recommended: 9:00 AM or 10:00 AM after you've started working, so recent commits are captured.

## Changing the Gmail password

Edit `scripts/daily-x-post.bat` and update the `GMAIL_USER` and `GMAIL_APP_PASS` lines.
