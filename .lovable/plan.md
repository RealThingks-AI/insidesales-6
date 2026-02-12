

## Deals Search Bar and Toolbar - Issues and Improvements

### Issues Found

1. **Inconsistent search bar styling between views**
   - Kanban: `h-8`, `text-sm`, `pl-8`, search icon `w-3 h-3`, max-width `max-w-sm`
   - List: default height (`h-10`), `pl-10`, search icon `w-4 h-4`, max-width `max-w-[300px]`
   - Both should match for a seamless view-switch experience

2. **Toggle group (Kanban/List) has weak active state**
   - Uses default Radix toggle styling (`data-[state=on]:bg-accent`) which is very subtle
   - Active view toggle needs a clear primary color so users know which view is selected

3. **Toolbar layout differs between views**
   - Kanban: fixed `h-16`, uses `gap-2` internally, has "Select Deals" button
   - List: uses `py-3 px-6`, uses `gap-3`, no "Select Deals" in same location
   - Both should share the same container height, padding, and element spacing

4. **"Select Deals" button only appears in Kanban view**
   - List view doesn't show a "Select Deals" button in the toolbar (selection is implicit via checkboxes)
   - For Kanban, this button is needed since there are no row checkboxes by default

5. **Settings/actions dropdown missing in Kanban**
   - List view has a gear icon (`DealActionsDropdown`) for import/export/columns
   - Kanban has no equivalent -- import/export is not accessible from Kanban view toolbar

6. **No "Clear All" filters button in Kanban**
   - List view shows a "Clear All" button when filters are active
   - Kanban toolbar has no such button

7. **"New Deal" button color is fine but toggle buttons look unstyled next to it**
   - The primary-colored "New Deal" button contrasts with the plain toggle group, making the toggles look unfinished

### Plan

#### File: `src/pages/DealsPage.tsx` (lines 357-378)
**Enhance toggle group styling**
- Add `variant="outline"` to the `ToggleGroup`
- Add a `className` with a border/rounded container: `border rounded-lg p-0.5 bg-muted/50`
- Style `ToggleGroupItem` active state with: `data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:shadow-sm`
- Use `size="sm"` and consistent `h-8` height to match search bar

#### File: `src/components/KanbanBoard.tsx` (lines 541-586)
**Standardize Kanban toolbar to match List view**
- Change header container from `h-16 px-6` to `px-6 py-3 border-b border-border`
- Update search input to use `h-9` height, `pl-9` padding, `w-4 h-4` icon size (matching List)
- Set search max-width to `max-w-[300px]` (matching List)
- Add "Clear All" button when filters are active (same as List view has)
- Move `headerActions` to far right with a `flex-1` spacer before it (matching List layout)

#### File: `src/components/ListView.tsx` (lines 349-401)
**Standardize List toolbar to match Kanban**
- Change search input to use `h-9` height consistently
- Ensure same `px-6 py-3` padding
- Both views will share the same visual bar

#### File: `src/components/DealsAdvancedFilter.tsx` (line 166)
**Consistent filter button height**
- Ensure the Filter button uses `h-9` to match the search bar and toggle group height

### Summary of Visual Changes

| Element | Before | After |
|---------|--------|-------|
| Search bar height | h-8 (Kanban) / h-10 (List) | h-9 (both) |
| Search icon size | w-3 (Kanban) / w-4 (List) | w-4 h-4 (both) |
| Search max-width | max-w-sm / max-w-[300px] | max-w-[300px] (both) |
| Toggle active state | Subtle accent bg | Primary bg with white text |
| Toggle container | No border | Bordered pill with muted bg |
| Toolbar padding | h-16 / py-3 | py-3 (both) |
| Clear filters | List only | Both views |
| Settings dropdown | List only | Both views (already passed via headerActions) |

