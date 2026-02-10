

## Action Items Table - Compact Column Redesign

### Goal
Rearrange columns to the requested order and make Status, Priority, and Module columns ultra-compact by showing only visual indicators (color dots / icons) with dropdowns/tooltips for full details.

### Column Order (New)
1. Checkbox
2. Task
3. Assigned To
4. Due Date
5. Status (color dot only)
6. Priority (color dot only)
7. Module (icon only)
8. Actions

### Changes

**File: `src/components/ActionItemsTable.tsx`**

#### 1. Rearrange Column Order (lines 246-287)
Reorder the `columns` array to: checkbox, title, assigned_to, due_date, status, priority, module, actions. Move `due_date` before `status`.

#### 2. Shrink Column Widths
- `status`: reduce default from 90 to 40px
- `priority`: reduce default from 75 to 40px
- `module`: reduce default from 60 to 44px
- `assigned_to`: keep at 100px

#### 3. Status Cell - Color Dot Only (lines 352-388)
- Remove the text label `<span>{item.status}</span>` from the SelectTrigger display
- Show only the colored dot in the trigger
- Dropdown items already show dot + name (keep as-is)
- Add a tooltip wrapper so hovering the dot shows the status name

#### 4. Priority Cell - Color Dot Only (lines 403-433)
- Remove the text label `<span>{item.priority}</span>` from the SelectTrigger display
- Show only the colored dot in the trigger
- Dropdown items already show dot + name (keep as-is)
- Add a tooltip wrapper so hovering the dot shows the priority name

#### 5. Module Cell - Icon Only (lines 435-442)
- Replace the text link with an icon-only button:
  - Deals: `Handshake` icon
  - Leads: `UserPlus` icon
  - Contacts: `Users` icon
- Wrap in a Tooltip showing the full record name on hover
- Keep the click handler to open the linked record modal

#### 6. Reorder Table Body Cells
Reorder the `<TableCell>` elements in the row to match: checkbox, title, assigned_to, due_date, status, priority, module, actions.

**File: `src/hooks/useActionItemColumnPreferences.tsx`**

#### 7. Update Default Widths (lines 13-21)
Update `defaultColumnWidths` to reflect new compact sizes:
- `status`: 40
- `priority`: 40
- `module`: 44

### Technical Details

- Import `Tooltip, TooltipContent, TooltipTrigger, TooltipProvider` from `@/components/ui/tooltip`
- Import `Handshake, UserPlus, Users` icons from `lucide-react`
- Module icon mapping:
  ```text
  deals/deal    -> Handshake
  leads/lead    -> UserPlus
  contacts/contact -> Users
  ```
- Status dot colors remain: Open=blue, In Progress=yellow, Completed=green, Cancelled=gray
- Priority dot colors remain: High=red, Medium=yellow, Low=blue

