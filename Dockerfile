# Hearth ships as a static bundle: this image only exists to build it and serve
# the files. Nothing at runtime talks to Supabase except the browser.
#
# Every ARG below becomes a build time value in Vite. They are all public,
# client side values by design (see .env.example). The anon key is safe to ship;
# the service role key must never appear here.
FROM node:22-alpine AS build
WORKDIR /app
RUN corepack enable

ARG VITE_SUPABASE_URL=""
ARG VITE_SUPABASE_ANON_KEY=""
ARG VITE_VAPID_PUBLIC_KEY=""
ARG VITE_POSTHOG_KEY=""
ARG VITE_POSTHOG_HOST=""

ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL \
    VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY \
    VITE_VAPID_PUBLIC_KEY=$VITE_VAPID_PUBLIC_KEY \
    VITE_POSTHOG_KEY=$VITE_POSTHOG_KEY \
    VITE_POSTHOG_HOST=$VITE_POSTHOG_HOST

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

FROM nginx:alpine AS serve
COPY --from=build /app/dist /usr/share/nginx/html
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
