# Back Pressure POC

Trying to make a game where you control the flow of fluid with various mechanisms.

## Design Philosophies

- As few knobs as possible: Build a system with parts and layout instead of fiddling with numbers and rates
- Dynamic systems that react and change over time, balancing chaos and order
- Large systems made of smaller subsystems; copy and paste collections of structures
- Immediate and obvious visual changes when something starts or stops working
- Location and distance matter: moving items around should affect the system. A grid with no overlap?

## Inspirations

- Factorio: copy/paste, blueprints, fluid mechanics, production rates, drains to consume outputs
- Mindustry: calculating flow instead of modelling discrete items on belts
- Electronics: voltage, current, capacitors, oscillators, bi-stable systems

## Ideas

- Power system: most structures consume power, some produce power by consuming other fluids. Location based, connections, power lines, etc.
- Start with simplified fluids and move up to more complicated fluids with wastes and by-products
- Hexagonal grid and round structures

## Phase One

- Drag building from dock to layout
- Pan and zoom camera ✔
- Click on structure to see status: flow, blocked, starved, etc.
- Connect outputs to inputs
- Three fluids: Red + Blue = Purple ✔
- Structures ✔
  - Well: produces Red or blue fluid ✔
  - Chemical Plant: combines Red and Blue to make Purple ✔
  - Drain: consumes a fluid ✔
