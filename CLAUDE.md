# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A single-file React component (`property-comparison.jsx`) for ranking London rental properties using a weighted multi-criteria scoring system. No build tooling or package.json exists — this component is meant to be dropped into a React + Tailwind CSS project.

## Architecture

The entire application lives in `property-comparison.jsx` as one default export: `PropertyRanker`.

### Data Layer
Properties are hardcoded as an array of objects with these fields:
- Identity: `name`, `area`, `link` (Rightmove URL)
- Rental: `beds` (1–2), `rent` (£/month)
- Third Space: `club`, `quality` (1–10 scale), `walkMins`
- Transport: `tubeStation`, `tubeLine`, `tubeWalk`, `overground`, `ogType`, `ogWalk`

### Scoring System
Four independent scoring functions (each normalizes to 0–100):
- `scoreThirdSpace(quality, walkMins)` — quality score with walk-time penalty
- `scoreTransport(tubeWalk, ogWalk)` — tube accessibility with overground bonus
- `scoreBedrooms(beds)` — 100 for 2-bed, 40 for 1-bed
- `scoreRent(rent, min, max)` — linear scale (lowest rent = 100)

`computeScores()` applies user-controlled weights to these four scores, sorts results, and returns ranked properties.

### Default Weights
Third Space 35%, Transport 30%, Bedrooms 20%, Rent 15% (must sum to 100).

### State
Only `useState` is used — no external state management. State tracks the four weights and whether the settings panel is open.

## Integration Requirements
- React (uses only `useState`)
- Tailwind CSS (all styling is via Tailwind utility classes)
- No backend, no API calls, no other npm dependencies
