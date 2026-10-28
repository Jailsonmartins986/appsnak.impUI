import { useEffect, useState } from 'react';
import { api, dinheiro } from '../api.js';

const PROXIMO = { Pendente: 'Em preparo', 'Em preparo': 'Saiu para entrega', 'Saiu para entrega': 'Entregue' };

export function PedidosRecebidos() {
  const [lista, setLista] = useState([]);
  const [erro, setErro] = useState('');
  const carregar = () => api.pedidos().then((r) => setLista(r.itens)).catch((e) => setErro(e.message));
  useEffect(() => { carregar(); const t = setInterval(carregar, 8000); return () => clearInterval(t); }, []);

  async function mudar(id, status) {
    setErro('');
    try { await api.mudarStatus(id, status); carregar(); } catch (e) { setErro(e.message); }
  }
  return (
    <section>
      <h2>Pedidos recebidos</h2>
      {erro && <p className="erro">{erro}</p>}
      {!lista.length && <p className="aviso">Nenhum pedido ainda.</p>}
      {lista.map((p) => (
        <article key={p.id} className="card">
          <div className="linha"><strong>Pedido #{p.id}</strong><span className="selo">{p.status}</span></div>
          <ul>{p.itens.map((i) => <li key={i.produtoId}>{i.quantidade}× {i.nome}{i.observacao && ` (${i.observacao})`}</li>)}</ul>
          <p>Total: {dinheiro(p.total)}</p>
          <div className="linha">
            {PROXIMO[p.status] && <button className="primario" onClick={() => mudar(p.id, PROXIMO[p.status])}>Marcar como “{PROXIMO[p.status]}”</button>}
            {PROXIMO[p.status] && <button onClick={() => mudar(p.id, 'Cancelado')}>Cancelar</button>}
          </div>
        </article>
      ))}
    </section>
  );
}

const VAZIO = { nome: '', descricao: '', preco: '', categoria: 'Salgados', estoque: '' };

export function GestaoCardapio() {
  const [produtos, setProdutos] = useState([]);
  const [form, setForm] = useState(VAZIO);
  const [editando, setEditando] = useState(null);
  const [erro, setErro] = useState('');
  const carregar = () => api.meusProdutos().then(setProdutos).catch((e) => setErro(e.message));
  useEffect(() => { carregar(); }, []);
  const mudar = (c) => (e) => setForm({ ...form, [c]: e.target.value });

  async function salvar(e) {
    e.preventDefault();
    setErro('');
    try {
      editando ? await api.editarProduto(editando, form) : await api.criarProduto(form);
      setForm(VAZIO); setEditando(null); carregar();
    } catch (err) { setErro(err.message); }
  }
  async function excluir(id) {
    if (!confirm('Remover este produto do cardápio?')) return;
    try { await api.excluirProduto(id); carregar(); } catch (err) { setErro(err.message); }
  }

  return (
    <section>
      <h2>Meu cardápio</h2>
      <form onSubmit={salvar} className="card">
        <label>Nome<input value={form.nome} onChange={mudar('nome')} required /></label>
        <label>Descrição<input value={form.descricao} onChange={mudar('descricao')} /></label>
        <div className="linha">
          <label>Preço (R$)<input type="number" step="0.01" min="0.01" value={form.preco} onChange={mudar('preco')} required /></label>
          <label>Estoque do dia<input type="number" min="0" value={form.estoque} onChange={mudar('estoque')} required /></label>
          <label>Categoria
            <select value={form.categoria} onChange={mudar('categoria')}>
              {['Salgados', 'Bebidas', 'Lanches', 'Doces', 'Outros'].map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>
        </div>
        {erro && <p className="erro" role="alert">{erro}</p>}
        <div className="linha">
          <button className="primario">{editando ? 'Salvar alterações' : 'Adicionar item'}</button>
          {editando && <button type="button" onClick={() => { setEditando(null); setForm(VAZIO); }}>Cancelar edição</button>}
        </div>
      </form>
      {produtos.map((p) => (
        <article key={p.id} className="card linha">
          <div>
            <strong>{p.nome}</strong> — {dinheiro(p.preco)} · estoque {p.estoque} {!p.disponivel && <span className="selo">Esgotado</span>}
          </div>
          <div>
            <button onClick={() => { setEditando(p.id); setForm({ nome: p.nome, descricao: p.descricao, preco: p.preco, categoria: p.categoria, estoque: p.estoque }); }}>Editar</button>
            <button onClick={() => excluir(p.id)}>Excluir</button>
          </div>
        </article>
      ))}
    </section>
  );
}

export function Relatorio() {
  const [periodo, setPeriodo] = useState('dia');
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState('');
  useEffect(() => { api.relatorio(periodo).then(setDados).catch((e) => setErro(e.message)); }, [periodo]);

  return (
    <section>
      <h2>Relatório de vendas</h2>
      <div className="chips">
        {['dia', 'semana', 'mes'].map((p) => <button key={p} className={p === periodo ? 'chip ativo' : 'chip'} onClick={() => setPeriodo(p)}>{p === 'mes' ? 'Mês' : p[0].toUpperCase() + p.slice(1)}</button>)}
      </div>
      {erro && <p className="erro">{erro}</p>}
      {dados && (
        <div className="grade">
          <div className="card"><small>Pedidos</small><p className="total">{dados.totalPedidos}</p></div>
          <div className="card"><small>Valor bruto</small><p className="total">{dinheiro(dados.valorBruto)}</p></div>
          <div className="card"><small>Taxas</small><p className="total">{dinheiro(dados.taxas)}</p></div>
          <div className="card"><small>Valor líquido</small><p className="total">{dinheiro(dados.valorLiquido)}</p></div>
        </div>
      )}
      {dados?.maisVendidos?.length > 0 && (
        <div className="card">
          <h3>Mais vendidos</h3>
          <ol>{dados.maisVendidos.map((m) => <li key={m.nome}>{m.nome} — {m.quantidade}</li>)}</ol>
        </div>
      )}
    </section>
  );
}
