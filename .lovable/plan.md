

## Fix Mouse Scroll in Contact and Account Dropdowns

### Root Cause
The `CommandGroup` component in `src/components/ui/command.tsx` has `overflow-hidden` in its default className (line 90). This blocks mouse wheel scroll events from propagating up to the `CommandList` (which has `overflow-y-auto` and handles scrolling). Previous fixes added `onWheel` event handlers to `PopoverContent` and `CommandList`, but those don't help because `CommandGroup` sits between `CommandList` and the items and swallows the scroll events.

### Fix

**File: `src/components/ui/command.tsx` — line 90**
Remove `overflow-hidden` from the `CommandGroup` default className. The scrolling is already managed by `CommandList` which has `max-h-[300px] overflow-y-auto`.

```
Before: "overflow-hidden p-1 text-foreground ..."
After:  "p-1 text-foreground ..."
```

This single change fixes mouse wheel scrolling in all three dropdown components (`ContactSearchableDropdown`, `AccountSearchableDropdown`, `LeadSearchableDropdown`) since they all use the same `CommandGroup` from the shared UI library.

### Additional Cleanup (optional but recommended)

**Files: `ContactSearchableDropdown.tsx` and `AccountSearchableDropdown.tsx`**
The previous workaround `onWheel` handlers on `PopoverContent` and `CommandList` are no longer needed and can be removed for cleaner code. If they were added, revert to simple props without `onWheel`/`onAutoFocus` handlers.

