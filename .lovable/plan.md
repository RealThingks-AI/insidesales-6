

## Fix Account and Contact Dropdown Issues

### Issue 1: Account Search -- Word-Based Normalized Search

**File: `src/components/AccountSearchableDropdown.tsx`**

Replace the current `filteredAccounts` logic (lines 59-68) with word-based normalized matching. This strips hyphens, dots, and other special characters before comparing, then checks that every word in the search query appears somewhere in the combined account fields.

```typescript
const normalize = (s: string) =>
  s.toLowerCase().replace(/[-_.,()]/g, ' ').replace(/\s+/g, ' ').trim();

const filteredAccounts = useMemo(() => {
  if (!searchValue) return accounts;
  const searchWords = normalize(searchValue).split(' ').filter(Boolean);
  return accounts.filter((a) => {
    const combined = normalize(
      `${a.account_name || ''} ${a.region || ''} ${a.industry || ''}`
    );
    return searchWords.every((word) => combined.includes(word));
  });
}, [accounts, searchValue]);
```

This ensures "Harley Davidson" matches "Harley-Davidson Motor Company" and "Volvo Cars" matches "Volvo Car Corporation".

---

### Issue 2: Dropdown Always Opens Below

**Files: `AccountSearchableDropdown.tsx` (line 104) and `ContactSearchableDropdown.tsx` (line 126)**

Add `side="bottom"` and `avoidCollisions={false}` to both `PopoverContent` components:

```tsx
<PopoverContent
  className="w-[--radix-popover-trigger-width] p-0"
  align="start"
  side="bottom"
  avoidCollisions={false}
>
```

---

### Issue 3: Multiple Contacts Show as Selected (Duplicate Names)

**File: `src/components/ContactSearchableDropdown.tsx`**

1. Add a `selectedContactId` optional prop and internal `selectedId` state (set on selection).
2. Update checkmark logic from name-based to ID-based comparison:

```typescript
// Props addition
interface ContactSearchableDropdownProps {
  value?: string;
  selectedContactId?: string;  // NEW
  onValueChange: (value: string) => void;
  onContactSelect?: (contact: Contact) => void;
  placeholder?: string;
  className?: string;
}

// Internal state
const [selectedId, setSelectedId] = useState<string | undefined>(selectedContactId);

// On select
const handleSelect = (contact: Contact) => {
  onValueChange(contact.contact_name);
  setSelectedId(contact.id);
  onContactSelect?.(contact);
  setOpen(false);
  setSearchValue("");
};

// Checkmark: prefer ID match, fall back to name match
(selectedId ? selectedId === contact.id : value === contact.contact_name)
  ? "opacity-100" : "opacity-0"
```

3. Apply the same word-based normalized search as the Account dropdown.

4. Add `shouldFilter={false}` to `<Command>` (currently missing -- causes cmdk to conflict with manual filtering).

5. Replace `<CommandEmpty>` with manual empty check (same pattern as AccountSearchableDropdown).

---

### Summary

| File | Changes |
|------|---------|
| `AccountSearchableDropdown.tsx` | Word-based normalized search; `side="bottom"` + `avoidCollisions={false}` on PopoverContent |
| `ContactSearchableDropdown.tsx` | Word-based normalized search; `side="bottom"` + `avoidCollisions={false}`; `shouldFilter={false}` on Command; replace CommandEmpty with manual check; ID-based selection tracking with `selectedId` state and optional `selectedContactId` prop |

