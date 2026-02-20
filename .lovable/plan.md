

## Fix Mouse Scroll in Contact and Account Dropdowns (Inside Dialog)

### Root Cause

The Contact and Account searchable dropdowns use a `Popover` + `Command` (cmdk) combo that is rendered **inside a Radix Dialog** (the DealForm modal). This is a well-documented Radix UI bug (GitHub issues #3423, #542, #6988): when a Popover is nested inside a Dialog, the Dialog's pointer-events management blocks mouse wheel scroll events from reaching the Popover's scrollable content.

The previous fix (removing `overflow-hidden` from `CommandGroup`) was correct in principle but didn't address this specific Dialog-nesting issue.

### Solution

Apply two targeted fixes:

1. **Add `pointer-events: auto` style to the `PopoverContent`** in both dropdown components -- this overrides the Dialog's `pointer-events: none` that blocks interaction with portal-rendered content.

2. **Add a direct `onWheel` handler on `CommandList`** as a belt-and-suspenders fix -- this manually scrolls the list element when the mouse wheel event fires, completely bypassing any event propagation issues.

### Files to Modify (2 files)

**1. `src/components/ContactSearchableDropdown.tsx`**

On the `PopoverContent` element (line 133), add `style={{ pointerEvents: 'auto' }}`.

On the `CommandList` element (line 140), add an `onWheel` handler that manually scrolls:

```tsx
<PopoverContent
  className="w-[--radix-popover-trigger-width] p-0"
  align="start"
  side="bottom"
  avoidCollisions={false}
  style={{ pointerEvents: 'auto' }}
>
  <Command shouldFilter={false}>
    <CommandInput ... />
    <CommandList
      onWheel={(e) => {
        e.stopPropagation();
        const target = e.currentTarget;
        target.scrollTop += e.deltaY;
      }}
    >
```

**2. `src/components/AccountSearchableDropdown.tsx`**

Same changes on the `PopoverContent` element (line 107) and `CommandList` element (line 114):

```tsx
<PopoverContent
  className="w-[--radix-popover-trigger-width] p-0"
  align="start"
  side="bottom"
  avoidCollisions={false}
  style={{ pointerEvents: 'auto' }}
>
  <Command shouldFilter={false}>
    <CommandInput ... />
    <CommandList
      onWheel={(e) => {
        e.stopPropagation();
        const target = e.currentTarget;
        target.scrollTop += e.deltaY;
      }}
    >
```

**3. `src/components/LeadSearchableDropdown.tsx`** (used in Deal forms too)

Same pattern applied to its `PopoverContent` and `CommandList` for consistency.

### Why This Works

- `pointer-events: auto` on `PopoverContent` overrides the `pointer-events: none` that the Dialog overlay sets, allowing mouse events (including wheel) to reach the Popover content.
- The `onWheel` handler on `CommandList` is a direct, imperative scroll that works even if the wheel event doesn't naturally propagate through the DOM due to Radix's focus/event management.
- `e.stopPropagation()` prevents the wheel event from bubbling up to the Dialog and triggering unwanted behavior.

### What Is NOT Changed

- The `command.tsx` shared component stays as-is (the `overflow-hidden` removal from the previous fix is already applied and still helpful).
- No changes to the Dialog or Popover UI primitives -- the fix is scoped to the three dropdown components only.
