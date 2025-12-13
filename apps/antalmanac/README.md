# AntAlmanac

## Getting Started

Database
```bash
docker compose up -d --build
```

Database schema
```bash
pnpm -F db exec drizzle-kit migrate
````

Static data
```bash
pnpm get-data
```


Run development website
```bash
pnpm dev
```
