# News Manager - Painel de Noticias

Painel de gerenciamento para visualizacao de noticias agregadas do projeto cron_politics.

## Funcionalidades

- Dashboard com estatisticas gerais
- Lista de noticias com filtros avancados (categoria, fonte, data, score)
- Busca por titulo e descricao
- Ordenacao por score e data
- Visualizacao de fontes RSS
- Estatisticas e logs de fetch
- Autenticacao protegida

## Configuracao

### Variaveis de Ambiente

Copie `.env.example` para `.env` e configure:

```env
# Supabase - pegar do projeto cron_politics
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key

# Credenciais de Admin
VITE_ADMIN_USER=admin
VITE_ADMIN_PASS=sua-senha-segura
```

### GitHub Secrets

Para deploy no GitHub Pages, configure os seguintes secrets no repositorio:

1. Va em **Settings > Secrets and variables > Actions**
2. Adicione os secrets:

| Secret | Descricao |
|--------|-----------|
| `VITE_SUPABASE_URL` | URL do projeto Supabase |
| `VITE_SUPABASE_ANON_KEY` | Anon Key do Supabase |
| `VITE_ADMIN_USER` | Usuario de admin |
| `VITE_ADMIN_PASS` | Senha de admin |

### Configurar GitHub Pages

1. Va em **Settings > Pages**
2. Em **Source**, selecione **GitHub Actions**
3. O deploy sera automatico a cada push na branch `master`

### Configurar Dominio Personalizado

Configure o arquivo `CNAME` com seu dominio e adicione no DNS um CNAME apontando para `seu-usuario.github.io`

### Supabase Row Level Security (RLS)

Para permitir acesso do frontend ao banco, execute no SQL Editor do Supabase:

```sql
-- Habilitar RLS nas tabelas
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE fetch_logs ENABLE ROW LEVEL SECURITY;

-- Criar politicas de leitura publica
CREATE POLICY "Allow public read" ON news FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON sources FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON fetch_logs FOR SELECT USING (true);
```

## Desenvolvimento

```bash
# Instalar dependencias
npm install

# Rodar em desenvolvimento
npm run dev

# Build para producao
npm run build

# Preview do build
npm run preview
```

## Stack

- React 19
- Vite 7
- Tailwind CSS 4
- Supabase JS Client
- React Router DOM
- Lucide React (icones)
