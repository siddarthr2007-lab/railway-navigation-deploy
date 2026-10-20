# Railway Station Facility Navigation & Accessibility Web System

Full build — all phases (1 to 9) in one project.

## Stack
React (Vite) + Node.js + Express + MongoDB + Mongoose, plain CSS, REST API.

## Supported stations (v1)
All 5 stations now feature COMPLETE, routable navigation graphs and starting/ending points:
- **Chennai Central (MAS)**: 12 platforms, 27 facilities, 55 navigation nodes, 70 paths
- **Chennai Egmore (MS)**: 11 platforms, 26 facilities, 52 navigation nodes, 66 paths
- **Coimbatore Junction (CBE)**: 6 platforms, 21 facilities, 37 navigation nodes, 46 paths
- **Madurai Junction (MDU)**: 6 platforms, 21 facilities, 37 navigation nodes, 46 paths
- **Tiruchirappalli Junction (TPJ)**: 7 platforms, 22 facilities, 40 navigation nodes, 50 paths

Every facility (Entrances, Ticket Counters, Waiting Halls, Restrooms, Drinking Water, Canteen, ATMs, Information Desk, First Aid, and all Platforms) is linked to a navigation node and is fully routable in both directions.

## Google Maps-Style Turn-by-Turn Navigation Engine
The system includes an intelligent geometric turn-by-turn navigation engine (`backend/utils/navigationHelper.js`):
- **Dynamic Turn Calculation**: Evaluates incoming and outgoing trajectory vectors to generate accurate turns:
  - Compass Departure: "Head North / East / etc. from [Start] towards [Next Node]"
  - Accurate Turns: "Turn left", "Turn right", "Turn slight left", "Turn slight right", "Continue straight", "Make a sharp right", etc.
  - Specialized Actions: "Take the passenger elevator / lift", "Take the stairs", "Follow the accessible ramp"
  - Arrival: "Arrive at [Destination Facility]"
- **Wheelchair Accessibility Mode**: Automatically routes via elevators, gentle incline ramps, and wide concourses, skipping stairs.
- **Interactive UI**:
  - Prominent Google Maps Next-Turn guidance banner (Step-by-step guidance with Prev/Next controls)
  - Trip overview: Estimated walking time (`~2 min walk`), total distance, accessibility badge
  - Clickable turn step list with SVG direction icons; clicking any step highlights that turn on the interactive 2D floorplan map!

