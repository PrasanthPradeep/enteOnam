# Report Feature Documentation

## Overview
Users can now report data quality issues (wrong coordinates, incorrect prices, outdated information, etc.) directly from the app.

## Implementation

### Components

#### ReportDialog Component
**Location:** `src/components/shared/ReportDialog.jsx`

A reusable dialog component for submitting reports.

**Props:**
- `type`: Report category - `'outlet'`, `'price'`, or `'general'`
- `outletId`: Outlet ID (for outlet reports)
- `outletName`: Outlet name (displayed in dialog)
- `priceId`: Price entry ID (for price reports)
- `productName`: Product name (displayed in dialog)
- `triggerVariant`: Button variant (default: `'ghost'`)
- `triggerSize`: Button size (default: `'sm'`)
- `triggerText`: Button text (default: `'Report Issue'`)
- `showIcon`: Show flag icon (default: `true`)

**Issue Types:**
- `coordinates`: Wrong Location/Coordinates
- `price`: Incorrect Price
- `stock`: Stock Information Wrong
- `closed`: Store Closed/Not Found
- `contact`: Wrong Contact Information
- `other`: Other Issue

### Integration Points

#### 1. StoresView (Store Details)
**Location:** In the expanded outlet details section, below the "Get Directions" button

Users can report issues specific to a store (wrong location, closed store, wrong contact info).

#### 2. MapView (Map Controls)
**Location:** In the map controls toolbar, next to "Find Me" and "Disable Clusters" buttons

Users can report general map issues or any store-related problems they notice.

#### 3. PricesView (Price List Header)
**Location:** Next to the "Supplyco Prices" heading

Users can report incorrect prices for products.

### Database Schema

#### Reports Table
```sql
create table if not exists reports (
  id serial primary key,
  type text check (type in ('outlet','price','general')) not null,
  issue_type text check (issue_type in ('coordinates','price','stock','closed','contact','other')) not null,
  description text not null,
  contact_email text,
  outlet_id int references outlets(outlet_id),
  outlet_name text,
  price_id int,
  product_name text,
  user_agent text,
  status text default 'pending' check (status in ('pending','reviewed','resolved','dismissed')),
  created_at timestamptz default now()
);
```

#### RLS Policies
- **Insert**: Anyone can submit reports (no authentication required)
- **Select**: Admin-only access via service role

### Data Flow

1. User clicks "Report Issue" button
2. Dialog opens with pre-filled context (outlet/price info if applicable)
3. User selects issue type and provides description
4. Optional: User provides contact email
5. Report submitted to Supabase `reports` table
6. Success confirmation shown
7. Dialog closes automatically after 2 seconds

### Setup Requirements

1. **Run SQL schema update:**
   ```bash
   # Copy the reports table schema from supabase-schema.sql
   # and run it in your Supabase SQL Editor
   ```

2. **Verify Supabase connection:**
   - Ensure `.env` has valid `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

### Admin Features (Future Enhancement)

To view and manage reports, create an admin dashboard that:
- Uses service role key to query reports table
- Shows pending reports
- Allows marking reports as reviewed/resolved/dismissed
- Filters by type, issue type, and status
- Shows trends (most reported outlets/issues)

### Example Admin Query
```sql
-- Get all pending reports
SELECT * FROM reports 
WHERE status = 'pending' 
ORDER BY created_at DESC;

-- Get most reported outlets
SELECT outlet_name, COUNT(*) as report_count
FROM reports 
WHERE type = 'outlet' AND status = 'pending'
GROUP BY outlet_name
ORDER BY report_count DESC;
```

## UI/UX Design

### Button Placement
- **Stores:** Primary action (below Get Directions)
- **Map:** Secondary control (toolbar)
- **Prices:** Subtle, header-level (next to title)

### Styling
- Small, unobtrusive flag icon
- Consistent with app's festival theme
- Ghost/outline variants for non-primary placements
- Success feedback with checkmark icon

### Accessibility
- Keyboard navigable dialog
- Clear labels and descriptions
- Required field indicators
- Error messages for validation

## Testing

1. **Test report submission:**
   - Open any store detail
   - Click "Report Issue"
   - Fill form and submit
   - Verify success message

2. **Test validation:**
   - Try submitting without selecting issue type
   - Try submitting with empty description
   - Verify error messages

3. **Test database:**
   - Check Supabase table for new entries
   - Verify all fields are populated correctly

## Future Enhancements

1. **Rate limiting:** Prevent spam submissions
2. **Auto-close issues:** Mark as resolved when corrected
3. **User feedback:** Notify users when their report is resolved
4. **Analytics:** Track most common issues
5. **Batch corrections:** Apply fixes to multiple outlets at once
