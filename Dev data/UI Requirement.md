# UI/UX Requirements

## Design Philosophy

OneApp should have a **clean, modern, and intuitive** user interface inspired by the Nobleco project design patterns. The UI prioritizes:
- **Clean Light Theme**: Professional, bright, and airy aesthetic
- **User experience**: Intuitive navigation and clear visual hierarchy
- **Visual clarity**: Well-organized layout with consistent spacing
- **Responsive design**: Seamless experience across all devices
- **Smooth interactions**: Polished animations and transitions
- **Accessibility**: WCAG compliant with proper contrast and keyboard navigation

## Layout Structure

### Three-Part Layout System

The application follows a **three-part layout structure**:

1. **Sidebar** (Left Panel)
   - Fixed width: 240px (expanded) / 84px (collapsed)
   - Collapsible with smooth animation
   - Contains navigation menu with sections
   - Logo/branding at top
   - Toggle button for expand/collapse
   - Persists state in localStorage

2. **Header** (Top Bar)
   - Fixed height, full width
   - Contains page title with contextual icon
   - User menu dropdown (avatar, name, actions)
   - Mobile menu toggle button
   - Sticky positioning

3. **Main Content** (Center Area)
   - Scrollable content area
   - Padding: 20px
   - Contains page-specific content
   - Only this area scrolls (no window scroll)

### Layout Grid System

```
┌─────────────────────────────────────────┐
│  Sidebar  │  Header                    │
│  (240px)  │  (Full Width)               │
│           ├─────────────────────────────┤
│           │                             │
│           │  Main Content                │
│           │  (Scrollable)                │
│           │                             │
└───────────┴─────────────────────────────┘
```

**Grid Configuration:**
- Root container: `grid-template-columns: 240px 1fr`
- Collapsed: `grid-template-columns: 84px 1fr`
- Main area: `grid-template-rows: auto 1fr`
- Gap: 16px between sidebar and main area

## Theme & Style

### Color Palette (Light Theme - Default)

```css
:root {
    /* Background Colors */
    --bg: #f6f8fb;                    /* Main background */
    --panel: #ffffff;                  /* Card/panel background */
    --bg-secondary: #f9fafb;           /* Secondary background */
    
    /* Text Colors */
    --text: #101828;                   /* Primary text */
    --text-primary: #101828;           /* Primary text (alias) */
    --muted: #475467;                  /* Muted/secondary text */
    
    /* Primary Colors */
    --primary: #2563eb;                /* Primary blue */
    --primary-dark: #1d4ed8;           /* Primary dark */
    --primary-700: #1d4ed8;            /* Primary 700 shade */
    
    /* Semantic Colors */
    --success: #10b981;                 /* Success green */
    --success-light: #d1fae5;          /* Success light background */
    --danger: #ef4444;                  /* Error/danger red */
    --danger-dark: #dc2626;             /* Danger dark */
    --danger-light: #fef2f2;            /* Danger light background */
    --info: #3b82f6;                    /* Info blue */
    --info-light: #dbeafe;              /* Info light background */
    
    /* Borders & Dividers */
    --border: #e5e7eb;                  /* Border color */
}
```

### Background Effects

- **Body Background**: Radial gradients for depth
  ```css
  background: radial-gradient(1200px 900px at 80% -10%, #e6efff 0%, transparent 45%),
              radial-gradient(1000px 700px at -10% 20%, #dbeafe 0%, transparent 50%),
              var(--bg);
  ```

- **Auth Pages**: Additional gradient overlays with blur effects

### Typography

- **Font Family**: System fonts stack
  ```css
  font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, 
               Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji";
  ```

- **Font Sizes**:
  - Page titles: 700 weight, large size
  - Section headers: 600 weight, uppercase
  - Body text: 400-500 weight, 14-16px
  - Muted text: 14px, var(--muted)

- **Font Weights**:
  - Bold: 700 (headings)
  - Semi-bold: 600 (labels, buttons)
  - Medium: 500 (body emphasis)
  - Regular: 400 (body text)

### Spacing System

- **Base Unit**: 4px
- **Common Spacings**:
  - 4px (xs)
  - 8px (sm)
  - 12px (md)
  - 16px (lg) - **Primary spacing**
  - 20px (xl)
  - 24px (2xl)
  - 28px (3xl)
  - 40px (4xl)

