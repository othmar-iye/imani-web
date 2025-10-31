// components/Users.js
import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import './css/Users.css';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('users'); // 'users', 'sellers'

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Récupérer les utilisateurs auth
      const { data: usersData, error: usersError } = await supabase
        .from('auth_users_view')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;

      // Récupérer les profils utilisateurs
      const { data: profilesData, error: profilesError } = await supabase
        .from('user_profiles')
        .select('*')
        .order('updated_at', { ascending: false });

      if (profilesError) throw profilesError;

      setUsers(usersData || []);
      setProfiles(profilesData || []);
      
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filtrer les données basé sur la recherche
  const filteredUsers = users.filter(user =>
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredProfiles = profiles.filter(profile =>
    profile.phone_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profile.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profile.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  // Fonction pour obtenir le statut de vérification du profil
  const getVerificationStatus = (profile) => {
    switch (profile.verification_status) {
      case 'pending_review':
        return 'En attente';
      case 'verified':
        return 'Vérifié';
      case 'rejected':
        return 'Rejeté';
      default:
        return 'Non soumis';
    }
  };

  const getVerificationClass = (profile) => {
    switch (profile.verification_status) {
      case 'pending_review':
        return 'status-pending';
      case 'verified':
        return 'status-active';
      case 'rejected':
        return 'status-rejected';
      default:
        return 'status-inactive';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Trouver le profil correspondant à un user
  const getUserProfile = (userId) => {
    return profiles.find(profile => profile.id === userId);
  };

  if (loading) {
    return (
      <div className="page-content">
        <div className="page-header">
          <div className="header-title">
            <p>Chargement des utilisateurs...</p>
          </div>
        </div>
        <div className="loading-spinner">⏳</div>
      </div>
    );
  }

  return (
    <div className="page-content">
      {/* Barre de recherche et filtres */}
      <div className="users-controls">
        <div className="search-bar">
          <input
            type="text"
            placeholder={
              activeTab === 'users' 
                ? "Rechercher par email ou nom..." 
                : "Rechercher par téléphone, ville ou adresse..."
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>
        
        {/* Tabs simplifiés */}
        <div className="tabs-container">
          <button 
            className={`tab ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            👥 Utilisateurs ({users.length})
          </button>
          <button 
            className={`tab ${activeTab === 'sellers' ? 'active' : ''}`}
            onClick={() => setActiveTab('sellers')}
          >
            🛒 Vendeurs ({profiles.length})
          </button>
        </div>
      </div>

      {/* Tableau des utilisateurs Auth */}
      {activeTab === 'users' && (
        <div className="content-section">
          <div className="section-header">
            <h2>Liste des Utilisateurs ({filteredUsers.length})</h2>
            <div className="section-actions">
              <button className="refresh-btn" onClick={fetchUsers} title="Actualiser">
                🔄
              </button>
            </div>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Utilisateur</th>
                  <th>Email</th>
                  <th>Statut</th>
                  <th>Inscription</th>
                  <th>Dernière connexion</th>
                  <th>Email confirmé</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="no-data">
                      {searchTerm ? 'Aucun utilisateur trouvé' : 'Aucun utilisateur'}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map(user => {
                    const userProfile = getUserProfile(user.id);
                    return (
                      <tr key={user.id}>
                        <td>
                          <div className="user-cell">
                            <div className="user-info">
                              <div className="user-name">
                                {user.full_name || 'Non renseigné'}
                                {userProfile && <span className="seller-badge">Vendeur</span>}
                              </div>
                              <div className="user-id">ID: {user.id.substring(0, 8)}...</div>
                            </div>
                          </div>
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
                        <td>
                          <span className={`email-status ${user.email_confirmed ? 'email-confirmed' : 'email-pending'}`}>
                            {user.email_confirmed ? '✅ Confirmé' : '⏳ En attente'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tableau des profils vendeurs */}
      {activeTab === 'sellers' && (
        <div className="content-section">
          <div className="section-header">
            <h2>Liste des Vendeurs ({filteredProfiles.length})</h2>
            <div className="section-actions">
              <button className="refresh-btn" onClick={fetchUsers} title="Actualiser">
                🔄
              </button>
            </div>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Vendeur</th>
                  <th>Téléphone</th>
                  <th>Ville</th>
                  <th>Type Pièce</th>
                  <th>Statut Vérification</th>
                  <th>Dernière mise à jour</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProfiles.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="no-data">
                      {searchTerm ? 'Aucun vendeur trouvé' : 'Aucun profil vendeur'}
                    </td>
                  </tr>
                ) : (
                  filteredProfiles.map(profile => {
                    const user = users.find(u => u.id === profile.id);
                    return (
                      <tr key={profile.id}>
                        <td>
                          <div className="user-cell">
                            <div className="user-info">
                              <div className="user-name">
                                {user?.full_name || 'Utilisateur'}
                              </div>
                              <div className="user-email">{user?.email || 'Email non disponible'}</div>
                            </div>
                          </div>
                        </td>
                        <td>{profile.phone_number || 'N/A'}</td>
                        <td>{profile.city || 'N/A'}</td>
                        <td>
                          <span className="identity-type">
                            {profile.identity_type === 'voter_card' && 'Carte électeur'}
                            {profile.identity_type === 'passport' && 'Passeport'}
                            {profile.identity_type === 'driving_license' && 'Permis conduire'}
                            {!profile.identity_type && 'Non renseigné'}
                          </span>
                        </td>
                        <td>
                          <span className={`status-badge ${getVerificationClass(profile)}`}>
                            {getVerificationStatus(profile)}
                          </span>
                        </td>
                        <td>{formatDate(profile.updated_at)}</td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              className="action-btn view" 
                              title="Voir détails"
                              onClick={() => console.log('Voir profil:', profile.id)}
                            >
                              👁️
                            </button>
                            {profile.verification_status === 'pending_review' && (
                              <>
                                <button 
                                  className="action-btn approve" 
                                  title="Approuver"
                                  onClick={() => console.log('Approuver:', profile.id)}
                                >
                                  ✅
                                </button>
                                <button 
                                  className="action-btn reject" 
                                  title="Rejeter"
                                  onClick={() => console.log('Rejeter:', profile.id)}
                                >
                                  ❌
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;