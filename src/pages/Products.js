// components/Products.js
import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import './css/Products.css';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Fonction pour créer une notification
  const createNotification = async (userId, translationKey, type = 'product', actionUrl = null, translationParams = {}) => {
    
    try {
      console.log('📨 Création notification produit:', { userId, translationKey, type });
      
      const { data, error } = await supabase
        .from('notifications')
        .insert([
          {
            user_id: userId,
            translation_key: translationKey,
            type: type,
            status: 'unread',
            action_url: actionUrl,
            translation_params: translationParams, // Peut être étendu si besoin de variables
          }
        ])
        .select();

      if (error) {
        console.error('❌ Erreur création notification:', error);
        throw error;
      }

      console.log('✅ Notification créée:', data[0]);
      return data[0];
    } catch (error) {
      console.error('❌ Erreur création notification:', error);
      return null;
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      
      // Récupérer tous les produits
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (productsError) throw productsError;

      // Récupérer les informations des vendeurs
      const { data: usersData, error: usersError } = await supabase
        .from('auth_users_view')
        .select('*');

      if (usersError) throw usersError;

      setProducts(productsData || []);
      setUsers(usersData || []);
      
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Fonction pour approuver un produit
  const approveProduct = async (productId) => {
  try {
    setActionLoading(true);
    console.log('🔄 Début approbation:', productId);
    
    // 1. D'ABORD trouver le produit
    const product = products.find(p => p.id === productId);
    if (!product) {
      throw new Error('Produit non trouvé');
    }

    // 2. ENSUITE faire l'UPDATE
    console.log('📦 Produit trouvé:', product.name);
    const { data, error } = await supabase
      .from('products')
      .update({ 
        product_state: 'active',
        updated_at: new Date().toISOString()
      })
      .eq('id', productId)

    if (error) {
      console.error('❌ Erreur UPDATE:', error);
      throw error;
    }

    console.log('✅ UPDATE réussi:', data);

    // 3. PUIS notification
    await createNotification(
      product.seller_id,
      'notifications.messages.productApproved',
      'product',
      '/(tabs)/profile?tab=myItems',
      { productName: product.name }
    );

    // 4. ENFIN mise à jour state local
    setProducts(prev => prev.map(p => 
      p.id === productId 
        ? { ...p, product_state: 'active', updated_at: new Date().toISOString() }
        : p
    ));

    console.log('🎉 Approbation terminée');

  } catch (error) {
    console.error('💥 Erreur complète:', error);
    alert('Erreur: ' + error.message);
  } finally {
    setActionLoading(false);
  }
};

  // Fonction pour rejeter un produit
  const rejectProduct = async (productId) => {
    try {
      setActionLoading(true);
      console.log('🔄 Tentative de rejet produit:', productId);
      
      // 1. Mettre à jour le statut du produit
      const { data, error } = await supabase
        .from('products')
        .update({ 
          product_state: 'rejected',
          updated_at: new Date().toISOString()
        })
        .eq('id', productId)
        .select();

      if (error) {
        console.error('❌ Erreur Supabase:', error);
        throw error;
      }

      console.log('✅ Réponse Supabase:', data);

      // 2. ✅ CRÉER LA NOTIFICATION DE REJET
      const product = products.find(p => p.id === productId);
      if (product) {
        const notificationResult = await createNotification(
          product.seller_id,
          'notifications.messages.productRejected',
          'product',
          '/(tabs)/profile?tab=myItems',
          { productName: product.name }
        );

        if (!notificationResult) {
          console.warn('⚠️ Notification non créée, mais produit rejeté');
        }
      }

      // 3. Mettre à jour l'état local
      setProducts(prev => prev.map(product => 
        product.id === productId 
          ? { 
              ...product, 
              product_state: 'rejected',
              updated_at: new Date().toISOString() 
            }
          : product
      ));

      // 4. Mettre à jour le produit sélectionné si le modal est ouvert
      if (selectedProduct && selectedProduct.id === productId) {
        setSelectedProduct(prev => ({
          ...prev,
          product_state: 'rejected',
          updated_at: new Date().toISOString()
        }));
      }

      console.log('❌ Produit rejeté et notification créée:', productId);
      
    } catch (error) {
      console.error('❌ Erreur lors du rejet:', error);
      alert('Erreur lors du rejet du produit: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Ouvrir le modal de détails
  const openProductDetails = (product) => {
    const seller = users.find(u => u.id === product.seller_id);
    setSelectedProduct({
      ...product,
      seller: seller || {}
    });
    setShowModal(true);
  };

  // Fermer le modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedProduct(null);
  };

  // Filtrer les produits basé sur la recherche et l'onglet actif
  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.seller_id?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTab = 
      activeTab === 'all' ? true :
      activeTab === 'pending' ? product.product_state === 'pending' :
      activeTab === 'active' ? product.product_state === 'active' :
      activeTab === 'rejected' ? product.product_state === 'rejected' : true;

    return matchesSearch && matchesTab;
  });

  // Fonction pour obtenir le statut du produit
  const getProductStatus = (product) => {
    switch (product.product_state) {
      case 'pending':
        return 'En attente';
      case 'active':
        return 'Approuvé';
      case 'rejected':
        return 'Rejeté';
      default:
        return 'Inconnu';
    }
  };

  // Fonction pour obtenir la classe CSS du statut
  const getStatusClass = (product) => {
    switch (product.product_state) {
      case 'pending':
        return 'status-pending';
      case 'active':
        return 'status-active';
      case 'rejected':
        return 'status-rejected';
      default:
        return 'status-inactive';
    }
  };

  // Fonction pour obtenir le libellé de la condition
  const getConditionLabel = (condition) => {
    switch (condition) {
      case 'new':
        return 'Neuf';
      case 'like-new':
        return 'Comme neuf';
      case 'good':
        return 'Bon état';
      case 'fair':
        return 'État correct';
      default:
        return condition || 'Non spécifié';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'CDF'
    }).format(price || 0);
  };

  // Trouver le vendeur correspondant à un produit
  const getProductSeller = (sellerId) => {
    return users.find(user => user.id === sellerId);
  };

  // Compter les produits par statut
  const getProductsCount = (status) => {
    return products.filter(product => 
      status === 'all' ? true : product.product_state === status
    ).length;
  };

  if (loading) {
    return (
      <div className="page-content">
        <div className="page-header">
          <div className="header-title">
            <p>Chargement des produits...</p>
          </div>
        </div>
        <div className="loading-spinner">⏳</div>
      </div>
    );
  }

  return (
    <div className="page-content">
      {/* Barre de recherche et filtres */}
      <div className="products-controls">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Rechercher par nom, catégorie, localisation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>
        
        {/* Tabs pour les différents statuts */}
        <div className="tabs-container">
          <button 
            className={`tab ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            📦 Tous ({getProductsCount('all')})
          </button>
          <button 
            className={`tab ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            ⏳ En attente ({getProductsCount('pending')})
          </button>
          <button 
            className={`tab ${activeTab === 'active' ? 'active' : ''}`}
            onClick={() => setActiveTab('active')}
          >
            ✅ Approuvés ({getProductsCount('active')})
          </button>
          <button 
            className={`tab ${activeTab === 'rejected' ? 'active' : ''}`}
            onClick={() => setActiveTab('rejected')}
          >
            ❌ Rejetés ({getProductsCount('rejected')})
          </button>
        </div>
      </div>

      {/* Tableau des produits */}
      <div className="content-section">
        <div className="section-header">
          <h2>
            {activeTab === 'all' && `Tous les Produits (${filteredProducts.length})`}
            {activeTab === 'pending' && `Produits en Attente (${filteredProducts.length})`}
            {activeTab === 'active' && `Produits Approuvés (${filteredProducts.length})`}
            {activeTab === 'rejected' && `Produits Rejetés (${filteredProducts.length})`}
          </h2>
          <div className="section-actions">
            <button className="refresh-btn" onClick={fetchProducts} title="Actualiser">
              🔄
            </button>
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Produit</th>
                <th>Vendeur</th>
                <th>Catégorie</th>
                <th>Prix</th>
                <th>Localisation</th>
                <th>État</th>
                <th>Statut</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="9" className="no-data">
                    {searchTerm ? 'Aucun produit trouvé' : 'Aucun produit'}
                  </td>
                </tr>
              ) : (
                filteredProducts.map(product => {
                  const seller = getProductSeller(product.seller_id);
                  return (
                    <tr key={product.id}>
                      <td>
                        <div className="product-cell">
                          {product.thumbnail && (
                            <img 
                              src={product.thumbnail} 
                              alt={product.name}
                              className="product-thumbnail"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          )}
                          <div className="product-info">
                            <div className="product-name">
                              {product.name}
                            </div>
                            <div className="product-id">ID: {product.id.substring(0, 8)}...</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="seller-info">
                          <div className="seller-name">
                            {seller?.full_name || 'Utilisateur'}
                          </div>
                          <div className="seller-email">{seller?.email || 'Email non disponible'}</div>
                        </div>
                      </td>
                      <td>
                        <div className="category-info">
                          <span className="category">{product.category}</span>
                          {product.sub_category && (
                            <span className="sub-category">{product.sub_category}</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className="product-price">
                          {formatPrice(product.price)}
                        </span>
                      </td>
                      <td>{product.location || 'N/A'}</td>
                      <td>
                        <span className="condition-badge">
                          {getConditionLabel(product.condition)}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${getStatusClass(product)}`}>
                          {getProductStatus(product)}
                        </span>
                      </td>
                      <td>{formatDate(product.created_at)}</td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="action-btn view" 
                            title="Voir détails"
                            onClick={() => openProductDetails(product)}
                          >
                            👁️
                          </button>
                          {product.product_state === 'pending' && (
                            <>
                              <button 
                                className="action-btn approve" 
                                title="Approuver"
                                onClick={() => approveProduct(product.id)}
                                disabled={actionLoading}
                              >
                                {actionLoading ? '...' : '✅'}
                              </button>
                              <button 
                                className="action-btn reject" 
                                title="Rejeter"
                                onClick={() => rejectProduct(product.id)}
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

      {/* Modal de détails du produit */}
      {showModal && selectedProduct && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Détails du Produit</h2>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            
            <div className="modal-body">
              {/* Images du produit */}
              {selectedProduct.images && selectedProduct.images.length > 0 && (
                <div className="product-section">
                  <h3>Images du Produit</h3>
                  <div className="product-images-grid">
                    {selectedProduct.images.map((image, index) => (
                      <div key={index} className="product-image-container">
                        <img 
                          src={image} 
                          alt={`${selectedProduct.name} ${index + 1}`}
                          className="product-image"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                        <div className="image-placeholder">
                          📷 Image non chargée
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="product-section">
                <h3>Informations du Produit</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Nom:</label>
                    <span>{selectedProduct.name}</span>
                  </div>
                  <div className="info-item">
                    <label>Description:</label>
                    <span>{selectedProduct.description || 'Non renseignée'}</span>
                  </div>
                  <div className="info-item">
                    <label>Prix:</label>
                    <span className="product-price-large">
                      {formatPrice(selectedProduct.price)}
                    </span>
                  </div>
                  <div className="info-item">
                    <label>Catégorie:</label>
                    <span>{selectedProduct.category}</span>
                  </div>
                  <div className="info-item">
                    <label>Sous-catégorie:</label>
                    <span>{selectedProduct.sub_category || 'Non renseignée'}</span>
                  </div>
                  <div className="info-item">
                    <label>État:</label>
                    <span className="condition-badge">
                      {getConditionLabel(selectedProduct.condition)}
                    </span>
                  </div>
                  <div className="info-item">
                    <label>Localisation:</label>
                    <span>{selectedProduct.location || 'Non renseignée'}</span>
                  </div>
                </div>
              </div>

              <div className="product-section">
                <h3>Informations du Vendeur</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Nom:</label>
                    <span>{selectedProduct.seller?.full_name || 'Non disponible'}</span>
                  </div>
                  <div className="info-item">
                    <label>Email:</label>
                    <span>{selectedProduct.seller?.email || 'Non disponible'}</span>
                  </div>
                  <div className="info-item">
                    <label>ID Vendeur:</label>
                    <span className="user-id">{selectedProduct.seller_id}</span>
                  </div>
                </div>
              </div>

              <div className="product-section">
                <h3>Statut et Métriques</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Statut:</label>
                    <span className={`status-badge ${getStatusClass(selectedProduct)}`}>
                      {getProductStatus(selectedProduct)}
                    </span>
                  </div>
                  <div className="info-item">
                    <label>Vues:</label>
                    <span>{selectedProduct.views || 0}</span>
                  </div>
                  <div className="info-item">
                    <label>Créé le:</label>
                    <span>{formatDate(selectedProduct.created_at)}</span>
                  </div>
                  <div className="info-item">
                    <label>Modifié le:</label>
                    <span>{formatDate(selectedProduct.updated_at)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={closeModal}>
                Fermer
              </button>
              {selectedProduct.product_state === 'pending' && (
                <div className="product-actions">
                  <button 
                    className="btn-success" 
                    onClick={() => approveProduct(selectedProduct.id)}
                    disabled={actionLoading}
                  >
                    {actionLoading ? 'Traitement...' : '✅ Approuver'}
                  </button>
                  <button 
                    className="btn-danger" 
                    onClick={() => rejectProduct(selectedProduct.id)}
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

export default Products;