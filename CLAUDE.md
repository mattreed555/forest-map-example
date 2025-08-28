# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a data visualization project called "Forest Map" that creates a biologically-inspired representation of Pittsburgh's tree data. Instead of traditional treemap visualizations, it generates a virtual forest using Perlin noise and random walk algorithms to simulate how trees of different species might naturally cluster together.

## Architecture

### Core Components

- **index.html**: Main HTML file with embedded SVG download functionality
- **forestmap.js**: Contains the entire visualization logic including:
  - Random walk simulation algorithm for tree placement
  - Matrix-based forest generation (20x20 grid)
  - D3.js-based SVG rendering with interactive tooltips
  - Species clustering simulation using neighborhood analysis
- **leaf-data.csv**: Pittsburgh tree species data with leaf color and biomass percentages
- **style.css**: Visual styling with EB Garamond typography and autumn color palette
- **assets/**: Local assets folder containing favicon.ico and og-image.png

### Key Algorithms

The visualization uses a custom random walk algorithm to simulate natural tree distribution:
1. Plants initial trees at random locations for each species
2. Uses random walk from existing tree locations to place additional trees of the same species
3. Creates natural clustering patterns by preferentially placing trees near others of the same species
4. Wraps around grid edges to create a toroidal topology

### Data Flow

1. Loads CSV data containing tree species, leaf colors, and biomass percentages
2. Converts biomass percentages to approximate leaf counts for the 400-tile grid
3. Simulates forest growth using random walk placement
4. Renders final forest as colored rectangles with species tooltips
5. Provides SVG download functionality for the generated visualization

### Dependencies

- D3.js v7 (loaded from CDN)
- seedrandom library v3.0.5 (for reproducible randomization)
- External: EB Garamond font from Google Fonts

### Color Mapping

The project uses a predefined color palette that maps leaf color categories to CSS colors:
- yellow, yellow-brown, orange-red, red, evergreen, green, brown, purple

## Development Notes

This is a static web project with no build process - files can be served directly from a web server. The visualization generates the same output on each page load due to seeded randomization (`Math.seedrandom('For KC')`).

The project was migrated from Glitch hosting, with CDN assets moved to the local `assets/` folder.