- **Component Spacing**:
  - Sidebar padding: 16px 12px
  - Header padding: 10px 16px
  - Content padding: 20px
  - Card padding: 24px
  - Button padding: 10px 14px

### Border Radius

- **Small**: 8px (buttons, small elements)
- **Medium**: 10px (inputs, nav items)
- **Large**: 12px (cards, sections)
- **Extra Large**: 16px (main panels, modals)
- **Full**: 999px (pills, avatars)

### Shadows

- **Subtle**: `0 4px 16px rgba(2, 8, 23, 0.05)`
- **Medium**: `0 8px 24px rgba(2, 8, 23, 0.06)`
- **Large**: `0 12px 30px rgba(2, 8, 23, 0.06)`
- **Modal**: `0 24px 80px rgba(2, 8, 23, 0.16)`
- **Inset**: `inset 0 1px 0 rgba(255, 255, 255, 0.6)`

## Z-Index System

Organized hierarchy to prevent overlap issues:

```css
:root {
    /* Base elements */
    --z-base: 1;
    --z-content: 10;
    --z-card: 20;
    --z-button: 30;
    
    /* Interactive elements */
    --z-dropdown: 100;
    --z-dropdown-active: 1000;
    --z-tooltip: 120;
    --z-popover: 130;
    
    /* Navigation and headers */
    --z-header: 200;
    --z-sidebar: 300;
    --z-mobile-menu: 400;
    
    /* Modals and overlays */
    --z-modal-backdrop: 99999;
    --z-modal: 99999;
    --z-modal-content: 99999;
    
    /* Critical system elements */
    --z-notification: 2000;
    --z-loading: 3000;
    --z-debug: 9999;
}
```

## UI Components

### Sidebar Component

**Structure:**
- Logo section at top with toggle button
- Navigation menu with sections
- Collapsible sections with expand/collapse
- Active state indicators
- Smooth collapse/expand animation

**Features:**
- **Collapsible**: Toggle between 240px (expanded) and 84px (collapsed)
- **Sections**: Grouped navigation items with headers
- **State Persistence**: Saves collapsed state and section states to localStorage
- **Mobile Behavior**: Overlay on mobile, closes on navigation
- **Active States**: Visual indication of current page/section
- **Icons**: SVG icons for each navigation item

**Styling:**
- Background: `var(--panel)` (white)
- Border: `1px solid var(--border)`
- Border radius: `16px`
- Shadow: `0 8px 24px rgba(2, 8, 23, 0.06)`
- Transition: `width 0.2s ease`

**Navigation Items:**
- Padding: `8px 10px`
- Border radius: `10px`
- Gap: `8px` between icon and text
- Hover: `background: rgba(0, 0, 0, 0.06)`
- Active: Same as hover + active class

**Sections:**
- Section headers: Uppercase, 600 weight, with chevron icon
- Collapsible content: Nested navigation items
- Active section: Highlighted border/background

### Header Component

**Structure:**
- Mobile menu toggle (left, mobile only)
- Page title with contextual icon (center-left)
- User menu dropdown (right)

**Features:**
- **Page Title**: Dynamic title with route-based icon
- **User Menu**: Avatar, name, dropdown with actions
- **Mobile Toggle**: Hamburger menu button (mobile only)
- **Dropdown**: Profile, Settings, Logout options
- **Avatar**: Image or fallback letter avatar with color

**Styling:**
- Background: `var(--panel)` (white)
- Border: `1px solid var(--border)`
- Border radius: `16px`
- Shadow: `0 8px 24px rgba(2, 8, 23, 0.06)`
- Padding: `10px 16px`
- Height: `fit-content`

**User Menu:**
- Avatar: 28px circle (admin) / 40px circle (user)
- Border radius: `999px` (pill shape)
- Padding: `6px 10px`
- Hover: `background: rgba(0, 0, 0, 0.06)`

**Dropdown:**
- Position: Absolute, right-aligned
- Background: White
- Border: `1px solid var(--border)`
- Border radius: `8px`
- Shadow: `0 4px 12px rgba(0, 0, 0, 0.15)`
- Min width: `160px`
- Z-index: `10000`

### Main Content Area

**Structure:**
- Scrollable container
- Page-specific content
- Cards, tables, forms, etc.

