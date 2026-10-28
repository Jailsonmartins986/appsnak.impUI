const BASE = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '');

let token = localStorage.getItem('appsnack_token') || '';

export const setToken = (t) => {
  token = t || '';
  t ? localStorage.setItem('appsnack_token', t) : localStorage.removeItem('appsnack_token');
};

async function req(metodo, rota, corpo) {
  const resp = await fetch(BASE + rota, {
    method: metodo,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: corpo ? JSON.stringify(corpo) : undefined,
  });
  if (resp.status === 204) return null;
  const dados = await resp.json().catch(() => ({}));
  if (!resp.ok) throw new Error(dados.erro || 'Falha na comunicação com o servidor.');
  return dados;
}

export const api = {
  login: (email, senha) => req('POST', '/auth/login', { email, senha }),
  cadastrar: (dados) => req('POST', '/auth/register', dados),
  me: () => req('GET', '/auth/me'),
  cardapio: () => req('GET', '/produtos'),
  meusProdutos: () => req('GET', '/produtos/meus'),
  criarProduto: (p) => req('POST', '/produtos', p),
  editarProduto: (id, p) => req('PUT', `/produtos/${id}`, p),
  excluirProduto: (id) => req('DELETE', `/produtos/${id}`),
  cupom: (codigo, subtotal) => req('GET', `/cupons/${encodeURIComponent(codigo)}?subtotal=${subtotal}`),
  criarPedido: (corpo) => req('POST', '/pedidos', corpo),
  pedidos: () => req('GET', '/pedidos?limite=50'),
  mudarStatus: (id, status) => req('PATCH', `/pedidos/${id}/status`, { status }),
  avaliar: (id, nota, comentario) => req('POST', `/pedidos/${id}/avaliacao`, { nota, comentario }),
  relatorio: (periodo) => req('GET', `/relatorios/fornecedor?periodo=${periodo}`),
};

export const dinheiro = (v) => Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
