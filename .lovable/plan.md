

## Replicate Action Items Module Layout in Deal Expanded Panel

### Overview
Replace the current simple action items table in `DealExpandedPanel.tsx` (lines 474-541) with the same column header layout, inline editing, and styling used in the main Action Items module (`ActionItemsTable.tsx`).

### What Changes

**File: `src/components/DealExpandedPanel.tsx`**

1. **Add missing imports**: `Checkbox`, `DropdownMenu` components, `MoreHorizontal`, `Trash2`, `CheckCircle`, `Handshake`, `UserPlus`, `Users` icons, `cn` utility, and `useAllUsers` hook for the assigned-to dropdown.

2. **Add state variables** for:
   - `selectedActionIds` (bulk selection checkboxes)
   - `editingDateId` (inline date editing)
   - Action item mutations (status, priority, assigned_to, due_date updates via Supabase)

3. **Add inline update handlers**:
   - `handleStatusChange(id, status)` -- updates action item status in DB
   - `handlePriorityChange(id, priority)` -- updates priority in DB
   - `handleAssignedToChange(id, userId)` -- updates assigned_to in DB
   - `handleDueDateChange(id, date)` -- updates due_date in DB
   - `handleDeleteActionItem(id)` -- deletes action item from DB
   - All handlers invalidate the query cache to refresh data

4. **Replace table markup (lines 474-541)** with the exact same structure as `ActionItemsTable.tsx`:
   - **Checkbox column** (select all / individual)
   - **Task column** -- clickable title in blue (`text-[#2e538e]`), opens edit modal
   - **Assigned To column** -- inline `<Select>` dropdown (borderless, transparent bg)
   - **Due Date column** -- click to edit inline with `<Input type="date">`
   - **Status column** (6.67% width) -- colored dot only, tooltip shows label, inline `<Select>` to change
   - **Priority column** (6.67% width) -- colored dot only, tooltip shows label, inline `<Select>` to change
   - **Module column** (6.67% width) -- since this is inside a deal, show deal icon or dash
   - **Actions column** -- `...` dropdown with Edit, Mark Complete, Delete options

5. **Scaled-down styling**: Since this is inside the expanded panel, use slightly smaller text (`text-xs` / `text-[11px]`) and reduced padding to fit the constrained space while maintaining the same functional layout.

### Technical Details

- The Status, Priority, and Module columns will use `style={{ width: '6.67%', maxWidth: '6.67%' }}` matching the main Action Items table
- Status dots: `bg-blue-500` (Open), `bg-yellow-500` (In Progress), `bg-green-500` (Completed), `bg-muted-foreground` (Cancelled)
- Priority dots: `bg-red-500` (High), `bg-yellow-500` (Medium), `bg-blue-500` (Low)
- All inline edits update the database directly via `supabase.from('action_items').update()` and invalidate the `deal-action-items` query
- The `useAllUsers` hook provides the user list for the Assigned To dropdown
- Column headers match: checkbox | Task | Assigned To | Due Date | Status | Priority | Module | Actions