**Styling:**
- Background: `var(--panel)` (white)
- Border: `1px solid var(--border)`
- Border radius: `16px`
- Shadow: `0 8px 24px rgba(2, 8, 23, 0.06)`
- Padding: `20px`
- Overflow: `overflow-y: auto` (vertical scroll only)
- Min height: `400px`

### Cards

**Styling:**
- Background: `var(--panel)` (white)
- Border: `1px solid var(--border)`
- Border radius: `12px` (small) or `16px` (large)
- Padding: `16px` (small) or `24px` (large)
- Shadow: `0 4px 16px rgba(2, 8, 23, 0.05)` (small) or `0 8px 24px rgba(2, 8, 23, 0.06)` (large)

### Buttons

**Primary Button:**
- Background: `var(--primary)` (#2563eb)
- Color: White
- Border: Transparent
- Border radius: `10px`
- Padding: `10px 14px`
- Font weight: `600`
- Hover: `background: var(--primary-700)`
- Transition: `background 0.2s ease`

**Secondary Button:**
- Background: Transparent
- Color: `var(--text)`
- Border: `1px solid var(--border)`
- Border radius: `10px`
- Padding: `10px 14px`
- Font weight: `600`
- Hover: `background: rgba(0, 0, 0, 0.06)`

**Icon Button:**
- Background: Transparent
- Border: `1px solid var(--border)`
- Border radius: `8px`
- Padding: `4px 6px`
- Hover: `background: rgba(0, 0, 0, 0.06)`

### Forms

**Input Fields:**
- Padding: `12px 12px`
- Border radius: `10px`
- Border: `1px solid var(--border)`
- Background: `var(--panel)`
- Focus: `border-color: var(--primary)` + `box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15)`
- Transition: `border-color 0.2s ease, box-shadow 0.2s ease`

**Labels:**
- Font weight: `600`
- Gap: `6px` from input
- Display: `grid`

### Tables

**Table Wrapper:**
- Width: `100%`
- Overflow: `overflow-x: auto`
- Padding bottom: `100px` (for dropdowns)
- Margin bottom: `-100px`

**Table Styling:**
- Border: `1px solid var(--border)`
- Border radius: `12px`
- Overflow: Hidden
- Background: `var(--panel)`

### Modals

**Overlay:**
- Position: Fixed, full screen
- Background: `rgba(16, 24, 40, 0.38)`
- Backdrop filter: `blur(2px)`
- Z-index: `999999`

**Modal Card:**
- Position: Fixed, centered
- Background: `var(--panel)`
- Border: `1px solid var(--border)`
- Border radius: `16px`
- Shadow: `0 24px 80px rgba(2, 8, 23, 0.16)`
- Width: `min(860px, calc(100vw - 64px))`
- Max height: `min(85vh, calc(100vh - 96px))`
- Padding: `20px`
- Z-index: `999999`

**Modal Header:**
- Display: Flex, space-between
- Font weight: `700`
- Margin bottom: `0px`

**Modal Close Button:**
- Border: `1px solid var(--border)`
- Background: `var(--panel)`
- Border radius: `8px`
- Size: `32px × 32px`
- Display: Grid, centered

## Animations & Transitions

### Transition Timing

- **Standard**: `0.2s ease`
- **Smooth**: `0.3s ease`
- **Fast**: `0.15s ease`

### Common Transitions

- **Sidebar collapse**: `width 0.2s ease`
- **Hover effects**: `background-color 0.2s ease`
- **Focus effects**: `border-color 0.2s ease, box-shadow 0.2s ease`
- **Modal appearance**: Transform + opacity

### Animation Principles

- **Smooth**: All transitions use ease timing
- **Subtle**: Animations are not distracting
- **Purposeful**: Animations provide feedback
- **Performance**: Use transform and opacity for best performance

## Responsive Design

### Breakpoints

- **Mobile**: `≤ 768px`
- **Tablet**: `769px - 1024px`
- **Desktop**: `> 1024px`

### Mobile Behavior

**Sidebar:**
- Hidden by default
- Overlay when open
- Full height, positioned absolute
- Closes on navigation or overlay click
- Always expanded when opened on mobile

**Header:**
- Mobile menu toggle visible
- User menu remains functional
- Page title may truncate

**Content:**
- Full width
- Padding adjusted: `16px` (mobile) vs `20px` (desktop)

**Modals:**
- Full width minus padding: `calc(100vw - 32px)`
- Max height: `calc(100vh - 32px)`

### Mobile Overlay

- Dark overlay when sidebar is open
- Click to close
- Backdrop blur effect
- Z-index: `400`

## Icons

### Icon System

- **Format**: SVG inline components
- **Size**: 18px × 18px (standard), 16px × 16px (small)
- **Stroke**: `currentColor`, `2px` width
- **Style**: `strokeLinecap="round"`, `strokeLinejoin="round"`
- **Color**: Inherits from parent (text color)

### Icon Usage

- Navigation items: 18px icons
- Buttons: 16px icons
- Headers: 18px icons with 8px margin-right
- Dropdowns: 16px icons with 8px margin-right

### Common Icons

- Dashboard, Users, Settings, Logout
- Chevron (left, right, up, down)
- Menu (hamburger)
- Plus, Search, Filter
- Eye, Trash, Edit
- And more as needed

## UX Enhancements

### State Persistence

- **Sidebar collapsed state**: Saved to localStorage
- **Section expanded states**: Saved to localStorage
- **User preferences**: Saved to localStorage or backend

### Visual Feedback

- **Hover states**: Background color change
- **Active states**: Highlighted background
- **Focus states**: Border color + box shadow
- **Loading states**: Spinner or skeleton screens
- **Error states**: Red border + error message
- **Success states**: Green background + success message

### Accessibility Features

- **Keyboard Navigation**: Full keyboard support
- **Focus Indicators**: Clear focus outlines
- **ARIA Labels**: Proper labels for screen readers
- **Color Contrast**: Minimum 4.5:1 ratio
- **Semantic HTML**: Proper HTML structure

### User Experience Patterns

- **Click outside to close**: Dropdowns, modals
- **Escape key to close**: Modals, dropdowns
- **Smooth scrolling**: Content areas
- **Loading indicators**: For async operations
- **Error boundaries**: Graceful error handling
- **Toast notifications**: For success/error messages

## Implementation Guidelines

### CSS Architecture

- **CSS Variables**: Use CSS custom properties for theming
- **CSS Modules**: Component-scoped styles
- **Global Styles**: Base styles in main CSS file
- **Utility Classes**: Reusable utility classes

### Component Structure

```tsx
// Layout Component Structure
<div className="admin-root">
  <Sidebar />
  <div className="admin-main">
    <Header />
    <main className="admin-content">
      {children}
    </main>
  </div>
</div>
```

### State Management

- **Local State**: React useState for UI state
- **localStorage**: For persistence (sidebar, sections)
- **Context API**: For theme, auth, etc.

### Performance Optimization

- **Lazy Loading**: Code splitting for routes
- **Memoization**: React.memo for expensive components
- **Virtual Scrolling**: For long lists
- **Image Optimization**: Lazy loading, compression

## Design Tokens Reference

### Spacing Scale
```
4px   → xs
8px   → sm
12px  → md
16px  → lg (primary)
20px  → xl
24px  → 2xl
28px  → 3xl
40px  → 4xl
```

### Border Radius Scale
```
8px   → Small elements
10px  → Inputs, buttons
12px  → Cards, sections
16px  → Panels, modals
999px → Pills, avatars
```

### Shadow Scale
```
Subtle:  0 4px 16px rgba(2, 8, 23, 0.05)
Medium:  0 8px 24px rgba(2, 8, 23, 0.06)
Large:   0 12px 30px rgba(2, 8, 23, 0.06)
Modal:   0 24px 80px rgba(2, 8, 23, 0.16)
```

## Future Enhancements

- **Dark Mode**: Alternative color scheme
- **Customizable Themes**: User-defined color schemes
- **Advanced Animations**: Micro-interactions
- **Progressive Web App**: Offline support, installable
- **Accessibility Improvements**: Enhanced screen reader support
- **Internationalization**: Multi-language support

## Reference Implementation

This UI design is based on the **Nobleco** project reference implementation, which demonstrates:
- Clean, modern light theme design
- Three-part layout (Sidebar, Header, Main Content)
- Collapsible sidebar with sections
- Responsive mobile design
- Smooth animations and transitions
- Professional component styling
- Excellent UX patterns

All UI components should follow the patterns and styling established in the Nobleco reference project.
