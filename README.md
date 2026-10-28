# AppSnack UI

Interface web do AppSnack (Projeto Integrador II – UESPI, grupo Orquestrador). React 18 + Vite.

## Executar localmente
```bash
npm install
cp .env.example .env   # VITE_API_URL aponta para a API
npm run dev            # http://localhost:5173
npm run build          # gera a pasta dist
```

## Publicação
Vercel (framework Vite). Defina `VITE_API_URL` com a URL pública da API no Render e faça um novo deploy sempre que ela mudar.

## Telas
- Funcionário: login/cadastro, cardápio do dia, carrinho (cupom e pagamento), meus pedidos com acompanhamento e avaliação.
- Fornecedor: pedidos recebidos (atualização de status), gestão de cardápio e relatórios.
