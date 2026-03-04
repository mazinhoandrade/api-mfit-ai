## Git

- **SEMPRE** use [Conventional Commits](https://www.conventionalcommits.org/) para mensagens de commit. Exemplo: `feat: add start workout session endpoint`, `fix: workout plan validation`, `docs: update architecture rules`.
- **NUNCA** faça commit sem a permissão explícita do usuário. Sempre aguarde o usuário pedir para commitar.

## Fastify: Rotas de API

- Use cases nunca devem importar Fastify.
- Routes nunca devem conter regra de negócio.
- Nunca acessar Prisma diretamente dentro de routes.
