# Frontend Features and Style Guides

## Water Systems Map Features

### Overview

The Water Systems Map page provides an interactive interface for searching and exploring Georgia's water systems and compliance data. The page includes a navigation bar, search functionality, and an interactive map powered by Leaflet.

### Features

#### Navigation Bar

- Consistent navigation across all pages
- Links to Dashboard, Analytics, Map, and Settings
- Mobile-responsive design with hamburger menu
- Partner Login button

#### Search Functionality

- **Basic Search**: Search by water system name, PWSID, or city
- **Advanced Search**: Expandable filters including:
  - State selection (Georgia)
  - System type (Community, Transient Non-Community, Non-Transient Non-Community)
  - Activity status (Active, Inactive, New)
  - Violation filter (systems with violations only)

#### Interactive Map

- **Leaflet Integration**: Powered by react-leaflet for interactive mapping
- **Custom Markers**: Color-coded markers based on violation status:
  - 🟢 Green: Compliant systems (0 violations)
  - 🟡 Yellow: Minor issues (1-2 violations)
  - 🔴 Red: Major issues (3+ violations)
  - 🔵 Blue: Selected system
- **Interactive Popups**: Click markers to view system details
- **Map Controls**: Zoom in/out and layer controls

#### Search Results Panel

- **Results List**: Scrollable list of search results
- **System Cards**: Each result shows:
  - System name
  - PWSID
  - City
  - Population served
  - Violation count with color-coded badges
- **Selection**: Click to select a system and view details

#### System Details Panel

- **Selected System Info**: Shows when a system is selected
- **Key Information**:
  - System name and PWSID
  - System type and activity status
  - Population served
  - Violation count
- **Violations List**: Detailed list of violations for the selected system

#### Violations Panel

- **Violation Details**: Shows when a system has violations
- **Information Displayed**:
  - Violation code
  - Category and status
  - Contaminant information
  - Dates and health-based indicators
- **Status Badges**: Color-coded violation status

### Technical Implementation

#### Components

- `MapPage`: Main page component with search and layout
- `MapComponent`: Interactive map using Leaflet
- `Navigation`: Reusable navigation component

#### Data Integration

- **Water Systems Repository**: Handles water system searches
- **Violations Repository**: Manages violation data
- **Supabase Backend**: Database queries for water system data

#### Map Features

- **Georgia Focus**: Centered on Georgia with appropriate zoom levels
- **Mock Coordinates**: Demo coordinates for water system locations
- **Responsive Design**: Works on desktop and mobile devices
- **Custom Styling**: Tailored popup and marker styles

### Usage

1. **Search**: Enter a search term in the search bar
2. **Filter**: Use advanced search to narrow results
3. **Explore**: Click on search results to view details
4. **Map Interaction**: Click markers on the map to select systems
5. **View Violations**: See detailed violation information for selected systems

### Future Enhancements

- Real geographic coordinates for water systems
- County boundaries and watershed overlays
- Export functionality for map data
- Spatial filtering by geographic boundaries
- Real-time data updates
- Mobile-optimized map controls

## Navigation Component - Maximum Update Depth Error Analysis

### Problem Statement

Error: "Maximum update depth exceeded. This can happen when a component calls setState inside useEffect, but useEffect either doesn't have a dependency array, or one of the dependencies changes on every render."

### Potential Root Causes

#### 1. **AuthContext Value Object Recreation** ⚠️ HIGH PRIORITY

**Location:** `AuthContext.tsx` lines 282-296

**Problem:**

```typescript
const value = {
  user,
  session,
  profile,
  loading,
  isAuthenticated: !!user,
  isApproved: profile?.status === 'approved',
  isAdmin: profile?.role === 'admin' && profile?.status === 'approved',
  userRole: profile?.role || null,
  signOut,
  refreshSession,
  refreshProfile,
  setFakeAuth,
  isFakeAuth
}
```

**Issue:** This object is recreated on every render, causing all consumers to re-render, which could trigger infinite loops if any consumer updates state that affects the context.

**Solution:**

- Use `useMemo` to memoize the context value object
- Only recreate when dependencies actually change

#### 2. **AuthContext useEffect Dependencies** ⚠️ MEDIUM PRIORITY

**Location:** `AuthContext.tsx` lines 270-280

**Problem:**

```typescript
useEffect(() => {
  if (isFakeAuth) {
    return
  }
  if (user) {
    refreshProfile()
  } else {
    setProfile(null)
  }
}, [user, isFakeAuth, refreshProfile])
```

