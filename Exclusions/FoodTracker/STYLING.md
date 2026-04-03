# Food Tracker - Styling Guide

## Design System Overview
This document defines the visual design system for the Food Tracker application. Follow these guidelines to maintain consistency across all components.

---

## Color Palette

### Primary Colors
```css
--bg-primary: #1a1a1a;        /* Main background */
--bg-secondary: #2a2a2a;      /* Cards, panels */
--text-primary: #ffffff;       /* Main text */
--text-secondary: #cccccc;    /* Secondary text */
--accent: #3b82f6;            /* Primary accent (blue) */
```

### Status Colors
```css
--success: #6bcf7f;           /* Green - ideal/on-target */
--warning: #ffd93d;           /* Yellow - moderate progress */
--danger: #ff6b6b;            /* Red/orange - low progress */
--info: #8b9dc3;              /* Gray/blue - excess */
```

### Macro Colors
```css
--protein: #3b82f6;           /* Blue */
--carbs: #f97316;             /* Orange */
--fats: #eab308;              /* Yellow/gold */
```

---

## Typography

### Font Families
```css
--font-primary: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

### Font Sizes
```css
--text-xs: 12px;
--text-sm: 14px;
--text-base: 16px;
--text-lg: 18px;
--text-xl: 24px;
--text-2xl: 32px;
```

### Font Weights
```css
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

---

## Spacing System

Follow an 8px grid system:
```css
--space-xs: 4px;
--space-sm: 8px;
--space-md: 16px;
--space-lg: 24px;
--space-xl: 32px;
--space-2xl: 48px;
```

---

## Component Patterns

### Circular Progress Bars
**Usage**: Display nutrient progress (calories, macros)

**Configuration**:
```javascript
{
  textColor: '#000',           // Black text for visibility
  trailColor: '#333',          // Dark gray track
  backgroundColor: '#1a1a1a',  // Matches app background
  fontWeight: 'bold'
}
```

**Color Logic** (percentage-based):
- `< 50%`: `#ff6b6b` (red/orange - low)
- `50-89%`: `#ffd93d` (yellow - moderate)
- `90-110%`: `#6bcf7f` (green - ideal)
- `> 110%`: `#8b9dc3` (gray/blue - excess)

**Sizes**:
- Calorie donut: 24px text
- Macro donuts: 16px text

---

## Layout Structure

### Page Layout
```
┌─────────────────────────────────────┐
│         Header / Navigation         │
├──────────────┬──────────────────────┤
│              │                      │
│  Left Panel  │    Right Panel       │
│  (Input)     │    (Visualization)   │
│              │                      │
└──────────────┴──────────────────────┘
```

### Component Hierarchy
1. **Tab Navigation** - Top-level navigation between sections
2. **Left Panel** - User input and data entry
3. **Right Panel** - Data visualization and summaries

---

## Component Specific Styling

### TodayTab
- **Left Panel**: Food search, input, and food list
- **Right Panel**: TodaySummary component
- **Success Messages**: Green background, 3-second fade
- **Search Results**: Dropdown with hover states

### TodaySummary
- **Header**: Encouragement message based on calorie progress
- **Calorie Overview**: Large circular progress bar
- **Macro Breakdown**: 3 circular progress bars in a row
- **Micro Overview**: Horizontal bars with toggle for show all

### Progress Indicators
- **Circular**: Calories and macros
- **Horizontal Bars**: Micronutrients
- **Percentage Display**: Always shown alongside targets

---

## State-Specific Styling

### Interactive States
```css
/* Buttons */
:hover   - Slight brightness increase
:active  - Scale down (0.98)
:disabled - Reduced opacity (0.5), no hover

/* Inputs */
:focus   - Border highlight with accent color
:invalid - Red border for validation errors
```

### Loading States
```css
/* Placeholder while data fetches */
.loading-message {
  color: var(--text-secondary);
  text-align: center;
}
```

---

## Accessibility

### Contrast Requirements
- Text on background: minimum 4.5:1 ratio
- Large text (18px+): minimum 3:1 ratio

### Interactive Elements
- Minimum touch target: 44x44px
- Clear focus indicators
- Keyboard navigation support

---

## File Organization

### CSS Structure
```
src/
  style.css           # Global styles and CSS variables
  components/
    Component.jsx     # Component logic + inline styles (if minimal)
```

### Styling Approach
- **Global styles**: `style.css` for base styles, resets, and CSS variables
- **Component styles**: CSS classes defined in `style.css`, referenced in components
- **Inline styles**: Used sparingly for dynamic styles (e.g., progress bar colors)

---

## Best Practices

1. **Use CSS Variables**: Define all colors, spacing, and font sizes as variables
2. **Semantic Naming**: Use descriptive class names (e.g., `.calorie-donut`, `.macro-breakdown`)
3. **Consistent Spacing**: Stick to the 8px grid system
4. **Mobile First**: Design for small screens, enhance for larger screens
5. **Component Isolation**: Each component should have scoped, predictable styles
6. **State Colors**: Use progress percentage logic consistently across all visualizations

---

## Future Considerations

### Planned Enhancements
- [ ] Dark/light mode toggle
- [ ] Custom color themes
- [ ] Responsive breakpoints for tablet/desktop
- [ ] Animation transitions for data updates
- [ ] Accessibility improvements (ARIA labels, screen reader support)

---

## Quick Reference

**Need to add a new nutrient visualization?**
1. Use the same color logic (< 50%, 50-89%, 90-110%, > 110%)
2. Match existing component patterns (CalorieDonut, MacroDonuts, MicroBars)
3. Ensure text is readable (`#000` for light backgrounds)

**Need to add a new section/tab?**
1. Follow the left panel (input) + right panel (visualization) layout
2. Use consistent spacing (`--space-md`, `--space-lg`)
3. Add tab button to navigation with `.tab-button` class

**Need to change colors?**
1. Update CSS variables in `style.css`
2. Changes propagate automatically throughout the app
