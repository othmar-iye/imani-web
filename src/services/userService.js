import { supabase } from '../config/supabase'

export const userService = {
  async getAllUsers() {
    try {
      console.log('🔄 Début de getAllUsers()');
      console.log('🔑 Supabase config:', {
        url: process.env.REACT_APP_SUPABASE_URL,
        keyPresent: !!process.env.REACT_APP_SUPABASE_ANON_KEY
      });

      // Test 1: Vérifier la connexion de base
      const { data: session, error: sessionError } = await supabase.auth.getSession();
      console.log('🔐 Session:', session);
      console.log('❌ Erreur session:', sessionError);

      // Test 2: Essayer d'accéder à user_profiles d'abord (plus simple)
      console.log('📊 Tentative user_profiles...');
      const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('*');

      console.log('✅ user_profiles données:', profiles);
      console.log('❌ user_profiles erreur:', profilesError);

      // Test 3: Essayer auth.admin.listUsers()
      console.log('👤 Tentative auth.admin.listUsers()...');
      const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
      
      console.log('✅ auth.admin données:', authData);
      console.log('❌ auth.admin erreur:', authError);

      // Si auth.admin ne fonctionne pas, utiliser user_profiles comme fallback
      let users = [];
      
      if (authData && authData.users && !authError) {
        console.log('🎯 Utilisation des données auth.users');
        users = this.transformAuthUsers(authData.users, profiles || []);
      } else if (profiles && !profilesError) {
        console.log('🔄 Fallback: utilisation user_profiles seulement');
        users = this.transformProfilesOnly(profiles);
      } else {
        console.log('💥 Aucune donnée disponible');
        return [];
      }

      console.log('📋 Utilisateurs transformés:', users);
      return users;

    } catch (error) {
      console.error('💥 Erreur dans getAllUsers:', error);
      return [];
    }
  },

  // Transformer les données depuis auth.users + user_profiles
  transformAuthUsers(authUsers, profiles) {
    const profilesMap = new Map();
    profiles.forEach(profile => {
      profilesMap.set(profile.id, profile);
    });

    return authUsers.map(user => {
      const userProfile = profilesMap.get(user.id);
      const isSeller = !!userProfile;

      return {
        id: user.id,
        name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Utilisateur',
        email: user.email,
        phone_number: userProfile?.phone_number || null,
        city: userProfile?.city || null,
        type: isSeller ? 'seller' : 'user',
        status: this.getUserStatus(userProfile?.verification_status),
        verification_status: userProfile?.verification_status || 'not_seller',
        date: new Date(user.created_at).toLocaleDateString('fr-FR'),
        avatar: this.generateAvatar(user.user_metadata?.full_name || user.email),
        created_at: user.created_at
      };
    });
  },

  // Fallback: utiliser seulement user_profiles
  transformProfilesOnly(profiles) {
    return profiles.map(profile => {
      return {
        id: profile.id,
        name: `Utilisateur ${profile.phone_number || profile.id.slice(0, 8)}`,
        email: profile.phone_number ? `${profile.phone_number}@imani.cd` : 'email@manquant.cd',
        phone_number: profile.phone_number,
        city: profile.city,
        type: 'seller', // Tous les user_profiles sont des vendeurs potentiels
        status: this.getUserStatus(profile.verification_status),
        verification_status: profile.verification_status,
        date: new Date(profile.created_at).toLocaleDateString('fr-FR'),
        avatar: this.generateAvatar(profile.phone_number),
        created_at: profile.created_at
      };
    });
  },

  // Le reste des méthodes reste identique...
  async getStats() {
    try {
      const users = await this.getAllUsers();
      
      const totalUsers = users.length;
      const sellers = users.filter(user => user.type === 'seller');
      const totalSellers = sellers.length;
      const verifiedSellers = sellers.filter(seller => seller.verification_status === 'verified').length;
      const pendingSellers = sellers.filter(seller => seller.verification_status === 'pending_review').length;

      return {
        totalUsers,
        totalSellers,
        verifiedSellers,
        pendingSellers,
        basicUsers: totalUsers - totalSellers
      };

    } catch (error) {
      console.error('Erreur getStats:', error);
      return {
        totalUsers: 0,
        totalSellers: 0,
        verifiedSellers: 0,
        pendingSellers: 0,
        basicUsers: 0
      };
    }
  },

  generateAvatar(text) {
    if (!text) return '??';
    
    if (text.includes('@')) {
      return text.split('@')[0].slice(0, 2).toUpperCase();
    }
    
    const words = text.split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    
    return text.slice(0, 2).toUpperCase();
  },

  getUserStatus(verificationStatus) {
    switch (verificationStatus) {
      case 'verified': return 'Vérifié';
      case 'pending_review': return 'En attente';
      case 'not_submitted': return 'En attente';
      default: return 'Utilisateur';
    }
  }
};