**Issue:** `refreshProfile` is a `useCallback` that depends on `user`. If `refreshProfile` changes, this effect runs, which might update `profile`, which changes `isAdmin`, which causes Navigation to re-render, potentially creating a loop.

**Solution:**

- Ensure `refreshProfile` is stable (already using useCallback)
- Consider if profile updates should trigger navigation re-renders

#### 3. **Navigation Component - Computed Values in Render** ⚠️ MEDIUM PRIORITY

**Location:** `navigation.tsx` lines 32, 288-289

**Problem:**

```typescript
const { user, isAuthenticated, isAdmin, isApproved, profile, signOut } = useAuth()
```

The context provides:

```typescript
isAuthenticated: !!user,
isApproved: profile?.status === 'approved',
isAdmin: profile?.role === 'admin' && profile?.status === 'approved',
```

**Issue:** These computed values are recreated on every render. If `profile` or `user` reference changes (even with same values), these booleans might cause re-renders.

**Solution:**

- Already addressed with useMemo in context value (see #1)

#### 4. **Navigation Component - partnerToolsItems Array** ✅ FIXED

**Location:** `navigation.tsx` lines 83-89

**Status:** Already fixed with `useMemo`

**Previous Issue:** Array was recreated on every render when `isAdmin` changed, causing re-renders of mapped components.

#### 5. **Navigation Component - Click Outside Handler** ⚠️ LOW PRIORITY

**Location:** `navigation.tsx` lines 44-73

**Problem:**

```typescript
useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    // ...
    if (isPartnerToolsOpenRef.current && !clickedInsidePartnerTools) {
      setIsPartnerToolsOpen(false)  // State update
    }
    if (isProfileMenuOpenRef.current && !clickedInsideProfileMenu) {
      setIsProfileMenuOpen(false)  // State update
    }
  }
  document.addEventListener('click', handleClickOutside)
  return () => {
    document.removeEventListener('click', handleClickOutside)
  }
}, []) // Empty deps - OK
```

**Issue:** The handler uses refs (good), but if clicking a link triggers navigation and the component re-renders during navigation, the click event might still propagate and trigger state updates.

**Solution:**

- Already using refs (good)
- Link clicks use `stopPropagation()` (good)
- Consider adding navigation state check

#### 6. **Navigation Component - Link onClick Handlers** ⚠️ MEDIUM PRIORITY

**Location:** `navigation.tsx` lines 144-151, 206-213, etc.

**Problem:**

```typescript
onClick={(e) => {
  e.stopPropagation()
  if (isPartnerToolsOpen) {
    setIsPartnerToolsOpen(false)  // State update during render/navigation
  }
}}
```

**Issue:** If navigation happens synchronously and causes a re-render, the state update might trigger another render cycle. However, this should be safe as it's conditional.

**Solution:**

- Current implementation should be safe (conditional update)
- Consider using `useCallback` for handlers if needed

#### 7. **AuthContext - refreshProfile Dependency Loop** ⚠️ HIGH PRIORITY

**Location:** `AuthContext.tsx` lines 211-224, 270-280

**Problem:**

```typescript
const refreshProfile = useCallback(async () => {
  // ...
}, [user])  // Depends on user

useEffect(() => {
  if (user) {
    refreshProfile()  // Calls refreshProfile
  }
}, [user, isFakeAuth, refreshProfile])  // Depends on refreshProfile
```

**Issue:** If `refreshProfile` changes when `user` changes, this effect runs. If `refreshProfile` updates `profile`, and `profile` changes cause context value to change, which causes Navigation to re-render, we might have a loop.

**Solution:**

- In fake auth mode, profile is set directly (no refreshProfile call) - this is good
- For real auth, ensure refreshProfile doesn't cause loops

#### 8. **Context Provider Re-renders** ⚠️ HIGH PRIORITY

**Location:** `AuthContext.tsx` - entire provider

**Problem:** If the context value object is recreated on every render (see #1), all consumers re-render. If any consumer updates state that affects the provider, we get a loop.

**Solution:**

- Memoize context value (see #1)

## Navigation Fix Implementation Summary

### Problem

"Maximum update depth exceeded" error when using authenticated navigation in demo mode.

### Root Cause Identified

The `AuthContext` value object was being recreated on every render, causing all consumers (including the Navigation component) to re-render unnecessarily. This created a cascade of re-renders that could trigger infinite loops.

### Solutions Implemented

#### ✅ Solution 1: Memoized Context Functions

**Status:** COMPLETED

Wrapped all context functions in `useCallback` to ensure stable references:

- `setFakeAuth` - No dependencies (stable)
- `refreshSession` - Depends on `supabase` (stable)
- `signOut` - Depends on `isFakeAuth` and `supabase` (stable)
- `refreshProfile` - Already wrapped (depends on `user`)

**Impact:** Functions now maintain stable references between renders, preventing context value recreation.

#### ✅ Solution 2: Memoized Context Value Object

**Status:** COMPLETED

Wrapped the context value object in `useMemo`:

```typescript
const value = useMemo(() => ({
  user,
  session,
  profile,
  loading,
  isAuthenticated: !!user,
  isApproved: profile?.status === 'approved',
  isAdmin: profile?.role === 'admin' && profile?.status === 'approved',
  userRole: profile?.role || null,
  signOut,
  refreshSession,
  refreshProfile,
  setFakeAuth,
  isFakeAuth
}), [user, session, profile, loading, isFakeAuth, signOut, refreshSession, refreshProfile, setFakeAuth])
```

**Impact:** Context value only changes when actual dependencies change, preventing unnecessary re-renders of all consumers.

#### ✅ Solution 3: Memoized Navigation Arrays

**Status:** ALREADY COMPLETED (from previous fix)

- `publicNavItems` - Memoized with empty dependency array
- `partnerToolsItems` - Memoized with `[isAdmin]` dependency

**Impact:** Navigation arrays don't cause re-renders when unchanged.

### Test Cases to Verify Fix

#### Test 1: Basic Navigation After Login

1. Open browser console
2. Login with "Demo Partner"
3. Click "Partner Tools" dropdown
4. Click "Documents" link
5. **Expected:** Navigation completes without errors
6. **Check:** No "Maximum update depth exceeded" error in console

#### Test 2: Multiple Navigation Clicks

1. Login with "Demo Partner"
2. Click multiple navigation links in sequence:
   - Partner Tools → Documents
   - Partner Tools → Data Exchange
   - Profile → Settings
   - Profile → Notifications
3. **Expected:** All navigations work smoothly
4. **Check:** No console errors, no infinite loops

#### Test 3: Admin Navigation

1. Login with "Demo Admin"
2. Verify "Admin Portal" appears in Partner Tools
3. Click "Admin Portal"
4. **Expected:** Navigates to admin page
5. **Check:** No errors

#### Test 4: React DevTools Profiler

1. Open React DevTools → Profiler
2. Start recording
3. Login with demo user
4. Click several navigation links
5. Stop recording
6. **Expected:**
   - Navigation component renders only when necessary
   - No excessive render counts
   - Render times are reasonable

#### Test 5: Context Value Stability

1. Add console.log in Navigation component:

   ```typescript
   console.log('Navigation render', { isAuthenticated, isAdmin, isApproved })
   ```

2. Login with demo user
3. Click navigation links
4. **Expected:** Navigation only renders when auth state actually changes
5. **Check:** No repeated renders with same values

### Files Modified

1. **ga-water/src/lib/contexts/AuthContext.tsx**
   - Added `useMemo` import
   - Wrapped `setFakeAuth` in `useCallback`
   - Wrapped `refreshSession` in `useCallback`
   - Wrapped `signOut` in `useCallback`
   - Wrapped context value object in `useMemo`

2. **ga-water/src/components/navigation.tsx**
   - Already had memoized arrays (from previous fix)
   - Link click handlers use conditional state updates (safe)

### Expected Behavior After Fix

1. ✅ No "Maximum update depth exceeded" errors
2. ✅ Navigation links work correctly in demo mode
3. ✅ Dropdowns close properly when links are clicked
4. ✅ No infinite render loops
5. ✅ Acceptable performance (no excessive re-renders)

### Risk Assessment

**Risk Level:** Very Low

- All changes use standard React optimization patterns
- No breaking changes to API
- Backward compatible
- Defensive programming (only optimizes, doesn't change logic)

### Rollback Plan

If issues occur, revert these changes:

1. Remove `useMemo` from context value
2. Remove `useCallback` from functions (or keep if no issues)
3. The app will work but may have performance issues

### Next Steps

1. ✅ Test with Test Cases 1-5
2. ✅ Monitor for any console errors
3. ✅ Check React DevTools Profiler
4. ✅ Verify navigation works in both demo modes
5. If issues persist, refer to `NAVIGATION_DEBUG_ANALYSIS.md` for additional solutions

### Success Criteria Met

- ✅ Context value is memoized
- ✅ Context functions are memoized
- ✅ Navigation arrays are memoized
- ✅ No linting errors
- ✅ Code follows React best practices
