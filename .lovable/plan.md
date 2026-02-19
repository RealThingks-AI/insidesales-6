

## Remove Leads Module and Update Entire System

### Overview
The Leads module has been removed as a standalone page, and lead-related fields are now part of the Deals module's Lead stage. This requires updates across the entire app: routing, sidebar, import/export, backup/restore, action items, notifications, audit logs, page access, and administration sections.

### Scope of Changes

The `leads` database table and data remain intact (deals reference lead data via Lead stage fields). The changes are purely at the **application layer** -- removing the standalone Leads module UI and updating all references throughout the codebase.

---

### 1. Routing and Navigation (Already Partially Done)

**`src/App.tsx`**
- The `/leads` route already redirects to `/deals` -- no change needed
- Remove `/leads` from `controlledScrollRoutes` array (line 30) since the page no longer exists

**`src/components/AppSidebar.tsx`**
- Already has no "Leads" menu item -- no change needed

---

### 2. Backup & Restore System

**`src/components/settings/BackupRestoreSettings.tsx`**
- Remove the "Leads" entry from the `MODULES` array (line 54) so it no longer appears as a separate module backup option
- The leads table data will still be backed up as part of "Full System Backup" (handled by the edge function which backs up all tables)

**`supabase/functions/create-backup/index.ts`**
- Keep `leads` in `BACKUP_TABLES` (line 9) so full backups still capture the data
- Remove the `leads: ['leads', 'lead_action_items']` entry from `MODULE_TABLES` (line 18) since standalone module backup for leads is no longer needed

**`supabase/functions/restore-backup/index.ts`**
- No changes needed -- it restores whatever tables exist in a backup file, including leads

---

### 3. Import/Export System

**`src/hooks/import-export/columnConfig.ts`**
- Keep the `leads` config entry (needed for backup/restore and any legacy CSV processing)
- No changes needed

**`src/hooks/useSimpleLeadsImportExport.tsx`**
- This hook is only used by the Leads page. Since the Leads page is being removed, this file becomes dead code. Mark for cleanup but no functional breakage.

**`src/hooks/import-export/leadsCSVExporter.ts`** and **`src/hooks/import-export/leadsCSVProcessor.ts`**
- Same as above -- dead code since they're only called from the Leads module. Keep for now (backward compatibility with existing backups).

---

### 4. Action Items Module

**`src/hooks/useActionItems.tsx`**
- Remove `'leads'` from the `ModuleType` type (line 9): change to `'deals' | 'contacts'`
- This ensures new action items can only be linked to deals or contacts

**`src/components/ActionItemModal.tsx`**
- Remove the `{ value: 'leads', label: 'Leads' }` entry from `moduleOptions` (line 72)
- Remove the `case 'leads'` placeholder text (line 168-169)

**`src/hooks/useModuleRecords.tsx`**
- Remove the `case 'leads'` branches (lines 24-26, 64-66, 97-98, 114-120)
- Existing action items linked to leads will show as "Unknown" record -- this is acceptable for historical data

**`src/components/ActionItemsTable.tsx`**
- Remove the `leads` case in the click handler (lines 190-201) that opens a LeadModal
- Remove the LeadModal import (line 17)
- Keep the icon display for `leads` type items (line 465) so historical items still render correctly

---

### 5. Notifications

**`src/components/NotificationBell.tsx`**
- Update the leads navigation case (line 57-58): change `navigate('/leads?highlight=...')` to `navigate('/deals?highlight=...')` since lead-related notifications should now redirect to deals

**`src/hooks/useNotifications.tsx`**
- No changes needed -- notification data model is generic

**Database triggers** (`create_lead_notification`, `create_action_item_notification`)
- Keep these triggers active -- they still fire on the `leads` table and create valid notifications. The notification routing change above handles the redirect.

---

### 6. Administration -- Page Access Settings

**Database: `page_permissions` table**
- Delete the "Leads" row (route `/leads`) from `page_permissions` since the page no longer exists
- This is a data change (not schema), so use the insert tool with a DELETE statement

