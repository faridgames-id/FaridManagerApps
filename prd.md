Farid Shop Game v3.1
Premium Gaming Marketplace Operating System
Built Around The 8 Design Pillars
Vision

Farid Shop Game is no longer a stock management dashboard.

Farid Shop Game is a premium gaming marketplace operating system designed for managing, analyzing, selling, and growing a game account business.

The application must feel comparable to:

Arc Browser
Linear
Stripe Dashboard
Revolut
Apple Wallet
Raycast

The application must NOT feel like:

AdminLTE
Bootstrap Dashboard
Generic Inventory Management
Traditional ERP
Stock Management System
Design Foundation
Design Pillar #1 — Point Of View

Every screen must communicate:

Marketplace Activity
Business Growth
Revenue Opportunity
Product Demand
Professional Trust

The interface should make users feel:

"I am operating a premium digital marketplace."

Not:

"I am managing spreadsheets."

Design Pillar #2 — Typography
Font System

Display Font:

Clash Display

UI Font:

General Sans

Fallback:

Inter
Typography Scale

Display XL

48px

Display Large

40px

H1

32px

H2

28px

H3

24px

Body

16px

Small

14px

Caption

13px

Rules:

Never use text smaller than 12px
Strong visual hierarchy
Large premium headlines
Comfortable mobile readability
Design Pillar #3 — Color
Extracted From Premium Fintech Reference

Primary Lavender

#8B7CF8

Secondary Lavender

#A78BFA

Accent Blue

#7DD3FC

Accent Pink

#EC4899

Background

#F7F5FF

Surface

#FFFFFF

Surface Secondary

#F8FAFC

Text Primary

#111827

Text Secondary

#6B7280

Border

#E5E7EB

Success

#10B981

Warning

#F59E0B

Danger

#EF4444
Primary Gradient
linear-gradient(
135deg,
#8B7CF8 0%,
#A78BFA 45%,
#7DD3FC 100%
)
Design Pillar #4 — Hierarchy

Every screen must contain:

Primary Focus

Most important information.

Secondary Focus

Supporting information.

Actions

Actions must always be obvious.

Context

Additional information.

Dashboard Hierarchy

Viewport 1

Marketplace Overview
Revenue Snapshot
Demand Insights
Business Health Score

Viewport 2

Trending Accounts
Fast Selling Products
Recent Marketplace Activity

Viewport 3

Analytics
Calendar
Revenue Trends

Never place tables at the top of screens.

Never let filters dominate the layout.

Design Pillar #5 — Imagery

Use:

Soft gradients
Abstract marketplace illustrations
Premium iconography
Product thumbnails
AI insights cards

Avoid:

Generic stock icons
Low quality illustrations
Emoji-heavy interfaces

Every screen should feel visually alive.

Design Pillar #6 — Motion

Interactions should feel expensive.

Hover

scale(1.02)

Press

scale(0.98)

Card Entry

fade + translateY

Modal

blur + scale

Page Transition

shared element transition

Duration

150ms–300ms

Target

60 FPS

Never use abrupt animations.

Design Pillar #7 — Mobile

Android First.

Target Devices:

320px
360px
390px
412px

Rules:

Never compress content.

Never flatten layouts.

Never shrink typography.

Use horizontal swipeable sections for:

Analytics
Product Cards
Statistics
Tables
Quick Actions

Use:

Carousel patterns
Snap scrolling
Large touch targets

Minimum touch target:

44px
Design Pillar #8 — The Invisible Stuff

The quality users feel but cannot explain.

Must include:

Consistent spacing
Consistent typography
Consistent shadows
Consistent interaction patterns
Fast rendering
Instant feedback
Skeleton loading
Smooth transitions

Target Lighthouse:

95+

Target Interaction Latency:

<100ms
Layout System

Use Bento Grid.

Avoid:

Sidebar + Card Grid templates
Bootstrap layouts
Repetitive cards
Generic dashboards

Use:

Asymmetrical layouts
Visual focal points
Large spacing
Layered surfaces
Dashboard Redesign

Replace the current dashboard.

Create:

Marketplace Overview Hero

Contains:

Monthly Revenue
Business Health Score
Revenue Trend
Demand Indicator
Marketplace Activity

Contains:

Recently Sold Accounts
Recent Transactions
Marketplace Feed
Trending Section

Contains:

Trending Accounts
Fast Selling Products
High Demand Categories
Opportunity Center

Contains:

Stock Alerts
Restock Suggestions
AI Insights
Quick Actions

Contains:

Add Account
Record Sale
Search Marketplace
Open Calendar
Tables

Tables are tools.

Tables are NOT the product.

Requirements:

Rounded corners
Sticky headers
Integrated search
Integrated filters
Integrated sorting
Horizontal scrolling

Never squash tables on mobile.

Calendar

Calendar must feel like business intelligence.

Display:

Incoming Accounts
Revenue Events
Sales Activity
Business Reminders

Use the same design language as analytics cards.

Critical Rules

Do not perform a cosmetic redesign.

Do not preserve weak layouts.

Challenge every layout decision.

Prioritize product quality over implementation convenience.

Maintain all existing functionality while completely transforming the user experience.

The final application should feel like a premium gaming marketplace operating system with fintech-level visual quality, luxury SaaS aesthetics, HD visuals, smooth motion, and world-class mobile usability.

### Design Pillar #9 — Front-End Architecture & Mock Data Standards

Since backend integration is deferred, the Front-End must be engineered using robust, realistic Mock Data to simulate a fully operational environment. The architecture must support seamless transition to a real API in the future.

#### Tech Stack Requirements:
- Framework: Next.js (App Router) / React
- Styling: Tailwind CSS
- Animation: Framer Motion
- Icons: Lucide React
- Component Structure: Highly modular (separate UI from Mock Data).

#### Mock Data Schema & Business Logic:

1. Business Overview Data (Viewport 1)
The interface must consume a realistic data structure for the cockpit.
- `monthlyRevenue`: Integer (e.g., Rp 145,500,000)
- `revenueTrend`: Percentage (e.g., +12.5% from last month)
- `healthScore`: Integer out of 100 (e.g., 92 - "Excellent")
- `demandIndicator`: Array of objects showing hot titles.
  Format: `[{ game: "Valorant", trend: "High", icon: "Gamepad2" }, { game: "Mobile Legends", trend: "Surging", icon: "Sword" }]`

2. Game Account Object Model (For Viewport 2 & Tables)
When displaying products, every account must adhere to this data structure:
- `id`: String (e.g., "ACC-VAL-0092")
- `gameTitle`: String (e.g., "Valorant", "Genshin Impact")
- `tierRank`: String (e.g., "Radiant", "AR 55")
- `price`: Integer (e.g., 2500000)
- `status`: Enum ("Available", "In Escrow", "Sold")
- `sellerId`: String
- `visualAsset`: URL or Placeholder string for the account's hero image.

Rules for Mock Data:
- NEVER use generic "Lorem Ipsum".
- All mock data must reflect a premium Indonesian/Global gaming marketplace.
- Structure mock data in a separate utility file or clearly defined constants at the top of components to ensure easy swap to a real API later.