# Plywood Laser Shop

Онлайн магазин за къстъм шперплат продукти (лазерно гравиране и изрязване).

## Стек

- Next.js 15 (App Router) + TypeScript + Tailwind CSS
- Neon Postgres + Prisma 7 (`@prisma/adapter-neon`)
- Auth.js (админ вход)
- Vercel Blob за дизайни (или локално `public/uploads` без токен)

## Бърз старт (локално без Neon)

Остави `DATABASE_URL` празен в `.env` — приложението ползва JSON fallback в `data/local-db.json` и автоматично seed-ва демо продукти.

```bash
npm install
npm run dev
```

- Магазин: http://localhost:3000
- Админ: http://localhost:3000/admin/login (`admin@plywood.local` / `admin123`)

По желание: `npm run db:seed` презаписва локалните демо данни.

## Бърз старт (Neon)

1. Копирай env файла:

```bash
cp .env.example .env
```

2. Попълни в Neon Console:
   - `DATABASE_URL` — pooled connection (`-pooler`)
   - `DIRECT_URL` — direct connection (за migrate/db push)
   - `AUTH_SECRET` — произволна дълга стойност (`openssl rand -base64 32`)
   - по желание `ADMIN_EMAIL` / `ADMIN_PASSWORD`
   - по желание `BLOB_READ_WRITE_TOKEN`

3. Инсталирай и подготви БД:

```bash
npm install
npx prisma generate
npx prisma db push
npm run db:seed
```

4. Стартирай:

```bash
npm run dev
```

## Скриптове

| Команда | Описание |
|---|---|
| `npm run dev` | Dev сървър |
| `npm run build` | Production build |
| `npm run db:generate` | Prisma client |
| `npm run db:push` | Синхронизира схемата към Neon |
| `npm run db:seed` | Демо продукти + админ + pricing rules |
| `npm run db:studio` | Prisma Studio |

## Функции (MVP)

- Каталог шаблони с персонализация (текст, размер, дебелина, тип лазер)
- Качване на дизайн + калкулатор на цена
- Количка и guest checkout (банков превод / наложен платеж)
- Админ: поръчки/статуси, CRUD продукти, ценови правила

## Деплой

1. Push към GitHub
2. Import в Vercel
3. Добави същите env променливи
4. Build command: `prisma generate && next build`
