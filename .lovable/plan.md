

## Fix Scrollbars in Deals List View

### Problem
The deals list view has two scroll issues:
1. The horizontal scrollbar only appears at the very bottom of all records (inside the Table component's own overflow wrapper), not visible until you scroll all the way down
2. Scrollbars are not always visible -- they auto-hide, making it hard to know content extends beyond the viewport

### Root Cause
The `Table` component (`src/components/ui/table.tsx`) wraps the `<table>` in a `<div className="relative w-full overflow-auto">`. The `ListView.tsx` outer container (line 404) also has `overflow-auto`. This creates **nested scroll containers** -- the inner one captures horizontal scroll (only visible at content bottom), while the outer one handles vertical scroll.

### Solution

**File 1: `src/components/ListView.tsx`**
- Override the Table's inner wrapper by passing a className that removes its overflow (`[&>div]:overflow-visible`) so the outer container handles both horizontal and vertical scrolling
- Add custom class for always-visible scrollbars on the outer scroll container

**File 2: `src/index.css`**
- Add a utility CSS class (`.always-show-scrollbars`) that forces both scrollbars to always be visible using WebKit and Firefox scrollbar styling:
  - `::-webkit-scrollbar` with explicit width/height
  - `::-webkit-scrollbar-thumb` with visible thumb color
  - `scrollbar-width: thin` for Firefox
  - `overflow: scroll` to always reserve space for scrollbars

### Changes Summary

| File | Change |
|------|--------|
| `src/index.css` | Add `.always-show-scrollbars` CSS utility class |
| `src/components/ListView.tsx` | Apply always-visible scrollbar class to outer container; neutralize Table's inner overflow wrapper |

