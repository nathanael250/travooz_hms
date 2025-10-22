# Quick Reference: Nested Expandable Rooms UI

## What Changed?

**Before:** Everything on one long page that was hard to navigate
**After:** Clean accordion interface with organized sections

---

## Visual Layout

### Main Room Card (Always Visible)
```
┌───────────────────────────────────────────────────────────┐
│ 🛏️  Double Room                         [Remove] [▼ Expand] │
│    2 units • €150/night                                    │
└───────────────────────────────────────────────────────────┘
```

### When Room is Expanded
```
┌───────────────────────────────────────────────────────────┐
│ 🛏️  Double Room                         [Remove] [▲ Collapse]│
├───────────────────────────────────────────────────────────┤
│
│  📋 Basic Information                          [▼ Collapse]
│  ┌─────────────────────────────────────────────────────┐
│  │ Blue Background Section                             │
│  │ • Room Type dropdown                                │
│  │ • Number of Rooms input                             │
│  │ • Price per Night input                             │
│  │ • Max People select                                 │
│  │ • Room Size input                                   │
│  │ • What's Included text                              │
│  │ • Room Description textarea                         │
│  └─────────────────────────────────────────────────────┘
│
│  🖼️  Images                              [▼ Expand]
│
│  ✨ Amenities                              [▼ Expand]
│
│  🔢 Room Inventory Creation                [▼ Expand]
│
└───────────────────────────────────────────────────────────┘
```

---

## Section Details

### 📋 Basic Information (Blue)
Shows when you click the header or by default when opening a room.

```
📋 Basic Information              ▲

Room Type *                     Room Size (sqm)
[Select dropdown]               [Number input]

Number of Rooms *               What's Included
[Number input]                  [Text input]

Price per Night *               Room Description
[Number input]                  [Large text area]

Max People *
[Dropdown]
```

### 🖼️ Images (Green)
Click to show image upload interface.

```
🖼️  Images                        ▼

[Click to expand...]
```

When expanded:
```
🖼️  Images                        ▲

Room Images
Add photos to showcase this room type

[Image upload zone]
[Drag & drop or click to upload]
[Max 10 images]
```

### ✨ Amenities (Amber)
Click to show all available amenities as checkboxes.

```
✨ Amenities                      ▼

[Click to expand...]
```

When expanded - checkbox grid (4 columns on desktop):
```
✨ Amenities                      ▲

☐ Minibar          ☐ WiFi            ☐ USB Charging      ☐ Hair Dryer
☐ Tea/Coffee       ☐ TV              ☐ Power Adapters    ☐ Towels
☐ Wardrobe         ☐ Speaker         ☐ Desk/Workspace    ☐ Bathrobes
☐ Luggage Rack     ☐ Phone           ☐ Iron/Board        ☐ Slippers
☐ Safe             ☐ AC              ☐ Shaving Kits      ☐ Toiletries
☐ Heater           ☐ Fan             ☐ Table Lamps       ☐ Laundry Bag
                                      ☐ Bedside Lamps
                                      ☐ Alarm Clock
```

### 🔢 Room Inventory Creation (Purple)
Click to configure how rooms will be created.

```
🔢 Room Inventory Creation       ▼

[Click to expand...]
```

When expanded - two options:
```
🔢 Room Inventory Creation       ▲

How would you like to create room inventory?

○ Auto-generate     ○ Manual entry

[If Auto selected - shows options below]
[If Manual selected - shows input fields below]
```

#### Auto-Generate Sub-Options
```
Auto-generation Options:

○ Default (1 to 5)
○ Custom start number

[If Custom selected]
Starting Room Number: [101        ]
Will generate: 101, 102, 103, 104, 105
```

#### Manual Entry
```
Enter Room Details                     0 / 5 rooms

[Text input: Room ID]  [Text input: Notes]  [✕ Remove]
[Text input: Room ID]  [Text input: Notes]  [✕ Remove]

[+ Add Room]  (when < 5 rooms)
```

---

## How to Use

### Adding a New Room Type
1. Click **"Add Room Type"** button at bottom
2. New room card appears with Basic Information expanded

