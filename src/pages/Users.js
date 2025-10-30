import React, { useState } from 'react';
import './css/Users.css';

const Users = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Données de démonstration
  const usersData = [
    { 
      id: 1, 
      name: 'Marie Dubois', 
      email: 'marie.dubois@email.com', 
      role: 'Utilisateur', 
      status: 'Actif', 
      date: '2024-01-15',
      avatar: 'MD'
    },
    { 
      id: 2, 
      name: 'Jean Martin', 
      email: 'jean.martin@email.com', 
      role: 'Administrateur', 
      status: 'Actif', 
      date: '2024-01-14',
      avatar: 'JM'
    },
    { 
      id: 3, 
      name: 'Sophie Lambert', 
      email: 'sophie.lambert@email.com', 
      role: 'Utilisateur', 
      status: 'Inactif', 
      date: '2024-01-13',
      avatar: 'SL'
    },
    { 
      id: 4, 
      name: 'Pierre Moreau', 
      email: 'pierre.moreau@email.com', 
      role: 'Modérateur', 
      status: 'Actif', 
      date: '2024-01-12',
      avatar: 'PM'
    },
    { 
      id: 5, 
      name: 'Alice Bernard', 
      email: 'alice.bernard@email.com', 
      role: 'Utilisateur', 
      status: 'Actif', 
      date: '2024-01-11',
      avatar: 'AB'
    },
    { 
      id: 6, 
      name: 'Thomas Petit', 
      email: 'thomas.petit@email.com', 
      role: 'Utilisateur', 
      status: 'Inactif', 
      date: '2024-01-10',
      avatar: 'TP'
    }
  ];

  // Filtrage des utilisateurs
  const filteredUsers = usersData.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: usersData.length,
    active: usersData.filter(user => user.status === 'Actif').length,
    inactive: usersData.filter(user => user.status === 'Inactif').length,
    admins: usersData.filter(user => user.role === 'Administrateur').length
  };

  return (
    <div className="users-page">
      <div className="page-header">
        <div className="header-title">
          <h1>Gestion des Utilisateurs</h1>
          <p>Gérez les utilisateurs de votre plateforme IMANI</p>
        </div>
        <button className="add-user-btn">
          + Ajouter un utilisateur
        </button>
      </div>

      {/* Cartes de statistiques */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-info">
              <h3>Total Utilisateurs</h3>
              <p className="stat-number">{stats.total}</p>
            </div>
            <div className="stat-icon users">👥</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-info">
              <h3>Utilisateurs Actifs</h3>
              <p className="stat-number">{stats.active}</p>
            </div>
            <div className="stat-icon active">✅</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-info">
              <h3>Comptes Inactifs</h3>
              <p className="stat-number">{stats.inactive}</p>
            </div>
            <div className="stat-icon inactive">⏸️</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-info">
              <h3>Administrateurs</h3>
              <p className="stat-number">{stats.admins}</p>
            </div>
            <div className="stat-icon admin">👑</div>
          </div>
        </div>
      </div>

      {/* Barre de filtres et recherche */}
      <div className="filters-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Rechercher un utilisateur..."
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
            <option value="all">Tous les statuts</option>
            <option value="Actif">Actif</option>
            <option value="Inactif">Inactif</option>
          </select>
        </div>
      </div>

      {/* Tableau des utilisateurs */}
      <div className="content-section">
        <div className="section-header">
          <h2>Liste des Utilisateurs</h2>
          <span className="user-count">{filteredUsers.length} utilisateur(s)</span>
        </div>
        
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Utilisateur</th>
                <th>Rôle</th>
                <th>Statut</th>
                <th>Date d'inscription</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id}>
                  <td>
                    <div className="user-info-cell">
                      <div className="user-avatar">
                        {user.avatar}
                      </div>
                      <div className="user-details">
                        <div className="user-name">{user.name}</div>
                        <div className="user-email">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`role-badge role-${user.role.toLowerCase()}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${
                      user.status === 'Actif' ? 'status-active' : 'status-inactive'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td>{user.date}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-edit" title="Modifier">
                        ✏️
                      </button>
                      <button className="btn-delete" title="Supprimer">
                        🗑️
                      </button>
                      <button className="btn-view" title="Voir détails">
                        👁️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <h3>Aucun utilisateur trouvé</h3>
            <p>Aucun utilisateur ne correspond à vos critères de recherche.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;