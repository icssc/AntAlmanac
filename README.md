![AntAlmanac](apps/antalmanac/public/banner.png)

## About

AntAlmanac is a schedule planner for UC Irvine students.

Features:
- Search classes by department, code, or keywords  
- Calendar preview of schedules  
- Quick links to professor reviews & grade data  
- Interactive campus map  

---

## Quick Start (Local Dev)

```bash
git clone https://github.com/icssc/AntAlmanac && cd AntAlmanac && git checkout dsns/create-dev-environment && ./start.sh
```

Open http://localhost:3000 in browser.

Hot reload is enabled — changes show instantly.

### Common Commands
```bash
pnpm dev        # start dev server
pnpm test       # run tests
pnpm db:studio  # open database UI
```

### Requirements

- Node.js 22+
- pnpm 10+
- Docker (for local DB)

Install pnpm:
```bash
npm install -g pnpm
```