### Filling Out Room Details
1. **Room details** - Fill in Basic Information (auto-expanded)
2. **Photos** - Expand Images section → Upload photos
3. **Amenities** - Expand Amenities → Check items
4. **Inventory** - Expand Room Inventory → Choose creation method

### Auto-Generating Room Numbers
1. Expand **Room Inventory Creation** section
2. Select **"Auto-generate"** radio button
3. Choose option:
   - **Default** = Room numbers 1, 2, 3, ...
   - **Custom start** = Enter starting number (e.g., 101 → 101, 102, 103, ...)

### Manually Entering Rooms
1. Expand **Room Inventory Creation** section
2. Select **"Manual entry"** radio button
3. Enter room IDs and optional notes
4. Click **"+ Add Room"** until you have all rooms
5. Progress counter shows: "2 / 5 rooms"

---

## Navigation Tips

**Keyboard Shortcuts:**
- Click any section header to expand/collapse
- Hover over header for highlight effect

**Mobile-Friendly:**
- Touch-friendly tap areas
- Sections stack vertically
- Perfect for phone/tablet use

**Multi-Room Editing:**
- Each room maintains its own expanded state
- You can have multiple rooms expanded
- Switch between rooms easily

---

## Color Reference

| Color | Section | Meaning |
|-------|---------|---------|
| 🔵 Blue | Basic Info | Core room details |
| 🟢 Green | Images | Visual content |
| 🟡 Amber | Amenities | Features & facilities |
| 🟣 Purple | Inventory | Room numbers & setup |

---

## Common Tasks

### Task: Add a Double Room with Photos
1. Click **"Add Room Type"**
2. In **Basic Information**: Select "Double Room", set 5 units, €150 price
3. Click **Images** header → Upload 3 photos
4. Click **Amenities** → Check WiFi, TV, AC, Safe
5. Click **Room Inventory** → Select "Custom start", enter 201
6. Click **"Submit"** (automatically generates: 201, 202, 203, 204, 205)

### Task: Add Multiple Room Types
1. Click **"Add Room Type"** (now have: Room 1)
2. Fill details for Room 1, collapse it
3. Click **"Add Room Type"** again (now have: Room 2)
4. Fill details for Room 2
5. Both rooms' configurations are preserved
6. All submit together

### Task: Change Room After Saving
1. Find the room card
2. Click on room header to expand it
3. Click section headers to modify sections
4. Changes are automatically tracked
5. Submit updates

---

## Troubleshooting

**Q: Section won't expand**
A: Click the section header (the text/icon area), not the chevron. Any click on that row should work.

**Q: I see all sections at once**
A: This is normal on desktop. You can collapse any section by clicking its header to reduce clutter.

**Q: Mobile view is cramped**
A: Try collapsing sections you're not using. Scroll between sections.

**Q: Can't find inventory section**
A: Scroll down or click the "Room Inventory Creation" header if it's above the fold.

**Q: My data disappeared**
A: Make sure you click **"Submit"** or **"Next"** to save. Refreshing without saving will lose changes.

---

## Tips & Tricks

✨ **Pro Tips:**

1. **Start with Basic Info open** - Fill room details first, then add photos/amenities
2. **Copy previous room** - If you have similar room types, you can manually copy settings
3. **Use auto-generate for large counts** - If you have 50+ rooms, auto-generate saves time
4. **Use manual for special rooms** - Name suites (Honeymoon Suite, Presidential Suite) individually
5. **Batch operations** - Work on one section type for all rooms (add all images, then all amenities)

📱 **Mobile Tips:**
- Collapse sections when not using them
- One section at a time reduces scrolling
- Tap anywhere on header row to toggle

🎨 **UX Tips:**
- Color coding helps identify sections quickly
- Chevron rotation shows state at a glance
- Consistent spacing makes scanning easy

---

## Summary

The nested accordion design makes room configuration:
- ✅ **Organized** - Content grouped logically
- ✅ **Focused** - See one section at a time
- ✅ **Mobile-Friendly** - Works great on phones
- ✅ **Intuitive** - Familiar accordion pattern
- ✅ **Efficient** - Quickly jump to what you need

**Ready to create rooms? Start by clicking "Add Room Type"!**