**`src/components/settings/PageAccessSettings.tsx`**
- No code changes needed -- it dynamically renders whatever rows exist in `page_permissions`

---

### 7. Administration -- Admin Settings Page

**`src/components/settings/AdminSettingsPage.tsx`**
- No structural changes needed -- the tabs (Users, Access, Logs, System, Reports) remain the same

---

### 8. Audit Logs

**`src/components/settings/AuditLogsSettings.tsx`**
- Remove `'leads'` from the `ValidTableName` type (line 21): change to `'contacts' | 'deals'`
- Update the revert capability check (line 155): remove `'leads'` from the array
- Update `isValidTableName` (line 158): remove `'leads'`
- Historical audit logs for leads will still display but won't have revert capability

---

### 9. Other Components Referencing Leads

**`src/components/ContactTable.tsx`**
- Has a "Convert to Lead" feature (line 221) that inserts into the `leads` table. This should be removed since there's no standalone Leads module anymore.

**`src/components/ConvertToDealModal.tsx`**
- This converts a lead to a deal. Keep this component -- it's still valid for existing lead data and the Lead stage within deals.

**`src/components/LeadSearchableDropdown.tsx`**
- Keep this component -- it's used in Deal forms (Lead stage) to link deals to existing lead records

**`src/hooks/useSecureLeads.tsx`**
- Dead code since Leads page is removed. Mark for cleanup.

**`src/hooks/useLeadDeletion.tsx`**
- Dead code since Leads page is removed. Mark for cleanup.

---

### 10. Dead Code Cleanup

The following files are no longer reachable and should be removed to keep the codebase clean:
- `src/pages/Leads.tsx`
- `src/components/LeadTable.tsx`
- `src/components/LeadModal.tsx`
- `src/components/LeadColumnCustomizer.tsx`
- `src/components/LeadStatusFilter.tsx`
- `src/components/LeadDeleteConfirmDialog.tsx`
- `src/components/LeadsHeader.tsx`
- `src/components/LeadsTable.tsx`
- `src/components/LeadsTableRefactored.tsx`
- `src/components/LeadsTableSimple.tsx`
- `src/hooks/useSecureLeads.tsx`
- `src/hooks/useLeadDeletion.tsx`
- `src/hooks/useLeadColumnWidths.tsx`
- `src/hooks/useSimpleLeadsImportExport.tsx`

---

### Summary of Active Code Changes

| Area | File | Change |
|------|------|--------|
| Routing | `src/App.tsx` | Remove `/leads` from controlledScrollRoutes |
| Backup UI | `BackupRestoreSettings.tsx` | Remove "Leads" from MODULES array |
| Backup Edge Fn | `create-backup/index.ts` | Remove `leads` from MODULE_TABLES |
| Action Items | `useActionItems.tsx` | Remove `'leads'` from ModuleType |
| Action Items | `ActionItemModal.tsx` | Remove leads from module options |
| Action Items | `useModuleRecords.tsx` | Remove leads cases |
| Action Items | `ActionItemsTable.tsx` | Remove lead click handler, keep icon |
| Notifications | `NotificationBell.tsx` | Redirect leads notifications to /deals |
| Audit Logs | `AuditLogsSettings.tsx` | Remove leads from valid table names |
| Contacts | `ContactTable.tsx` | Remove "Convert to Lead" feature |
| DB Data | `page_permissions` | Delete the Leads row |
| Dead Code | 14 files | Remove unused Leads-specific files |

### Technical Notes

- The `leads` database table is **not** being dropped -- it contains existing data that may be referenced by deals, action items, and notifications
- The `lead_action_items` table remains for historical data
- Database triggers on the leads table remain active for backward compatibility
- The edge function `migrate-leads-to-contacts` is unrelated to this change and stays
- All import/export configs for leads remain in `columnConfig.ts` for backward compatibility with existing backups

