# Customization Guide

## How to Add Your Logo and Site Name

### 1. Add Your Logo File

Place your logo file in the `public` folder of the project. For example:
- `public/logo.png`
- `public/logo.svg`

### 2. Update the Logo in All Pages

Search for the comment `Replace the emoji below with:` in these files and replace the emoji with your logo image:

**Landing Page** (`src/pages/LandingPage.tsx` - line 16-17):
```tsx
<img src="/logo.png" alt="Logo" className="w-20 h-20 object-contain" />
```

**Auth Page** (`src/pages/AuthPage.tsx` - line 60-61):
```tsx
<img src="/logo.png" alt="Logo" className="w-12 h-12 object-contain" />
```

**Navigation** (`src/App.tsx` - line 61-62):
```tsx
<img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
```

### 3. Update the Site Name

Search for the comment `Replace "BasketballCamps" with your site name` in these files:

**Landing Page** (`src/pages/LandingPage.tsx` - line 21-22):
```tsx
<h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
  Your Site Name Here
</h1>
```

**Auth Page** (`src/pages/AuthPage.tsx` - line 63-66):
```tsx
<h1 className="text-2xl font-bold text-slate-900">
  Your Site Name Here
</h1>
```

**Navigation** (`src/App.tsx` - line 63-64):
```tsx
Your Site Name Here
```

### 4. Update Booking Modal Logo

In `src/components/BookingModal.tsx` (line 30), replace:
```tsx
<span className="text-3xl">🏀</span>
```

With:
```tsx
<img src="/logo.png" alt="Logo" className="w-12 h-12 object-contain" />
```

### 5. Rebuild the Project

After making these changes, run:
```bash
npm run build
```

## Logo Best Practices

- **Format**: PNG or SVG recommended for best quality
- **Size**: At least 512x512px for best results
- **Background**: Transparent background works best
- **Aspect Ratio**: Square (1:1) works best with the current design
