

## Fix: Reduce Status, Priority, and Module Column Widths

### Problem
The Status, Priority, and Module columns show only small dots/icons but their headers and cells take up excessive width. The table distributes remaining space across all columns, ignoring the intended compact widths.

### Solution
Apply `maxWidth` alongside `width` for compact columns, and use `table-layout: fixed` or constrain these columns so they don't grow beyond their intended size.

### Changes

**File: `src/components/ActionItemsTable.tsx`**

1. **Update column width styles (around line 296-298):** For compact columns (`status`, `priority`, `module`), apply both `width` and `maxWidth` in the inline style so the table layout engine doesn't expand them. Change the style logic to:
   - For compact columns: `{ width: col.width + 'px', maxWidth: col.width + 'px' }`
   - This applies to both `<TableHead>` (header) and `<TableCell>` (body) elements

2. **Update header cells (line 296-298):** Modify the `style` prop to include `maxWidth` when `col.compact` is true.

3. **Update body cells for Status, Priority, and Module:** Each of these `<TableCell>` elements needs a matching `style={{ width, maxWidth }}` to prevent expansion. These are around lines 370, 414, and ~450.

**File: `src/hooks/useActionItemColumnPreferences.tsx`**

4. **Reduce default widths further:**
   - `status`: 40 -> 36
   - `priority`: 40 -> 36  
   - `module`: 44 -> 36

### Technical Details

The core fix is adding `maxWidth` to prevent CSS table auto-distribution from expanding these compact columns. The `<Table>` component renders an HTML `<table>`, which by default distributes extra horizontal space proportionally. Setting `maxWidth` equal to `width` on both `<th>` and `<td>` elements constrains them.

