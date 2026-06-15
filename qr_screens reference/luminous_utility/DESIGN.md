---
name: Luminous Utility
colors:
  surface: '#f8f9fa'
  surface-dim: '#d9dadb'
  surface-bright: '#f8f9fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f5'
  surface-container: '#edeeef'
  surface-container-high: '#e7e8e9'
  surface-container-highest: '#e1e3e4'
  on-surface: '#191c1d'
  on-surface-variant: '#3c4a3d'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f2'
  outline: '#6c7b6b'
  outline-variant: '#bbcbb9'
  surface-tint: '#006d2f'
  primary: '#006d2f'
  on-primary: '#ffffff'
  primary-container: '#25d366'
  on-primary-container: '#005523'
  inverse-primary: '#3de273'
  secondary: '#5e5e5e'
  on-secondary: '#ffffff'
  secondary-container: '#e2e2e2'
  on-secondary-container: '#646464'
  tertiary: '#93492e'
  on-tertiary: '#ffffff'
  tertiary-container: '#ffa07e'
  on-tertiary-container: '#78351b'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#66ff8e'
  primary-fixed-dim: '#3de273'
  on-primary-fixed: '#002109'
  on-primary-fixed-variant: '#005322'
  secondary-fixed: '#e2e2e2'
  secondary-fixed-dim: '#c6c6c6'
  on-secondary-fixed: '#1b1b1b'
  on-secondary-fixed-variant: '#474747'
  tertiary-fixed: '#ffdbcf'
  tertiary-fixed-dim: '#ffb59b'
  on-tertiary-fixed: '#380d00'
  on-tertiary-fixed-variant: '#763319'
  background: '#f8f9fa'
  on-background: '#191c1d'
  surface-variant: '#e1e3e4'
  pure-white: '#FFFFFF'
  deep-black: '#000000'
  whatsapp-green: '#25D366'
  surface-gray: '#F9FAFB'
  text-muted: '#555555'
  border-light: '#F0F0F0'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style

The brand personality is utilitarian, efficient, and transparent, designed specifically for the fast-paced hospitality and SaaS environment. The design system prioritizes functional clarity over decorative flair, ensuring that content—specifically menu items and pricing—remains the focal point.

The design style is **High-Contrast Minimalism** with subtle **Glassmorphism** accents. It leverages a text-first layout that relies on rigorous typographic hierarchy and generous white space to create a premium, "invisible" interface. By stripping away heavy illustrations and ornate ornamentation, the UI evokes a sense of modern reliability and speed, making it highly accessible for both restaurant operators and diners.

## Colors

The palette is strictly controlled to maintain a professional SaaS aesthetic. **Pure White (#FFFFFF)** serves as the primary canvas, providing maximum "breathing room." **Deep Black (#000000)** is reserved for primary typography and structural elements, ensuring accessibility and high contrast.

**WhatsApp Green (#25D366)** acts as the sole chromatic accent, strategically used for primary call-to-actions, success states, and direct contact triggers. **Light Gray (#F9FAFB)** provides a subtle tonal shift for container backgrounds and section dividers, preventing the interface from feeling clinical or harsh. Neutral grays from the source material (#555555) are utilized specifically for secondary metadata and placeholder text to maintain a clear visual hierarchy.

## Typography

This design system utilizes **Inter** exclusively to achieve a clean, systematic look. The typographic scale is optimized for legibility at a glance, crucial for digital menus and administrative dashboards.

- **Headlines:** Use tight letter-spacing (-0.01em to -0.02em) for larger sizes to maintain a modern, "compact" feel.
- **Body Text:** Standard weights (400) are used for descriptions to ensure maximum readability against white backgrounds.
- **Hierarchy:** High contrast is achieved by pairing Bold (700) or Semi-Bold (600) headers with Medium (500) or Regular (400) body text. 
- **Mobile Scaling:** Large display type scales down aggressively on mobile to prevent excessive scrolling, while body sizes remain constant for accessibility.

## Layout & Spacing

The layout follows a **Fluid Grid** model with strict maximum widths for desktop to ensure content remains digestible. The system is built on a 4px baseline grid, with most components utilizing increments of 8px or 16px.

- **Mobile First:** Content is stacked vertically in a single column with 16px side margins.
- **Desktop:** Transition to a 12-column grid with a 1280px max-width container. 
- **Whitespace:** Use "oversized" vertical padding (64px to 128px) between major sections to emphasize the minimalist aesthetic. 
- **Scanning:** Menu items should be grouped in clear, high-contrast lists with consistent 16px vertical gaps (stack-md).

## Elevation & Depth

Hierarchy is established through **Tonal Layering** and **Glassmorphism** rather than traditional heavy shadows.

- **Base Layer:** Pure White (#FFFFFF) for the main page background.
- **Surface Layer:** Light Gray (#F9FAFB) used for card backgrounds or section highlighting to create subtle separation.
- **Backdrop Blur:** Navigation headers and floating action buttons use a `backdrop-filter: blur(12px)` with a semi-transparent white background (rgba(255, 255, 255, 0.8)). This creates a sophisticated, layered feel without adding visual weight.
- **Hover States:** Interactive elements utilize a "Subtle Hover Shadow"—a very soft, low-opacity spread (0px 4px 20px rgba(0, 0, 0, 0.05))—to signal interactivity without breaking the flat aesthetic.

## Shapes

The design system uses a consistent **12px (0.75rem)** corner radius for all primary UI elements, including cards, input fields, and buttons. This "Rounded" approach softens the high-contrast black and white palette, making the interface feel approachable and modern.

Small components like chips or tags should use the `rounded-xl` (1.5rem) setting to create a pill-shape, distinguishing them from structural containers.

## Components

- **Buttons:** Primary buttons are Solid Deep Black with White text. WhatsApp-specific buttons use the Primary Green. Secondary buttons use a 1px Border-Light (#F0F0F0) with no fill.
- **Input Fields:** Use 12px rounded corners with a 1px #F0F0F0 border. On focus, the border transitions to Deep Black.
- **Cards:** Cards should be borderless with a Light Gray (#F9FAFB) background or a 1px subtle border with no fill. Use no shadow in the default state; only apply the soft hover shadow on interaction.
- **Glass Headers:** Fixed top navigation must include the backdrop-blur effect to maintain context of the content scrolling beneath.
- **Chips/Status:** Use the Primary Green for "Available" or "Active" tags, paired with a low-opacity green background (10% opacity) for a refined look.
- **QR Code Container:** Should be housed in a clean, white, 12px rounded card with high padding to ensure scannability.