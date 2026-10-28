import { useEffect, useState } from 'react';
import { api, setToken } from './api.js';
import Login from './components/Login.jsx';
import Cardapio from './components/Cardapio.jsx';
import Carrinho from './components/Carrinho.jsx';
import Pedidos from './components/Pedidos.jsx';
import { PedidosRecebidos, GestaoCardapio, Relatorio } from './components/Fornecedor.jsx';

const ABAS = {
  funcionario: [['cardapio', 'Cardápio'], ['carrinho', 'Carrinho'], ['pedidos', 'Meus pedidos']],
  fornecedor: [['recebidos', 'Pedidos'], ['gestao', 'Cardápio'], ['relatorio', 'Relatórios']],
};

export default function App() {
  const [usuario, setUsuario] = useState(null);
  const [aba, setAba] = useState('');
  const [carrinho, setCarrinho] = useState([]);
  const [ultimoPedido, setUltimoPedido] = useState(null);
  const [iniciando, setIniciando] = useState(true);

  // Restaura a sessão ao recarregar a página
  useEffect(() => {
    api.me().then((u) => entrar(u)).catch(() => setToken('')).finally(() => setIniciando(false));
  }, []);

  function entrar(u) {
    setUsuario(u);
    setAba(ABAS[u.perfil]?.[0][0] || '');
  }
  function sair() { setToken(''); setUsuario(null); setCarrinho([]); }

  if (iniciando) return <p className="aviso">Carregando…</p>;
  if (!usuario) return <Login onEntrar={entrar} />;

  const itensCarrinho = carrinho.reduce((s, i) => s + i.quantidade, 0);
  return (
    <>
      <header>
        <strong>🍔 AppSnack</strong>
        <span>Olá, {usuario.nome.split(' ')[0]}</span>
        <button className="link" onClick={sair}>Sair</button>
      </header>
      <nav>
        {(ABAS[usuario.perfil] || []).map(([id, rotulo]) => (
          <button key={id} className={aba === id ? 'ativo' : ''} onClick={() => setAba(id)}>
            {rotulo}{id === 'carrinho' && itensCarrinho > 0 && ` (${itensCarrinho})`}
          </button>
        ))}
      </nav>
      <main>
        {aba === 'cardapio' && <Cardapio carrinho={carrinho} setCarrinho={setCarrinho} />}
        {aba === 'carrinho' && <Carrinho carrinho={carrinho} setCarrinho={setCarrinho} onPedidoCriado={(p) => { setUltimoPedido(p.id); setAba('pedidos'); }} />}
        {aba === 'pedidos' && <Pedidos destaqueId={ultimoPedido} />}
        {aba === 'recebidos' && <PedidosRecebidos />}
        {aba === 'gestao' && <GestaoCardapio />}
        {aba === 'relatorio' && <Relatorio />}
        {usuario.perfil === 'admin' && <p className="aviso">O painel do administrador será implementado em uma próxima etapa.</p>}
      </main>
    </>
  );
}
