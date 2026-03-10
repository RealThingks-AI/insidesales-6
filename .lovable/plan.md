

## Plan: Email Center Improvements

### 1. Create `email_history` table (DB migration)

Create the `email_history` table with columns needed by both History and Analytics:

```sql
CREATE TABLE public.email_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_email text NOT NULL,
  recipient_name text,
  sender_email text NOT NULL,
  subject text NOT NULL,
  body text,
  status text NOT NULL DEFAULT 'sent',
  sent_at timestamptz NOT NULL DEFAULT now(),
  sent_by uuid REFERENCES auth.users(id),
  open_count integer DEFAULT 0,
  unique_opens integer DEFAULT 0,
  is_valid_open boolean DEFAULT true,
  opened_at timestamptz,
  clicked_at timestamptz,
  click_count integer DEFAULT 0,
  contact_id uuid,
  lead_id uuid,
  account_id uuid,
  bounce_type text,
  bounce_reason text,
  bounced_at timestamptz,
  reply_count integer DEFAULT 0,
  replied_at timestamptz,
  last_reply_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.email_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own emails" ON public.email_history
  FOR SELECT TO authenticated USING (sent_by = auth.uid());
CREATE POLICY "Users can insert their own emails" ON public.email_history
  FOR INSERT TO authenticated WITH CHECK (sent_by = auth.uid());
CREATE POLICY "Users can update their own emails" ON public.email_history
  FOR UPDATE TO authenticated USING (sent_by = auth.uid());
```

### 2. Update Daily Action Reminders email template

**File: `supabase/functions/daily-action-reminders/index.ts`**

Update `buildReminderEmail` to:
- Split action items into 3 categories: **Overdue** (red background `#FEF2F2`), **Due within 1 week** (yellow background `#FFFBEB`), **Due in more than 1 week** (green background `#F0FDF4`)
- Render 3 separate tables, each with a colored section header
- Increase the email container width from `600px` to `800px` to reduce text wrapping
- Each table has its own category header bar (e.g., "🔴 Overdue Items (3)", "🟡 Due This Week (2)", "🟢 Upcoming Items (4)")

### 3. Build Email History component

**File: `src/components/settings/EmailHistorySettings.tsx`**

Build a simplified but fully functional version based on the reference file, adapted to work without missing dependencies (`EmailReplyModal`, `OutlookEmailBody`, `emailUtils`, `useProfiles`):

- Stats cards (Total Sent, Bounced, Opened, Replied, Open Rate) -- clickable to filter
- Filter bar: search, date range, entity type, status filters
- Refresh + Export CSV buttons
- Paginated table: Recipient, Subject, Type, Sent At, Status, Opens, Replies
- Email detail dialog on row click (from/to/subject, status, content, bounce info)
- No reply/bounce-sync features (those require edge functions not present)

### 4. Build Email Analytics component

**File: `src/components/settings/EmailAnalyticsDashboard.tsx`**

Port the reference file directly -- it's self-contained and only needs the `email_history` table:

- Summary cards (Emails Sent, Open Rate, Total Opens, Bounced, Replied)
- Date range selector (7/30/90 days)
- Line chart: Email Activity Over Time (sent, opened, bounced, replied)
- Pie chart: Status Distribution
- Bar chart: Daily Engagement (last 14 days)
- CSV export of daily stats

### 5. Update EmailCenterPage to load real components

**File: `src/components/settings/EmailCenterPage.tsx`**

Replace the placeholder History and Analytics tabs with lazy-loaded imports of the new real components.

### 6. Record emails sent by the daily-action-reminders function

**File: `supabase/functions/daily-action-reminders/index.ts`**

After successfully sending an email via Graph API, insert a record into `email_history` so the History and Analytics tabs can display reminder emails.

