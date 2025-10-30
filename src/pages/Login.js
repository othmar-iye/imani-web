import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom'; // IMPORT AJOUTÉ
import './css/Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate(); // HOOK AJOUTÉ

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    if (login(email, password)) {
      navigate('/dashboard'); // REDIRECTION AJOUTÉE
    } else {
      setError('Identifiants incorrects. Veuillez réessayer.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <div className="brand-header">
          <h1>Connectez-vous à IMANI</h1>
          <p>Accédez à votre espace administrateur</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Votre email</label>
            <input
              id="email"
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email..." // Modifié pour correspondre
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <input
              id="password"
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mot de passe" // Modifié pour correspondre
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="login-button">
            Se connecter
          </button>
        </form>

      </div>
    </div>
  );
};

export default Login;