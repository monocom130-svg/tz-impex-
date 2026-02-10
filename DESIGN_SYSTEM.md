# T-Z IMPEX: UI/UX Design System Definition

This document defines the visual language and user experience standards for the T-Z IMPEX platform.

## 1. Visual Identity

### Color Palette
- **Primary**: `#4F46E5` (Indigo-600) — Represents trust and technology.
- **Secondary**: `#7C3AED` (Purple-600) — Represents luxury and quality.
- **Accent**: `#F59E0B` (Amber-500) — Used for high-conversion CTAs and "Flash Sale" highlights.
- **Background**: `#F8FAFC` (Slate-50) — A clean, light-gray base for clarity.
- **Dark Neutral**: `#0F172A` (Slate-950) — Used for "Rider Portal" and high-contrast text.

### Typography
- **Primary Font**: `Inter` (Sans-serif) via Google Fonts.
- **Headings**: Semi-bold to Black (weight 600-900) for a strong, authoritative presence.
- **Body**: Regular (weight 400) with generous line-height (`1.6`) for readability.

## 2. Component Language

### The "Glass-Card"
Cards should utilize a subtle backdrop-blur effect on white backgrounds with thin, light borders.
- **Border**: `1px solid rgba(226, 232, 240, 0.8)`
- **Shadow**: `shadow-sm` transitioning to `shadow-xl` on hover.
- **Radius**: `2rem` (32px) for a soft, premium mobile-first look.

### Interactive Elements
- **Buttons**: All buttons must have a `transition-all` property.
- **Hover States**: Scaling by `1.05` and slight background darkening.
- **Active States**: Scaling by `0.95` to provide tactile feedback.

## 3. UX Patterns

### Navigation Flow
- **Speed to Cart**: Users should be able to add a product to their cart in 2 clicks from the Home page.
- **Search-First Design**: The search bar is elevated in the Header to encourage rapid discovery.
- **Context-Aware Headers**: Different headers for Admin, Rider, and Customer roles to minimize cognitive load.

### Feedback Systems
- **Toasts**: Real-time confirmation for "Added to Cart" and "Review Submitted".
- **Empty States**: Use unique iconography and "Call to Action" buttons when no data is found (e.g., empty cart).
