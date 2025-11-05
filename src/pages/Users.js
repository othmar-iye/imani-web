// components/Users.js
import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import './css/Users.css';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('users');
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      const { data: usersData, error: usersError } = await supabase
        .from('auth_users_view')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;

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

  // Fonction pour approuver un vendeur
  const approveSeller = async (profileId) => {
    try {
      setActionLoading(true);
      console.log('🔄 Tentative d\'approbation pour:', profileId);
      
      const { data, error } = await supabase
        .from('user_profiles')
        .update({ 
          verification_status: 'verified',
          user_role: 'seller_verified',
          updated_at: new Date().toISOString()
        })
        .eq('id', profileId)
        .select();

      if (error) {
        console.error('❌ Erreur Supabase:', error);
        throw error;
      }

      console.log('✅ Réponse Supabase:', data);

      // Mettre à jour l'état local
      setProfiles(prev => prev.map(profile => 
        profile.id === profileId 
          ? { 
              ...profile, 
              verification_status: 'verified', 
              user_role: 'seller_verified',
              updated_at: new Date().toISOString() 
            }
          : profile
      ));

      // Mettre à jour le profil sélectionné si le modal est ouvert
      if (selectedProfile && selectedProfile.id === profileId) {
        setSelectedProfile(prev => ({
          ...prev,
          verification_status: 'verified',
          user_role: 'seller_verified',
          updated_at: new Date().toISOString()
        }));
      }

      console.log('✅ Vendeur approuvé avec succès:', profileId);
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'approbation:', error);
      alert('Erreur lors de l\'approbation du vendeur: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Fonction pour rejeter un vendeur
  const rejectSeller = async (profileId) => {
    try {
      setActionLoading(true);
      console.log('🔄 Tentative de rejet pour:', profileId);
      
      const { data, error } = await supabase
        .from('user_profiles')
        .update({ 
          verification_status: 'rejected',
          updated_at: new Date().toISOString()
        })
        .eq('id', profileId)
        .select();

      if (error) {
        console.error('❌ Erreur Supabase:', error);
        throw error;
      }

      console.log('✅ Réponse Supabase:', data);

      // Mettre à jour l'état local
      setProfiles(prev => prev.map(profile => 
        profile.id === profileId 
          ? { ...profile, verification_status: 'rejected', updated_at: new Date().toISOString() }
          : profile
      ));

      // Mettre à jour le profil sélectionné si le modal est ouvert
      if (selectedProfile && selectedProfile.id === profileId) {
        setSelectedProfile(prev => ({
          ...prev,
          verification_status: 'rejected',
          updated_at: new Date().toISOString()
        }));
      }

      console.log('❌ Vendeur rejeté avec succès:', profileId);
      
    } catch (error) {
      console.error('❌ Erreur lors du rejet:', error);
      alert('Erreur lors du rejet du vendeur: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Ouvrir le modal de détails
  const openProfileDetails = (profile) => {
    const user = users.find(u => u.id === profile.id);
    setSelectedProfile({
      ...profile,
      user: user || {}
    });
    setShowModal(true);
  };

  // Fermer le modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedProfile(null);
  };

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

  // Fonction pour formater le type de pièce
  const getIdentityTypeLabel = (type) => {
    switch (type) {
      case 'voter_card': return 'Carte électeur';
      case 'passport': return 'Passeport';
      case 'driving_license': return 'Permis conduire';
      default: return 'Non renseigné';
    }
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
                              onClick={() => openProfileDetails(profile)}
                            >
                              Voir
                            </button>
                            {profile.verification_status === 'pending_review' && (
                              <>
                                <button 
                                  className="action-btn approve" 
                                  title="Approuver"
                                  onClick={() => approveSeller(profile.id)}
                                  disabled={actionLoading}
                                >
                                  {actionLoading ? '...' : '✅'}
                                </button>
                                <button 
                                  className="action-btn reject" 
                                  title="Rejeter"
                                  onClick={() => rejectSeller(profile.id)}
                                  disabled={actionLoading}
                                >
                                  {actionLoading ? '...' : '❌'}
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

      {/* Modal de détails du profil */}
      {showModal && selectedProfile && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Détails du Vendeur</h2>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="profile-section">
                <h3>Informations Personnelles</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Nom complet:</label>
                    <span>{selectedProfile.user?.full_name || 'Non renseigné'}</span>
                  </div>
                  <div className="info-item">
                    <label>Email:</label>
                    <span>{selectedProfile.user?.email || 'Non disponible'}</span>
                  </div>
                  <div className="info-item">
                    <label>Téléphone:</label>
                    <span>{selectedProfile.phone_number || 'Non renseigné'}</span>
                  </div>
                  <div className="info-item">
                    <label>Date de naissance:</label>
                    <span>{selectedProfile.birth_date ? formatDate(selectedProfile.birth_date) : 'Non renseignée'}</span>
                  </div>
                </div>
              </div>

              <div className="profile-section">
                <h3>Localisation</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Adresse:</label>
                    <span>{selectedProfile.address || 'Non renseignée'}</span>
                  </div>
                  <div className="info-item">
                    <label>Ville:</label>
                    <span>{selectedProfile.city || 'Non renseignée'}</span>
                  </div>
                </div>
              </div>

              <div className="profile-section">
                <h3>Vérification d'Identité</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Type de pièce:</label>
                    <span>{getIdentityTypeLabel(selectedProfile.identity_type)}</span>
                  </div>
                  <div className="info-item">
                    <label>Numéro de pièce:</label>
                    <span>{selectedProfile.identity_number || 'Non renseigné'}</span>
                  </div>
                  <div className="info-item">
                    <label>Statut:</label>
                    <span className={`status-badge ${getVerificationClass(selectedProfile)}`}>
                      {getVerificationStatus(selectedProfile)}
                    </span>
                  </div>
                </div>
              </div>

              {selectedProfile.profile_picture_url && (
                <div className="profile-section">
                  <h3>Photo de Profil</h3>
                  <div className="profile-image-container">
                    <img 
                      src={selectedProfile.profile_picture_url} 
                      alt="Profil" 
                      className="profile-image"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="image-placeholder">
                      📷 Image non chargée
                    </div>
                  </div>
                </div>
              )}

              {selectedProfile.identity_document_url && (
                <div className="profile-section">
                  <h3>Document d'Identité</h3>
                  <div className="document-container">
                    <img 
                      src={selectedProfile.identity_document_url} 
                      alt="Document d'identité" 
                      className="document-image"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="image-placeholder">
                      📄 Document non chargé
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={closeModal}>
                Fermer
              </button>
              {selectedProfile.verification_status === 'pending_review' && (
                <div className="verification-actions">
                  <button 
                    className="btn-success" 
                    onClick={() => approveSeller(selectedProfile.id)}
                    disabled={actionLoading}
                  >
                    {actionLoading ? 'Traitement...' : '✅ Approuver'}
                  </button>
                  <button 
                    className="btn-danger" 
                    onClick={() => rejectSeller(selectedProfile.id)}
                    disabled={actionLoading}
                  >
                    {actionLoading ? 'Traitement...' : '❌ Rejeter'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;