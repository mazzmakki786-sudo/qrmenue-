# 🔑 Key Rotation Plan — QRMenu.pk

**Last Updated**: July 4, 2026

---

## Keys That Need Rotation

| Key | Location | Rotation Frequency | Criticality |
|-----|----------|-------------------|-------------|
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Settings → API | Every 90 days | 🔴 CRITICAL |
| `SUPABASE_ANON_KEY` | Supabase Dashboard → Settings → API | Every 90 days | 🟡 HIGH |
| `RESEND_API_KEY` | Resend Dashboard → API Keys | Every 180 days | 🟡 HIGH |
| `CRON_SECRET` | Vercel Environment Variables | Every 90 days | 🟡 HIGH |
| `SUPER_ADMIN_EMAIL` | Vercel Environment Variables | On compromise only | 🟡 HIGH |

---

## Rotation Procedure

### Supabase Keys (SERVICE_ROLE + ANON)

**Step 1: Generate New Key**
1. Go to Supabase Dashboard → Project Settings → API
2. Click "Reset" on the key you want to rotate
3. Copy the new key immediately (it won't be shown again)

**Step 2: Update Environment Variables**
1. Go to Vercel Dashboard → Project → Settings → Environment Variables
2. Update `SUPABASE_SERVICE_ROLE_KEY` with new value
3. Update `NEXT_PUBLIC_SUPABASE_ANON_KEY` with new value
4. Click "Save"

**Step 3: Redeploy**
```bash
vercel --prod
```

**Step 4: Verify**
1. Test login flow
2. Test order creation
3. Test super admin panel
4. Check for any 401/403 errors in Vercel logs

---

### RESEND_API_KEY

**Step 1: Generate New Key**
1. Go to Resend Dashboard → API Keys
2. Click "Create API Key"
3. Copy the new key

**Step 2: Update Environment Variables**
1. Update `RESEND_API_KEY` in Vercel
2. Redeploy

**Step 3: Verify**
1. Run `/api/test-email` endpoint (dev only)
2. Check email delivery

---

### CRON_SECRET

**Step 1: Generate New Secret**
```bash
openssl rand -hex 32
```

**Step 2: Update Environment Variables**
1. Update `CRON_SECRET` in Vercel
2. Update any external cron services (Vercel Cron, cron-job.org, etc.)
3. Redeploy

**Step 3: Verify**
1. Wait for next cron trigger
2. Check Vercel function logs

---

## Emergency Rotation (Compromise)

If any key is suspected compromised:

1. **Immediately** rotate the key in the provider dashboard
2. Update Vercel environment variables
3. Redeploy immediately
4. Check Vercel logs for unauthorized access
5. Check Supabase logs for unauthorized queries
6. Notify affected users if customer data accessed

---

## Rotation Schedule

| Month | Key to Rotate |
|-------|---------------|
| January | SERVICE_ROLE_KEY, ANON_KEY |
| April | RESEND_API_KEY |
| July | SERVICE_ROLE_KEY, ANON_KEY, CRON_SECRET |
| October | RESEND_API_KEY |

---

## Checklist

- [ ] Set calendar reminders for rotation dates
- [ ] Document any custom integrations using these keys
- [ ] Test all flows after each rotation
- [ ] Keep backup of old keys for 7 days (in case of rollback)
