import { useEffect, useState } from 'react';
import { api, dinheiro } from '../api.js';

export default function Cardapio({ carrinho, setCarrinho }) {
  const [produtos, setProdutos] = useState([]);
  const [categoria, setCategoria] = useState('Todas');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    api.cardapio().then(setProdutos).catch((e) => setErro(e.message)).finally(() => setCarregando(false));
  }, []);

  const categorias = ['Todas', ...new Set(produtos.map((p) => p.categoria))];
  const visiveis = categoria === 'Todas' ? produtos : produtos.filter((p) => p.categoria === categoria);
  const qtd = (id) => carrinho.find((i) => i.produto.id === id)?.quantidade || 0;

  function alterar(produto, delta) {
    setCarrinho((atual) => {
      const existente = atual.find((i) => i.produto.id === produto.id);
      const nova = (existente?.quantidade || 0) + delta;
      if (nova <= 0) return atual.filter((i) => i.produto.id !== produto.id);
      if (nova > produto.estoque) return atual;
      if (existente) return atual.map((i) => (i.produto.id === produto.id ? { ...i, quantidade: nova } : i));
      return [...atual, { produto, quantidade: nova, observacao: '' }];
    });
  }

  if (carregando) return <p className="aviso">Carregando cardápio…</p>;
  return (
    <section>
      <h2>Cardápio do dia</h2>
      {erro && <p className="erro">{erro}</p>}
      <div className="chips">
        {categorias.map((c) => (
          <button key={c} className={c === categoria ? 'chip ativo' : 'chip'} onClick={() => setCategoria(c)}>{c}</button>
        ))}
      </div>
      <div className="grade">
        {visiveis.map((p) => (
          <article key={p.id} className="card produto">
            <h3>{p.nome}</h3>
            <p>{p.descricao}</p>
            <p className="preco">{dinheiro(p.preco)} <small>({p.estoque} restantes)</small></p>
            <div className="qtd">
              <button onClick={() => alterar(p, -1)} disabled={!qtd(p.id)} aria-label={`Remover ${p.nome}`}>−</button>
              <span>{qtd(p.id)}</span>
              <button onClick={() => alterar(p, 1)} disabled={qtd(p.id) >= p.estoque} aria-label={`Adicionar ${p.nome}`}>+</button>
            </div>
          </article>
        ))}
        {!visiveis.length && <p className="aviso">Nenhum item disponível no momento.</p>}
      </div>
    </section>
  );
}
