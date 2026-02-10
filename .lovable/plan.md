

## Make Status, Priority, and Module Columns Use 20% of Total Width

### Problem
The three columns (Status, Priority, Module) currently use fixed pixel widths (36px each). The user wants them to collectively occupy exactly 20% of the total list view space.

### Solution
Switch these three columns from fixed pixel widths to percentage-based widths. Each column gets ~6.67% (20% / 3) of the table width. This requires changes in two files.

### Technical Details

**File: `src/components/ActionItemsTable.tsx`**

1. **Update column definitions (lines ~268-284):** Change `width` for status, priority, and module from pixel values to a percentage string marker, and update the style logic accordingly.

2. **Update `<TableHead>` style logic (line ~296):** For compact columns, use `width: '6.67%'` and `maxWidth: '6.67%'` instead of pixel values.

3. **Update `<TableCell>` for Status (line ~371):** Change `style={{ width: '36px', maxWidth: '36px' }}` to `style={{ width: '6.67%', maxWidth: '6.67%' }}`.

4. **Update `<TableCell>` for Priority (line ~415):** Same change as Status.

5. **Update `<TableCell>` for Module (line ~453):** Same change as Status.

**File: `src/hooks/useActionItemColumnPreferences.tsx`**

6. No changes needed here since we'll handle the percentage widths directly in the component style logic rather than through the column preferences system.

