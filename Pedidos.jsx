import { useEffect, useState } from 'react';
import { api, dinheiro } from '../api.js';

const ETAPAS = ['Pendente', 'Em preparo', 'Saiu para entrega', 'Entregue'];

function Acompanhamento({ status }) {
  if (status === 'Cancelado') return <p className="erro">Pedido cancelado</p>;
  const atual = ETAPAS.indexOf(status);
  return (
    <ol className="etapas" aria-label="Status do pedido">
      {ETAPAS.map((e, i) => <li key={e} className={i <= atual ? 'feito' : ''}>{e}</li>)}
    </ol>
  );
}

function Avaliar({ pedido, onAvaliado }) {
  const [nota, setNota] = useState(0);
  const [comentario, setComentario] = useState('');
  const [erro, setErro] = useState('');

  if (pedido.avaliacao) return <p>Sua avaliação: {'★'.repeat(pedido.avaliacao.nota)}{'☆'.repeat(5 - pedido.avaliacao.nota)}</p>;
  if (pedido.status !== 'Entregue') return null;

  async function enviar() {
    try { await api.avaliar(pedido.id, nota, comentario); onAvaliado(); } catch (e) { setErro(e.message); }
  }
  return (
    <div className="avaliar">
      <div role="radiogroup" aria-label="Nota">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} className={n <= nota ? 'estrela ativa' : 'estrela'} onClick={() => setNota(n)} aria-label={`${n} estrelas`}>★</button>
        ))}
      </div>
      <input placeholder="Comentário (opcional)" value={comentario} onChange={(e) => setComentario(e.target.value)} />
      {erro && <p className="erro">{erro}</p>}
      <button onClick={enviar} disabled={!nota}>Enviar avaliação</button>
    </div>
  );
}

export default function Pedidos({ destaqueId }) {
  const [lista, setLista] = useState([]);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(true);

  const carregar = () => api.pedidos().then((r) => setLista(r.itens)).catch((e) => setErro(e.message)).finally(() => setCarregando(false));
  useEffect(() => {
    carregar();
    const t = setInterval(carregar, 8000); // atualização periódica do status (RF05)
    return () => clearInterval(t);
  }, []);

  if (carregando) return <p className="aviso">Carregando pedidos…</p>;
  return (
    <section>
      <h2>Meus pedidos</h2>
      {erro && <p className="erro">{erro}</p>}
      {!lista.length && <p className="aviso">Você ainda não fez nenhum pedido.</p>}
      {lista.map((p) => (
        <article key={p.id} className={p.id === destaqueId ? 'card destaque' : 'card'}>
          <div className="linha">
            <strong>Pedido #{p.id}</strong>
            <span>{new Date(p.criadoEm).toLocaleString('pt-BR')}</span>
          </div>
          <ul>{p.itens.map((i) => <li key={i.produtoId}>{i.quantidade}× {i.nome}{i.observacao && ` (${i.observacao})`}</li>)}</ul>
          <p>Total: <strong>{dinheiro(p.total)}</strong> · {p.pagamento.metodo}</p>
          <Acompanhamento status={p.status} />
          <Avaliar pedido={p} onAvaliado={carregar} />
        </article>
      ))}
    </section>
  );
}
