import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { setAuth } from '../utils/storage';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setErro('');

    if (email === 'matheus.transportesirmaos@gmail.com' && senha === 'Irmaos2024@') {
      setAuth(true);
      navigate('/dashboard');
    } else {
      setErro('Email ou senha incorretos');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Sistema de Conferência de Frete</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="matheus.transportesirmaos@gmail.com"
            />
          </div>
          <div className="form-group">
            <label htmlFor="senha">Senha</label>
            <input
              type="password"
              id="senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </div>
          {erro && <div className="error-message">{erro}</div>}
          <button type="submit" className="btn-primary">Entrar</button>
        </form>
      </div>
    </div>
  );
};

export default Login;



