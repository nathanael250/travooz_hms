# Room Inventory Creation - Quick Reference

## Quick Decision Tree

```
START: Creating a Room Type
│
├─ Do you want to manually enter each room ID?
│  │
│  ├─ YES → MANUAL MODE
│  │       ├─ Click "Manual entry" radio button
│  │       ├─ Click "Add Room" for each room
│  │       ├─ Enter Room ID (required): 101, Suite A, etc.
│  │       ├─ Enter Notes (optional): "Lake view", "Recently renovated"
│  │       └─ Continue
│  │
│  └─ NO → AUTOMATIC MODE
│         ├─ Click "Auto-generate" radio button
│         ├─ Choose numbering option:
│         │  ├─ Default: Rooms numbered 1, 2, 3, ...
│         │  └─ Custom Start: Enter starting number (e.g., 101)
│         └─ Continue
│
└─ Submit Wizard
```

## Quick Examples

### Example 1: Small Guesthouse (Manual Mode)
**Scenario**: 3 rooms with unique identifiers and descriptions

```
Mode: Manual entry
Room 1: "Sunrise" - Notes: "East-facing, morning sun"
Room 2: "Garden" - Notes: "Ground floor, private garden"
Room 3: "Valley" - Notes: "Mountain view"
```

### Example 2: Hotel - First Floor (Automatic Custom Start)
**Scenario**: 10 rooms on floor 1

```
Mode: Automatic
Option: Custom start number
Starting Number: 101
Result: 101, 102, 103, 104, 105, 106, 107, 108, 109, 110
```

### Example 3: Hotel - Mixed Property
**Scenario**: Property with 3 room types

```
Room Type 1: Standard Room (5 units)
  Mode: Automatic → Default → 1, 2, 3, 4, 5

Room Type 2: Deluxe Room (5 units)
  Mode: Automatic → Custom Start (101) → 101, 102, 103, 104, 105

Room Type 3: Suite (3 units)
  Mode: Manual → Suite A, Suite B, Suite C
```

## Common Use Cases

| Use Case | Mode | Settings | Result |
|----------|------|----------|--------|
| Small guesthouse with named rooms | Manual | Custom IDs: Sunrise, Garden, Valley | Three rooms with descriptive names |
| Hotel floor 1 (10 rooms) | Automatic | Custom start: 101, count: 10 | 101-110 |
| Hotel floor 2 (10 rooms) | Automatic | Custom start: 201, count: 10 | 201-210 |
| Luxury suites | Manual | IDs: Suite A, Suite B, Suite C | Named suites |
| Startup listing (simple) | Automatic | Default, count: 5 | 1, 2, 3, 4, 5 |

## UI Quick Lookup

### Automatic Mode - Default
```
✓ Automatic Mode Selected
┌─────────────────────────────────┐
│ Auto-generation Options:        │
│ ⭕ Default (1 to 5)            │
│ ○ Custom start number           │
│                                  │
│ Will generate rooms: 1, 2, 3, 4, 5
└─────────────────────────────────┘
```

### Automatic Mode - Custom Start
```
✓ Automatic Mode Selected
┌──────────────────────────────────────┐
│ Auto-generation Options:             │
│ ○ Default (1 to 5)                  │
│ ⭕ Custom start number              │
│                                       │
│ Starting Room Number [101        ]   │
│                                       │
│ Will generate: 101, 102, 103, 104, 105
└──────────────────────────────────────┘
```

### Manual Mode
```
✓ Manual Mode Selected
┌────────────────────────────────────────────────┐
│ Enter Room Details              2 / 5 rooms    │
├────────────────────────────────────────────────┤
│ [101          ] [Lake view         ] [✕]       │
│ [102          ] [Garden view       ] [✕]       │
│                                                  │
│ [+ Add Room]                                     │
└────────────────────────────────────────────────┘
```

## Tips & Tricks

✅ **Best Practices:**
- Use "Default" mode for simple properties with 1-10 rooms
- Use "Custom Start" for multi-floor hotels with clear numbering schemes
- Use "Manual" for boutique properties with unique room names
- Keep room IDs consistent across your property
- Use descriptive notes in manual mode for future reference

❌ **Avoid:**
- Mixing different numbering schemes (e.g., 101, 102, Suite A)
- Leaving manual room fields empty
- Using special characters in room IDs (use alphanumeric only)
- Creating duplicate room numbers within same room type

🔍 **Helpful Hints:**
- Preview shows what will be generated before submission
- Room count must match number of manual rooms entered
- You can use different modes for different room types
- Counter shows: "current / total" rooms in manual mode

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Switch to Manual | Click radio button |
| Switch to Automatic | Click radio button |
| Add Manual Room | Click "Add Room" button or Tab to new row |
| Delete Manual Room | Click ✕ button |
| Change Mode | Click new mode radio button |

## Troubleshooting

**Q: Can't add more rooms in manual mode?**
- A: Reached the limit (room_count). Increase room_count field at top.

**Q: Starting number showing as invalid?**
- A: Use positive integers only (1, 101, 301, etc.). No letters or special chars.

**Q: Want to change from Manual to Automatic?**
- A: Click the "Auto-generate" radio button. Manual entries will be discarded.

**Q: Generated numbers don't look right?**
- A: Check the starting number - it should be the first number, then it counts up.

## Data Storage

```javascript
// Automatic Mode (Default)
{
  mode: 'automatic',
  inventoryMode: 'default',
  startingNumber: '',
  manualRooms: []
}

// Automatic Mode (Custom Start)
{
  mode: 'automatic',
  inventoryMode: 'custom_start',
  startingNumber: '101',
  manualRooms: []
}

// Manual Mode
{
  mode: 'manual',
  inventoryMode: '',
  startingNumber: '',
  manualRooms: [
    { id: 1634567890123, roomNumber: '101', notes: 'Lake view' },
    { id: 1634567890124, roomNumber: '102', notes: 'Garden view' }
  ]
}
```

## Related Documentation

- [Room Inventory Creation Guide](./ROOM_INVENTORY_CREATION_GUIDE.md) - Full implementation guide
- [Homestay Wizard Guide](./QUICK_START.md) - Overall wizard flow
- Backend API documentation for room creation endpoints