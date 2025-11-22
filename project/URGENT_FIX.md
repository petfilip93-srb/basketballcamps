# URGENT FIX - Deploy Instructions

## The Problem
Missing TypeScript import causing the site to crash on load.

## The Fix
Add ONE line to `src/App.tsx`

### Step-by-Step Instructions:

1. Open `src/App.tsx` in your code editor

2. Find line 17 (the line with `import logoImage`)

3. Add this NEW line AFTER it:
   ```typescript
   import { Session } from '@supabase/supabase-js';
   ```

4. Save the file

5. Commit and push:
   ```bash
   git add src/App.tsx
   git commit -m "Fix Session type import"
   git push
   ```

6. Wait 2-3 minutes for Netlify to auto-deploy

7. Visit https://basketballcamps.netlify.app/ - it will work!

## What Changed
The imports section should now look like this:
```typescript
import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LandingPage } from './pages/LandingPage';
import { HomePage } from './pages/HomePage';
import { AuthPage } from './pages/AuthPage';
import { CampsPage } from './pages/CampsPage';
import { DashboardPage } from './pages/DashboardPage';
import { AdminPage } from './pages/AdminPage';
import { MyReviewsPage } from './pages/MyReviewsPage';
import { MyBookingsPage } from './pages/MyBookingsPage';
import { SubmitCampPage } from './pages/SubmitCampPage';
import { CampOwnerDashboardPage } from './pages/CampOwnerDashboardPage';
import { EditCampPage } from './pages/EditCampPage';
import { BasketballLoadingScreen } from './components/BasketballLoadingScreen';
import { CampWithCountry } from './types';
import { Menu, LogOut, Home, LayoutDashboard, Settings, Star, UserCircle, Calendar } from 'lucide-react';
import logoImage from './assets/IMG_20250506_134050_289.webp';
import { Session } from '@supabase/supabase-js';  // <-- THIS IS THE NEW LINE
```

## Timeline
- Fix: 2 minutes
- Deploy: 2-3 minutes
- Total: ~5 minutes

Then you can immediately start uploading camps!
