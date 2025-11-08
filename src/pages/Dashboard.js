// Dashboard.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../config/supabase';
import './css/Dashboard.css';
import Users from './Users';
import Products from './Products';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [recentUsers, setRecentUsers] = useState([]);
  const [usersCount, setUsersCount] = useState(0);
  const [sellersCount, setSellersCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Récupérer les utilisateurs récents depuis Supabase
  const fetchRecentUsers = async () => {
    try {
      setLoading(true);
      
      // Récupérer les 10 utilisateurs les plus récents
      const { data: usersData, error: usersError } = await supabase
        .from('auth_users_view')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10); // Maintenant 10 au lieu de 5

      if (usersError) throw usersError;

      // Récupérer le nombre total d'utilisateurs
      const { count: totalUsers, error: countError } = await supabase
        .from('auth_users_view')
        .select('*', { count: 'exact', head: true });

      if (countError) throw countError;

      // Récupérer le nombre de vendeurs
      const { count: totalSellers, error: sellersError } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true });

      if (sellersError) throw sellersError;

      setRecentUsers(usersData || []);
      setUsersCount(totalUsers || 0);
      setSellersCount(totalSellers || 0);
      
    } catch (error) {
      console.error('Erreur récupération users récents:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeMenu === 'dashboard') {
      fetchRecentUsers();
    }
  }, [activeMenu]);

  // Stats simplifiées - seulement Utilisateurs et Vendeurs
  const statsData = [
    { 
      title: 'Utilisateurs Totaux', 
      value: usersCount.toString(),
      icon: '👥',
      color: '#3B82F6'
    },
    { 
      title: 'Vendeurs', 
      value: sellersCount.toString(), 
      icon: '🛒',
      color: '#10B981'
    }
  ];

  const menuItems = [
    { id: 'dashboard', label: 'Tableau de Bord', icon: '📊' },
    { id: 'utilisateur', label: 'Utilisateurs', icon: '👥' },
    { id: 'produit', label: 'Produits', icon: '📦' },
    { id: 'finance', label: 'Finance', icon: '💰' }
  ];

  // Fonction pour formater la date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Fonction pour obtenir le statut
  const getUserStatus = (user) => {
    if (user.last_sign_in_at) {
      return 'Actif';
    }
    return user.email_confirmed ? 'Confirmé' : 'En attente';
  };

  // Fonction pour obtenir la classe CSS du statut
  const getStatusClass = (user) => {
    if (user.last_sign_in_at) {
      return 'status-active';
    }
    return user.email_confirmed ? 'status-confirmed' : 'status-pending';
  };

  // Fonction pour rendre le contenu en fonction du menu actif
  const renderContent = () => {
    switch (activeMenu) {
      case 'utilisateur':
        return <Users />;
      case 'produit':
        return <Products/>;
      case 'finance':
        return (
          <div className="page-content">
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
            {/* Cartes de Statistiques - Maintenant seulement 2 */}
            <div className="stats-grid">
              {statsData.map((stat, index) => (
                <div key={index} className="stat-card">
                  <div className="stat-content">
                    <div className="stat-info">
                      <h3>{stat.title}</h3>
                      <p className="stat-number">{stat.value}</p>
                    </div>
                    <div 
                      className="stat-icon"
                      style={{ backgroundColor: `${stat.color}15`, color: stat.color }}
                    >
                      {stat.icon}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Utilisateurs Récents - Maintenant 10 utilisateurs */}
            <div className="content-section">
              <div className="section-header">
                <h2>Utilisateurs Récents</h2>
                <div className="section-actions">
                  <button className="refresh-btn" onClick={fetchRecentUsers} title="Actualiser">
                    🔄
                  </button>
                  <button className="view-all-btn" onClick={() => setActiveMenu('utilisateur')}>
                    Voir tout →
                  </button>
                </div>
              </div>
              
              {loading ? (
                <div className="loading-users">
                  <p>Chargement des utilisateurs...</p>
                </div>
              ) : (
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Nom</th>
                        <th>Email</th>
                        <th>Statut</th>
                        <th>Date d'inscription</th>
                        <th>Dernière connexion</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentUsers.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="no-data">
                            Aucun utilisateur inscrit pour le moment
                          </td>
                        </tr>
                      ) : (
                        recentUsers.map(user => (
                          <tr key={user.id}>
                            <td style={{ fontWeight: '600', color: '#111827' }}>
                              {user.full_name || 'Non renseigné'}
                            </td>
                            <td>{user.email}</td>
                            <td>
                              <span className={`status-badge ${getStatusClass(user)}`}>
                                {getUserStatus(user)}
                              </span>
                            </td>
                            <td>{formatDate(user.created_at)}</td>
                            <td>
                              {user.last_sign_in_at 
                                ? formatDate(user.last_sign_in_at) 
                                : 'Jamais'
                              }
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
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