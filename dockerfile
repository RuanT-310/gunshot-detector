# =================================================================================================
#  ESTÁGIO DE DEPENDÊNCIAS (Dependencies Stage)
# =================================================================================================
# Use uma imagem base do Node.js. Recomenda-se usar uma versão LTS (Long Term Support).
FROM node:18-alpine AS deps

# Define o diretório de trabalho dentro do contêiner.
WORKDIR /app

# Copia o package.json e o package-lock.json.
# Copiar esses arquivos separadamente aproveita o cache de camadas do Docker.
COPY package.json package-lock.json* ./

# Instala as dependências usando 'npm ci'.
# 'npm ci' é otimizado para ambientes de automação como o Docker.
# Ele instala as versões exatas do package-lock.json, garantindo builds consistentes.
RUN npm ci

# =================================================================================================
#  ESTÁGIO DE BUILD (Builder Stage)
# =================================================================================================
# Este estágio é responsável por compilar o código Next.js.
FROM node:18-alpine AS builder

WORKDIR /app

# Copia as dependências do estágio anterior.
COPY --from=deps /app/node_modules ./node_modules

# Copia o restante do código da aplicação.
COPY . .

# Expõe as variáveis de ambiente de build-time, se necessário.
# Exemplo: ARG NEXT_PUBLIC_API_URL
# ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Executa o script de build para compilar a aplicação para produção.
RUN npm run build

# =================================================================================================
#  ESTÁGIO FINAL DE PRODUÇÃO (Production Stage)
# =================================================================================================
# Este é o estágio final que resultará na imagem que será executada em produção.
FROM node:18-alpine AS runner

WORKDIR /app

# Define o ambiente para produção.
ENV NODE_ENV=production

# Recomenda-se criar um usuário não-root para executar a aplicação por motivos de segurança.
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copia os artefatos de build do estágio 'builder'.
# Otimizado para a configuração `output: 'standalone'` em `next.config.js`.
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Define o usuário para executar a aplicação.
USER nextjs

# Expõe a porta em que a aplicação Next.js será executada.
EXPOSE 3000

# Define a variável de ambiente PORT, que é usada pelo Next.js.
ENV PORT 3000

# O comando para iniciar o servidor Next.js em produção.
CMD ["node", "server.js"]