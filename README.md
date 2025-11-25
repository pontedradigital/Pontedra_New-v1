# Ambiente Local Pontedra

## Pré‑requisitos

- Node.js 20+
- PNPM ou NPM

## Variáveis de ambiente

Crie `.env.local` na raiz do projeto com:

```
VITE_LOCAL_AUTH=true
VITE_LOCAL_USER_EMAIL=teste@teste.com
VITE_LOCAL_USER_PASSWORD=123456
VITE_LOCAL_AUTH_MAX_ATTEMPTS=5
VITE_LOCAL_AUTH_WINDOW_MS=120000
VITE_LOCAL_AUTH=true
```

Este projeto roda sem serviços externos.

## Executando

```
npm install
npm run dev
```

Servidor local: `http://localhost:8080/`

## Login de teste

- E‑mail: `teste@teste.com`
- Senha: `123456`

## Segurança

- Rate limit básico: máximo de 5 tentativas em 2 minutos (configurável).
- Credenciais lidas de `.env.local`; não são persistidas no código.
- Para HTTPS local, habilite `server.https` no `vite.config.ts` com certificados gerados via `mkcert`.

## Fluxo

1. Acesse `/login` e autentique.
2. Redireciona para `/loading` e depois `/dashboard`.

## Solução de problemas

- Erro de login: verifique `VITE_LOCAL_AUTH` e variáveis de credenciais.
- Página não acessa dados: verifique o console e variáveis locais.
- Portas ocupadas: ajuste `vite.config.ts` para outra porta.

## Histórico de versões

- 2025-11-24
  - Removidos botões "Entrar" e "Acessar Plataforma" da `LandingNavbar` (desktop e mobile).
  - Reorganização do layout do navbar para manter alinhamento sem CTAs.
  - Limpeza de handlers e referências DOM associados aos botões.
  - Build e lint executados com sucesso; testes manuais em tamanhos responsivos via preview.
