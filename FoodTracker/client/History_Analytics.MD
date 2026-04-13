🗓️ History Tab (HistoryTab.jsx)
Calendar-first approach:

Monthly calendar grid with visual indicators (calories shown on logged days)
Daily detail panel that shows when you click a day
Optional list view toggle for power users
Days with data are highlighted, today is marked with green border, selected day is highlighted
Read-only feel with intentional "Edit Day" button
📊 Analytics Tab (AnalyticsTab.jsx)
Trends & insights:

Time range toggle (7 days / 30 days)
Summary stats (avg calories, days logged, avg macros)
Calorie trend chart with clickable bars - hover to see values
Macro breakdown with color-coded percentages
Insights cards showing best/worst days (clickable to jump to History)
🔗 Cross-linking (App.jsx:1-20)
Clicking a day in Analytics → switches to History tab with that day selected
State management connects both tabs seamlessly
Calendar automatically navigates to the month containing the selected date
🎨 Styling (style.css)
Added comprehensive styles:

Clean, quiet design (not dashboard-heavy)
Cards and sections with consistent spacing
Color-coded visualizations (green = on track, orange = above goal, red = below goal)
Responsive layout for smaller screens
Smooth hover effects and transitions