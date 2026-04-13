

## Expand Region Targeting: All Regions, All Countries, Formatted Timezones

### Changes

#### 1. Expand `src/utils/countryRegionMapping.ts`

**Regions**: Expand from 4 to 7 proper geographic regions:
`Africa`, `Asia`, `Europe`, `Middle East`, `North America`, `Oceania`, `South America`

**Countries**: Add all ~200 UN-recognized countries, each mapped to its region. Alphabetically sorted within each region.

**Aliases**: Expand to cover common variants for the new countries.

#### 2. Add timezone data with display format

Create a `TIMEZONE_LIST` array in a new section of `countryRegionMapping.ts` (or inline in the component) with entries formatted as shown in the user's screenshot:

```
UTC+05:30 Indian Standard Time (IST)
UTC-05:00 Eastern Standard Time (EST)
UTC+00:00 Greenwich Mean Time (GMT)
UTC+01:00 Central European Time (CET)
...
```

Each entry: `{ value: "Asia/Kolkata", label: "UTC+05:30 Indian Standard Time (IST)" }`

Cover ~40 major timezone entries covering all UTC offsets from -12 to +14.

#### 3. Update `src/components/campaigns/CampaignMARTRegion.tsx`

- **Reorder fields** to: Region (1st) → Country (2nd) → Timezone (3rd)
- **Region**: `Select` dropdown with all 7 regions
- **Country**: `Select` dropdown filtered by selected region; auto-sets region when country is picked; resets country when region changes if mismatch
- **Timezone**: `Select` dropdown using the new formatted labels (e.g., "UTC+05:30 Indian Standard Time (IST)") instead of raw IANA identifiers
- **Validation**: Require region (not country) as minimum to save

### Files Modified

| File | What |
|------|------|
| `src/utils/countryRegionMapping.ts` | Expand to 7 regions, ~200 countries, formatted timezone list |
| `src/components/campaigns/CampaignMARTRegion.tsx` | Reorder to Region→Country→Timezone, all dropdowns, filtered country list, formatted timezone display |

