# Manifesto — Vitrine Yupoo

Vitrine web que agrega catálogos Yupoo de múltiplas lojas numa interface única.

## Rodando localmente

```bash
npm install
npm run dev
```

Acesse `http://localhost:3000`. Os produtos são buscados do Yupoo via servidor (sem proxy de CORS).

## Adicionando ou editando álbuns

Edite o arquivo [`config/albums.ts`](./config/albums.ts).

Cada entrada segue o tipo:

```ts
{
  nome: string;       // nome exibido na interface
  url: string;        // URL da página de álbuns da loja no Yupoo
  senha?: string;     // senha do álbum, se necessário
  categoria: "Tênis" | "Bolsas" | "Roupas" | "Infantil" | "Luxo";
}
```

## Deploy (Vercel)

```bash
vercel --prod
```

> Se ainda não tiver conta configurada, rode `vercel login` primeiro.

## Arquitetura

- `config/albums.ts` — lista de lojas e configurações
- `app/api/sync/route.ts` — Route Handler Node.js que faz o scraping de todas as lojas (cache de 15 min)
- `app/api/product/[id]/route.ts` — busca as fotos de um produto individual sob demanda (só quando o usuário abre o modal)
- `components/CatalogClient.tsx` — interface principal (filtros, favoritos, recentes — tudo em `localStorage`)

### Modo demo

Se todas as lojas falharem (Yupoo fora, parser desatualizado, rede bloqueada), a vitrine exibe produtos de exemplo com um banner de aviso. A vitrine nunca abre vazia.
