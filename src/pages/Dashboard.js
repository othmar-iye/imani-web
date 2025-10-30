import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './css/Dashboard.css';
import Users from './Users';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [activeMenu, setActiveMenu] = useState('dashboard');

  const statsData = [
    { 
      title: 'Utilisateurs Totaux', 
      value: '12,402', 
      icon: '👥' 
    },
    { 
      title: 'Produits Actifs', 
      value: '1,248', 
      icon: '📦' 
    },
    { 
      title: 'Revenus Mensuels', 
      value: '$24,802', 
      icon: '💰' 
    },
    { 
      title: 'Commandes', 
      value: '4,210', 
      icon: '🛒' 
    }
  ];

  const recentUsers = [
    { id: 1, name: 'Marie Dubois', email: 'marie.dubois@email.com', status: 'Actif', date: '2024-01-15' },
    { id: 2, name: 'Jean Martin', email: 'jean.martin@email.com', status: 'Actif', date: '2024-01-14' },
    { id: 3, name: 'Sophie Lambert', email: 'sophie.lambert@email.com', status: 'Inactif', date: '2024-01-13' },
    { id: 4, name: 'Pierre Moreau', email: 'pierre.moreau@email.com', status: 'Actif', date: '2024-01-12' }
  ];

  const menuItems = [
    { id: 'dashboard', label: 'Tableau de Bord', icon: '📊' },
    { id: 'utilisateur', label: 'Utilisateurs', icon: '👥' },
    { id: 'produit', label: 'Produits', icon: '📦' },
    { id: 'finance', label: 'Finance', icon: '💰' }
  ];

  // Fonction pour rendre le contenu en fonction du menu actif
  const renderContent = () => {
    switch (activeMenu) {
      case 'utilisateur':
        return <Users />;
      case 'produit':
        return (
          <div className="page-content">
            <div className="page-header">
              <div className="header-title">
                <h1>Gestion des Produits</h1>
                <p>Gérez votre catalogue de produits IMANI</p>
              </div>
              <button className="add-btn">
                + Ajouter un produit
              </button>
            </div>
            <div className="coming-soon">
              <div className="coming-soon-icon">📦</div>
              <h2>Section Produits</h2>
              <p>Cette section sera bientôt disponible</p>
            </div>
          </div>
        );
      case 'finance':
        return (
          <div className="page-content">
            <div className="page-header">
              <div className="header-title">
                <h1>Gestion Financière</h1>
                <p>Suivez vos revenus et analyses financières</p>
              </div>
              <button className="add-btn">
                📊 Générer rapport
              </button>
            </div>
            <div className="coming-soon">
              <div className="coming-soon-icon">💰</div>
              <h2>Section Finance</h2>
              <p>Cette section sera bientôt disponible</p>
            </div>
          </div>
        );
      default:
        return (
          <div className="dashboard-content">
            {/* Cartes de Statistiques */}
            <div className="stats-grid">
              {statsData.map((stat, index) => (
                <div key={index} className="stat-card">
                  <div className="stat-content">
                    <div className="stat-info">
                      <h3>{stat.title}</h3>
                      <p className="stat-number">{stat.value}</p>
                    </div>
                    <div className="stat-icon">
                      {stat.icon}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Utilisateurs Récents */}
            <div className="content-section">
              <div className="section-header">
                <h2>Utilisateurs Récents</h2>
                <button className="view-all-btn" onClick={() => setActiveMenu('utilisateur')}>
                  Voir tout →
                </button>
              </div>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Nom</th>
                      <th>Email</th>
                      <th>Statut</th>
                      <th>Date d'inscription</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentUsers.map(user => (
                      <tr key={user.id}>
                        <td style={{ fontWeight: '600', color: '#111827' }}>{user.name}</td>
                        <td>{user.email}</td>
                        <td>
                          <span className={`status-badge ${
                            user.status === 'Actif' ? 'status-active' : 'status-inactive'
                          }`}>
                            {user.status}
                          </span>
                        </td>
                        <td>{user.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
    }
  };

  // Fonction pour obtenir le titre de la page
  const getPageTitle = () => {
    switch (activeMenu) {
      case 'utilisateur':
        return 'Gestion des Utilisateurs';
      case 'produit':
        return 'Gestion des Produits';
      case 'finance':
        return 'Gestion Financière';
      default:
        return 'Tableau de Bord';
    }
  };

  // Fonction pour obtenir la description de la page
  const getPageDescription = () => {
    switch (activeMenu) {
      case 'utilisateur':
        return 'Gérez les utilisateurs de votre plateforme IMANI';
      case 'produit':
        return 'Gérez votre catalogue de produits IMANI';
      case 'finance':
        return 'Suivez vos revenus et analyses financières';
      default:
        return 'Bienvenue dans votre espace administrateur';
    }
  };

  return (
    <div className="dashboard">
      {/* Sidebar Élégante */}
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="brand">
            <div className="brand-logo">I</div>
            <div className="brand-text">IMANI</div>
          </div>
        </div>
        
        <div className="sidebar-menu">
          {menuItems.map(item => (
            <button
              key={item.id}
              className={`menu-item ${activeMenu === item.id ? 'active' : ''}`}
              onClick={() => setActiveMenu(item.id)}
            >
              <span className="menu-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Contenu Principal */}
      <div className="main-content">
        {/* Header */}
        <header className="dashboard-header">
          <div className="header-title">
            <h1>{getPageTitle()}</h1>
            <p>{getPageDescription()}</p>
          </div>
          
          <div className="user-info">
            <div className="user-details">
              <p className="user-name">{user?.name}</p>
              <p className="user-email">{user?.email}</p>
            </div>
            <button onClick={logout} className="logout-button">
              Déconnexion
            </button>
          </div>
        </header>

        {/* Contenu Dynamique */}
        {renderContent()}
      </div>
    </div>
  );
};

export default Dashboard;