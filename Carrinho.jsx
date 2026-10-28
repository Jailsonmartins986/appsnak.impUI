import { useState } from 'react';
import { api, dinheiro } from '../api.js';

export default function Carrinho({ carrinho, setCarrinho, onPedidoCriado }) {
  const [cupom, setCupom] = useState('');
  const [desconto, setDesconto] = useState(0);
  const [cupomAplicado, setCupomAplicado] = useState('');
  const [metodo, setMetodo] = useState('pix');
  const [erro, setErro] = useState('');
  const [msgCupom, setMsgCupom] = useState('');
  const [enviando, setEnviando] = useState(false);

  const subtotal = carrinho.reduce((s, i) => s + i.produto.preco * i.quantidade, 0);
  const total = Math.max(0, subtotal - desconto);

  const observacao = (id, texto) =>
    setCarrinho(carrinho.map((i) => (i.produto.id === id ? { ...i, observacao: texto } : i)));
  const remover = (id) => { setCarrinho(carrinho.filter((i) => i.produto.id !== id)); setDesconto(0); setCupomAplicado(''); };

  async function aplicarCupom() {
    setMsgCupom('');
    try {
      const r = await api.cupom(cupom.trim(), subtotal);
      setDesconto(r.desconto);
      setCupomAplicado(r.codigo);
      setMsgCupom(`Cupom ${r.codigo} aplicado: −${dinheiro(r.desconto)}`);
    } catch (e) {
      setDesconto(0);
      setCupomAplicado('');
      setMsgCupom(e.message);
    }
  }

  async function finalizar() {
    setErro('');
    setEnviando(true);
    try {
      const pedido = await api.criarPedido({
        itens: carrinho.map((i) => ({ produtoId: i.produto.id, quantidade: i.quantidade, observacao: i.observacao })),
        cupom: cupomAplicado || undefined,
        pagamento: { metodo },
      });
      setCarrinho([]);
      onPedidoCriado(pedido);
    } catch (e) {
      setErro(e.message);
    } finally {
      setEnviando(false);
    }
  }

  if (!carrinho.length) return <p className="aviso">Seu carrinho está vazio. Escolha itens no cardápio.</p>;
  return (
    <section>
      <h2>Carrinho</h2>
      {carrinho.map((i) => (
        <article key={i.produto.id} className="card linha">
          <div>
            <strong>{i.quantidade}× {i.produto.nome}</strong>
            <input placeholder="Observação (ex.: sem cebola)" value={i.observacao} onChange={(e) => observacao(i.produto.id, e.target.value)} />
          </div>
          <div className="direita">
            <span>{dinheiro(i.produto.preco * i.quantidade)}</span>
            <button className="link" onClick={() => remover(i.produto.id)}>Remover</button>
          </div>
        </article>
      ))}
      <div className="card">
        <div className="linha">
          <input placeholder="Cupom de desconto" value={cupom} onChange={(e) => setCupom(e.target.value)} />
          <button onClick={aplicarCupom} disabled={!cupom.trim()}>Aplicar</button>
        </div>
        {msgCupom && <p className="aviso">{msgCupom}</p>}
        <label>Forma de pagamento
          <select value={metodo} onChange={(e) => setMetodo(e.target.value)}>
            <option value="pix">Pix</option>
            <option value="credito">Cartão de crédito</option>
            <option value="debito">Cartão de débito</option>
          </select>
        </label>
        <p>Subtotal: {dinheiro(subtotal)}</p>
        {desconto > 0 && <p>Desconto: −{dinheiro(desconto)}</p>}
        <p className="total">Total: {dinheiro(total)}</p>
        {erro && <p className="erro" role="alert">{erro}</p>}
        <button className="primario" onClick={finalizar} disabled={enviando}>
          {enviando ? 'Processando pagamento…' : 'Finalizar pedido'}
        </button>
      </div>
    </section>
  );
}
