# Security Writeups Website

This website is built using [Docusaurus](https://docusaurus.io/) to host writeups for HTB Sherlocks and LetsDefend.

## Features
- **Theme**: Custom "Twilight" inspired theme (Dark/Light mode).
- **Structure**: Separate sections for HTB Sherlocks and LetsDefend.
- **Filters**: Easy/Medium/Hard tags and Types (DFIR/SOC).
- **Tech**: React, TypeScript, Infima (CSS).

## Getting Started

### 1. Installation

```bash
npm install
```

### 2. Run Locally

```bash
npm run start
```

This starts a local development server at `http://localhost:3000`.

### 3. Adding Writeups

- **HTB Sherlocks**: Create new `.md` files in `docs/HTB-Sherlocks/`.
- **LetsDefend**: Create new `.md` files in `docs/Lets-Defend/`.

Example Frontmatter:
```yaml
---
title: "Sherlock Name"
tags: [Easy, DFIR]
---
```

### 4. Build for Production

```bash
npm run build
```
