

## Upgrade History Section to Match Action Items Layout

### Overview
Enhance the History section in the Deal Expanded Panel to be feature-rich and visually consistent with the Action Items section. Following CRM industry standards (Salesforce Activity Timeline, HubSpot Activity Feed), the History table will get interactive columns, filtering, inline actions, and consistent styling.

### Current State
The History section is a simple read-only table with columns: Time | Type | By | Changes | View button. No filtering, no inline editing, no selection, no type filtering.

### Proposed Changes

**File: `src/components/DealExpandedPanel.tsx`**

#### 1. Add New State Variables
- `selectedLogIds: string[]` -- checkbox selection for bulk actions
- `historyTypeFilter: string` -- filter by log type (All, Note, Call, Meeting, Email, Update)
- `historySortDirection: 'asc' | 'desc'` -- toggle sort order for history

#### 2. Add History Filter & Sort Logic
- Filter audit logs by `historyTypeFilter` before rendering
- Sort by `created_at` based on `historySortDirection`
- Add a type filter dropdown in the History collapsible header (next to Add Log button)

#### 3. Upgrade History Table Header
Replace current simple headers with the Action Items style:
- **Checkbox column** (w-7) -- select all / individual, matching Action Items pattern
- **Type column** (6.67% width) -- colored dot with tooltip (like Status/Priority dots), matching the 20% rule
- **Changes column** (flex) -- clickable text in blue (`text-[#2e538e]`), opens detail dialog on click
- **By column** (w-20) -- user display name, truncated
- **Time column** (w-24) -- formatted date/time
- **Actions column** (w-8) -- `...` dropdown with View Details, Delete options (on hover)

#### 4. Upgrade History Table Rows
- Add checkbox per row
- Type column: colored dot only (Note=yellow, Call=blue, Meeting=purple, Email=green, System=gray) with tooltip showing label -- exactly like Status/Priority dots in Action Items
- Changes column: clickable blue text, opens the detail dialog
- Actions column: `...` dropdown (MoreHorizontal) appearing on hover with:
  - "View Details" -- opens the existing detail dialog
  - "Delete" -- deletes the log entry (with confirmation)
- Row hover highlight matching Action Items (`hover:bg-muted/30`)
- Selected row highlight (`bg-primary/5`)

#### 5. Add Bulk Actions for History
- When logs are selected, show count and "Delete Selected" option
- Uses same pattern as Action Items bulk selection

#### 6. Add Delete Log Handler
- `handleDeleteLog(id)` -- deletes from `security_audit_log` table and invalidates query
- `handleBulkDeleteLogs()` -- bulk delete selected logs

#### 7. History Header Enhancements
Add to the collapsible header bar (alongside existing Add Log and Refresh buttons):
- Type filter dropdown (small inline select): All | Note | Call | Meeting | Email | System
- Sort toggle button (ascending/descending by time)

### Column Layout Mapping (History vs Action Items)

```text
Action Items:  [Checkbox] [Task]       [Assigned To] [Due Date] [Status 6.67%] [Priority 6.67%] [Module 6.67%] [Actions]
History:       [Checkbox] [Changes]    [By]          [Time]     [Type 6.67%]                                    [Actions]
```

The Type column uses the same 6.67% width with dot+tooltip pattern. The remaining columns distribute naturally.

### Technical Details

- Type dots reuse the same `TooltipProvider > Tooltip > TooltipTrigger > Select` pattern from Action Items
- Type dot colors: `{ Note: 'bg-yellow-500', Call: 'bg-blue-500', Meeting: 'bg-purple-500', Email: 'bg-green-500', update: 'bg-gray-400', create: 'bg-emerald-500' }`
- Delete handler: `supabase.from('security_audit_log').delete().eq('id', id)` with query invalidation
- Filtering is done client-side on the already-fetched `auditLogs` array
- All text sizes remain `text-[10px]` / `text-[11px]` / `text-xs` to fit the panel
- The styled table matches the Action Items section exactly in padding, row height, and hover behavior

