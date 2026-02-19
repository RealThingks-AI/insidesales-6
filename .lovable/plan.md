
## Remove Leads Module — Full System Update

### Overview
This implements the approved plan to remove the Leads standalone module from the application UI. The `leads` database table and all its data are preserved. All changes are purely at the application layer.

---

### Files to DELETE (14 dead code files)

These files are no longer reachable and will be removed:

| File |
|------|
| `src/pages/Leads.tsx` |
| `src/components/LeadTable.tsx` |
| `src/components/LeadModal.tsx` |
| `src/components/LeadColumnCustomizer.tsx` |
| `src/components/LeadStatusFilter.tsx` |
| `src/components/LeadDeleteConfirmDialog.tsx` |
| `src/components/LeadsHeader.tsx` |
| `src/components/LeadsTable.tsx` |
| `src/components/LeadsTableRefactored.tsx` |
| `src/components/LeadsTableSimple.tsx` |
| `src/hooks/useSecureLeads.tsx` |
| `src/hooks/useLeadDeletion.tsx` |
| `src/hooks/useLeadColumnWidths.tsx` |
| `src/hooks/useSimpleLeadsImportExport.tsx` |

---

### Files to MODIFY (10 files + 1 edge function + 1 DB data change)

**1. `src/App.tsx` — line 30**
Remove `/leads` from `controlledScrollRoutes`:
```
Before: ['/action-items', '/leads', '/contacts', '/deals', '/settings', '/notifications', '/', '/accounts']
After:  ['/action-items', '/contacts', '/deals', '/settings', '/notifications', '/', '/accounts']
```

**2. `src/components/settings/BackupRestoreSettings.tsx` — line 54**
Remove the Leads entry from the `MODULES` array. The screenshot confirms "Leads" appears as the first module backup card — this removes it. The `fetchModuleCounts` function on line 147 also fetches `leads` count — remove `'leads'` from that array too:
```ts
// Remove:
{ id: 'leads', name: 'Leads', icon: FileText, color: 'text-blue-500' },
// From MODULES array (line 54)

// Also update fetchModuleCounts (line 147):
const tables = ['contacts', 'accounts', 'deals', 'action_items'];
// (remove 'leads')
```
The `getBackupLabel` function (line 75) references `MODULES.find(m => m.id === backup.module_name)` — since existing "Leads" backups in history will no longer match, they'll fall back to showing `backup.module_name` ("leads") directly. This is acceptable for historical backups — they'll display as "leads" in the Type column.

**3. `supabase/functions/create-backup/index.ts` — line 18**
Remove the `leads` entry from `MODULE_TABLES`:
```ts
// Remove:
leads: ['leads', 'lead_action_items'],
```
`BACKUP_TABLES` on line 9 keeps `'leads'` and `'lead_action_items'` for full backups.
Edge function will be redeployed automatically.

**4. `src/hooks/useActionItems.tsx` — line 9**
Change the `ModuleType` type:
```ts
// Before:
export type ModuleType = 'deals' | 'leads' | 'contacts';
// After:
export type ModuleType = 'deals' | 'contacts';
```

**5. `src/components/ActionItemModal.tsx` — lines 70-74, 168-169**
- Remove `{ value: 'leads', label: 'Leads' }` from `moduleOptions`
- Remove the `case 'leads'` branch in `getRecordPlaceholder()` (the `default` case already returns 'Select record...' so no fallback gap)

**6. `src/hooks/useModuleRecords.tsx`**
Remove all `case 'leads'` branches from all three hooks:
- `useModuleRecords` (line 24-27): remove leads case
- `useModuleRecordName` (line 65-68): remove leads case
- `useModuleRecordNames` (lines 97, 114-123): remove `leadIds` variable and its fetch block

**7. `src/components/ActionItemsTable.tsx`**
- Remove `LeadModal` import (line 17)
- Remove `leadModalOpen` state (line 102)
- Remove `selectedLead` state (line 105)
- Remove the `leads` branch in `handleLinkedRecordClick` (lines 190-199): when a legacy lead-linked action item icon is clicked, it will silently do nothing (no modal opens) — acceptable for historical data
- Keep the `UserPlus` icon display for `leads` type (line 465) so historical items still render the icon
- Remove the `<LeadModal .../>` JSX block (lines 525-534)

**8. `src/components/NotificationBell.tsx` — lines 57-68**
Update lead-related navigation to redirect to `/deals`:
```ts
// Before:
} else if (notification.module_type === 'leads' && notification.module_id) {
  navigate(`/leads?highlight=${notification.module_id}`);
// After:
} else if (notification.module_type === 'leads' && notification.module_id) {
  navigate(`/deals`);

// Before:
} else if (notification.lead_id) {
  navigate(`/leads?highlight=${notification.lead_id}`);
// After:
} else if (notification.lead_id) {
  navigate(`/deals`);

// Before:
} else if (notification.notification_type === 'lead_update') {
  navigate('/leads');
// After:
} else if (notification.notification_type === 'lead_update') {
  navigate('/deals');
```

**9. `src/components/settings/AuditLogsSettings.tsx` — lines 21, 155, 158**
- Line 21: `type ValidTableName = 'contacts' | 'deals'` (remove `'leads'`)
- Line 155: `['contacts', 'deals'].includes(log.resource_type)` (remove `'leads'`)
- Line 158: `['contacts', 'deals'].includes(t)` (remove `'leads'`)

**10. `src/components/ContactTable.tsx` — lines 196-236, 265**
- Remove the entire `handleConvertToLead` function (lines 196-236)
- Remove `onConvertToLead={handleConvertToLead}` prop passed to `ContactTableBody` (line 265)

**11. `src/components/contact-table/ContactTableBody.tsx` — lines 5, 48, 321-326**
- Remove `UserPlus` from the import (line 5) — only used for "Convert to Lead"
- Remove `onConvertToLead?: (contact: Contact) => void` from the props interface (line 48)
- Remove the "Convert to Lead" `DropdownMenuItem` block (lines 321-326)
- Remove the destructured `onConvertToLead` from the function parameters

---

### Database Data Change

Execute SQL to delete the Leads row from `page_permissions`:
```sql
DELETE FROM page_permissions WHERE route = '/leads';
```
This removes the Leads entry (id: `3e19f050-c9c8-461a-90ca-45d6dfcf5900`) from the Page Access Settings admin panel. The `PageAccessSettings` component dynamically renders from this table, so no code changes are needed there.

---

### What Is Preserved (Not Changed)

- `leads` and `lead_action_items` database tables — data intact
- `BACKUP_TABLES` in edge function — leads still in full backups
- `src/hooks/import-export/leadsCSVExporter.ts` — backward compat with existing backups
- `src/hooks/import-export/leadsCSVProcessor.ts` — backward compat
- `src/hooks/import-export/columnConfig.ts` — backward compat
- `supabase/functions/restore-backup/index.ts` — no change needed
- `supabase/functions/migrate-leads-to-contacts/index.ts` — unrelated
- `src/components/LeadSearchableDropdown.tsx` — used in Deal forms
- `src/components/ConvertToDealModal.tsx` — still valid
- Database triggers — remain active
- `UserPlus` icon in ActionItemsTable — kept for historical lead items display

---

### Execution Order
1. Delete the `page_permissions` DB row (SQL migration)
2. Modify `create-backup` edge function, redeploy
3. Update all 10 frontend files
4. Delete 14 dead code files
