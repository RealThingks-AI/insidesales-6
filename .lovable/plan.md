

## Fix Inline Editing Bugs and Enhance Consistency in Deals List View

### Issues Identified

1. **Multiple cells editable simultaneously** -- Each `InlineEditCell` manages its own `isEditing` state independently, so clicking multiple cells opens multiple editors at once, cluttering the row (visible in the screenshot with multiple save/cancel buttons across a single row).

2. **Select-based fields require manual save** -- Stage, Priority, and Select types open a dropdown, but the user still has to click the tiny checkmark to confirm. Industry standard: auto-save on selection for dropdowns.

3. **Save/Cancel buttons overflow column width** -- The input field + two icon buttons (check + X) squeeze into fixed-width cells, causing content to overflow or wrap awkwardly, especially in narrow columns.

4. **Stale edit value on re-render** -- `editValue` is set via `useState(value || '')` only on mount. If the deal data updates externally (e.g., real-time subscription), re-opening edit shows the old value.

5. **Boolean switch needs manual save** -- The Switch toggle should auto-save when toggled, not require clicking the checkmark.

6. **Date field lacks auto-save on blur** -- After picking a date, the user must click save. Should auto-save on blur.

### Solution

**File: `src/components/InlineEditCell.tsx`**

- Add an `onEditStart` callback prop so the parent can close any other active editor
- Add an `isEditing` controlled prop (optional) alongside internal state, allowing the parent (`ListView`) to enforce "one editor at a time"
- Sync `editValue` with `value` prop using `useEffect` so stale values are avoided
- Auto-save for Select, Stage, Priority, and Boolean types: call `handleSave` immediately on value change (no manual checkmark needed)
- Auto-save for Date on blur
- Make save/cancel buttons smaller and more compact (`h-5 w-5`) to reduce overflow
- Hide save/cancel buttons for auto-save types (stage, priority, select, boolean) since they save automatically
- Add click-outside detection to auto-cancel text/number/textarea edits

**File: `src/components/ListView.tsx`**

- Add `editingCellKey` state (`string | null`) tracking the currently active edit cell (e.g., `"dealId-fieldName"`)
- Pass `isEditing` and `onEditStart` props to each `InlineEditCell`
- When a cell starts editing, set `editingCellKey` to that cell's key, which automatically closes any other active editor
- This enforces the "only one edit field at a time" constraint

### Technical Details

**InlineEditCell changes:**
- New props: `isEditing?: boolean`, `onEditStart?: () => void`, `onEditEnd?: () => void`
- When `isEditing` prop is provided, it overrides internal state (controlled mode)
- `useEffect` on `value` prop to sync `editValue` when not editing
- For stage/priority/select: `onValueChange` calls save directly, then `onEditEnd`
- For boolean: `onCheckedChange` calls save directly, then `onEditEnd`
- For date: `onBlur` triggers save
- For text/number/currency/textarea: keep save/cancel buttons but make them more compact

**ListView changes:**
- New state: `editingCellKey: string | null`
- Each `InlineEditCell` receives:
  - `isEditing={editingCellKey === \`\${deal.id}-\${column.field}\`}`
  - `onEditStart={() => setEditingCellKey(\`\${deal.id}-\${column.field}\`)}`
  - `onEditEnd={() => setEditingCellKey(null)}`

### Summary of Fixes

| Issue | Fix |
|-------|-----|
| Multiple editors open | Parent-controlled single `editingCellKey` state |
| Select/Stage/Priority need manual save | Auto-save on value change |
| Boolean needs manual save | Auto-save on toggle |
| Date needs manual save | Auto-save on blur |
| Save/Cancel overflow columns | Compact buttons; hidden for auto-save types |
| Stale edit value | `useEffect` syncs value prop |

