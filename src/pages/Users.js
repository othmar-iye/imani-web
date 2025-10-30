import React, { useState, useEffect } from 'react';
import { userService } from '../services/userService';
import './css/Users.css';

const Users = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    basicUsers: 0,
    totalSellers: 0,
    verifiedSellers: 0,
    pendingSellers: 0
  });
  const [loading, setLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setDebugInfo('🔄 Chargement en cours...');
      
      console.log('=== DÉBUT DU CHARGEMENT ===');
      
      const usersData = await userService.getAllUsers();
      console.log('📦 Données utilisateurs reçues:', usersData);
      
      const statsData = await userService.getStats();
      console.log('📊 Statistiques reçues:', statsData);

      setUsers(usersData);
      setStats(statsData);
      
      setDebugInfo(`✅ Chargement réussi: ${usersData.length} utilisateurs, ${statsData.totalSellers} vendeurs`);
      
      console.log('=== FIN DU CHARGEMENT ===');

    } catch (error) {
      console.error('💥 Erreur chargement:', error);
      setDebugInfo(`❌ Erreur: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredData = () => {
    let filtered = users;

    if (activeTab === 'users') {
      filtered = filtered.filter(user => user.type === 'user');
    } else if (activeTab === 'sellers') {
      filtered = filtered.filter(user => user.type === 'seller');
    }

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone_number?.includes(searchTerm)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.status === statusFilter);
    }

    return filtered;
  };

  const filteredUsers = getFilteredData();

  const statusOptions = [
    { value: 'all', label: 'Tous les statuts' },
    { value: 'Utilisateur', label: 'Utilisateurs simples' },
    { value: 'En attente', label: 'En attente' },
    { value: 'Vérifié', label: 'Vérifiés' }
  ];

  // Afficher les informations de debug
  const renderDebugInfo = () => {
    if (process.env.NODE_ENV === 'development') {
      return (
        <div style={{
          background: '#f3f4f6',
          padding: '10px',
          borderRadius: '8px',
          marginBottom: '1rem',
          fontSize: '12px',
          fontFamily: 'monospace'
        }}>
          <strong>Debug:</strong> {debugInfo} | 
          Users: {users.length} | 
          Filtered: {filteredUsers.length}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="users-page">
        {renderDebugInfo()}
        <div className="loading-state">
          <div className="loading-spinner">⏳</div>
          <h3>Chargement des utilisateurs...</h3>
          <p>{debugInfo}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="users-page">
      {renderDebugInfo()}

      {/* Cartes de statistiques */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-info">
              <h3>Total</h3>
              <p className="stat-number">{stats.totalUsers}</p>
            </div>
            <div className="stat-icon total">👥</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-info">
              <h3>Utilisateurs</h3>
              <p className="stat-number">{stats.basicUsers}</p>
            </div>
            <div className="stat-icon users">🙋</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-info">
              <h3>Vendeurs</h3>
              <p className="stat-number">{stats.totalSellers}</p>
            </div>
            <div className="stat-icon sellers">🏪</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-info">
              <h3>En Attente</h3>
              <p className="stat-number">{stats.pendingSellers}</p>
            </div>
            <div className="stat-icon pending">⏳</div>
          </div>
        </div>
      </div>

      {/* Onglets */}
      <div className="tabs-section">
        <div className="tabs-container">
          <button 
            className={`tab ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            👥 Tous ({stats.totalUsers})
          </button>
          <button 
            className={`tab ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            🙋 Utilisateurs ({stats.basicUsers})
          </button>
          <button 
            className={`tab ${activeTab === 'sellers' ? 'active' : ''}`}
            onClick={() => setActiveTab('sellers')}
          >
            🏪 Vendeurs ({stats.totalSellers})
          </button>
        </div>
      </div>

      {/* Barre de recherche */}
      <div className="filters-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Rechercher par nom, email ou téléphone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>
        
        <div className="filter-group">
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <button className="refresh-btn" onClick={loadData} title="Actualiser">
          🔄
        </button>
      </div>

      {/* Tableau */}
      <div className="content-section">
        <div className="section-header">
          <h2>
            {activeTab === 'all' && `Tous les utilisateurs (${filteredUsers.length})`}
            {activeTab === 'users' && `Utilisateurs simples (${filteredUsers.length})`}
            {activeTab === 'sellers' && `Vendeurs (${filteredUsers.length})`}
          </h2>
        </div>
        
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Utilisateur</th>
                <th>Type</th>
                <th>Statut</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, index) => (
                <tr key={user.id || index} className={user.type === 'seller' ? 'seller-row' : ''}>
                  <td>
                    <div className="user-info-cell">
                      <div className="user-avatar">
                        {user.avatar}
                      </div>
                      <div className="user-details">
                        <div className="user-name">{user.name}</div>
                        <div className="user-email">{user.email}</div>
                        {user.phone_number && (
                          <div className="user-phone">{user.phone_number}</div>
                        )}
                        {user.city && (
                          <div className="user-city">{user.city}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  
                  <td>
                    <span className={`type-badge ${user.type}-badge`}>
                      {user.type === 'seller' ? '🏪 Vendeur' : '🙋 Utilisateur'}
                    </span>
                  </td>
                  
                  <td>
                    <span className={`status-badge ${
                      user.status === 'Vérifié' ? 'status-verified' : 
                      user.status === 'En attente' ? 'status-pending' : 
                      'status-basic'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  
                  <td>{user.date}</td>
                  
                  <td>
                    <div className="action-buttons">
                      <button className="btn-view" title="Voir détails">
                        👁️
                      </button>
                      
                      {user.type === 'seller' && user.verification_status === 'pending_review' && (
                        <button className="btn-verify" title="Vérifier ce vendeur">
                          ✅
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && !loading && (
          <div className="empty-state">
            <div className="empty-icon">
              {activeTab === 'sellers' ? '🏪' : '👥'}
            </div>
            <h3>Aucun utilisateur trouvé</h3>
            <p>
              {searchTerm || statusFilter !== 'all' 
                ? 'Aucun utilisateur ne correspond à vos critères de recherche.'
                : activeTab === 'sellers' 
                  ? 'Aucun vendeur dans la base de données.'
                  : 'Aucun utilisateur dans la base de données.'
              }
            </p>
            <div style={{marginTop: '1rem', fontSize: '12px', color: '#6b7280'}}>
              Debug: {users.length} utilisateurs au total
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;