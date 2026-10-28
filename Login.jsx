import { useState } from 'react';
import { api, setToken } from '../api.js';

export default function Login({ onEntrar }) {
  const [modo, setModo] = useState('login');
  const [form, setForm] = useState({ nome: '', email: '', senha: '', perfil: 'funcionario' });
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const mudar = (campo) => (e) => setForm({ ...form, [campo]: e.target.value });

  async function enviar(e) {
    e.preventDefault();
    setErro('');
    setCarregando(true);
    try {
      const r = modo === 'login' ? await api.login(form.email, form.senha) : await api.cadastrar(form);
      setToken(r.token);
      onEntrar(r.usuario);
    } catch (err) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="login">
      <h1>🍔 AppSnack</h1>
      <p className="sub">Seu lanche corporativo, sem filas.</p>
      <form onSubmit={enviar} className="card">
        {modo === 'cadastro' && (
          <>
            <label>Nome<input value={form.nome} onChange={mudar('nome')} required /></label>
            <label>Perfil
              <select value={form.perfil} onChange={mudar('perfil')}>
                <option value="funcionario">Funcionário</option>
                <option value="fornecedor">Fornecedor</option>
              </select>
            </label>
          </>
        )}
        <label>E-mail<input type="email" value={form.email} onChange={mudar('email')} required /></label>
        <label>Senha<input type="password" minLength={6} value={form.senha} onChange={mudar('senha')} required /></label>
        {erro && <p className="erro" role="alert">{erro}</p>}
        <button className="primario" disabled={carregando}>
          {carregando ? 'Aguarde…' : modo === 'login' ? 'Entrar' : 'Criar conta'}
        </button>
        <button type="button" className="link" onClick={() => { setModo(modo === 'login' ? 'cadastro' : 'login'); setErro(''); }}>
          {modo === 'login' ? 'Não tem conta? Cadastre-se' : 'Já tenho conta'}
        </button>
      </form>
      <p className="dica">Demonstração: ricardo@appsnack.com (funcionário) ou cida@appsnack.com (fornecedor), senha 123456.</p>
    </main>
  );
}
