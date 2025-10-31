import { supabase } from '../config/supabase'

export const userService = {
  // Récupérer simplement tous les utilisateurs depuis auth.users
  async getBasicUsers() {
    try {
      console.log('🔄 Tentative de récupération des utilisateurs...');

      // Méthode 1: Via l'API admin (nécessite des permissions)
      const { data: { users }, error } = await supabase.auth.admin.listUsers();
      
      if (error) {
        console.error('❌ Erreur avec auth.admin.listUsers:', error);
        
        // Méthode 2: Fallback - utiliser la session actuelle pour tester
        const { data: { session } } = await supabase.auth.getSession();
        console.log('🔐 Session actuelle:', session);
        
        return []; // Retourner vide pour l'instant
      }

      console.log('✅ Utilisateurs récupérés:', users);

      // Transformer les données
      const simpleUsers = users.map(user => ({
        id: user.id,
        email: user.email,
        name: user.user_metadata?.full_name || 'Non défini',
        created_at: new Date(user.created_at).toLocaleDateString('fr-FR'),
        last_sign_in: user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString('fr-FR') : 'Jamais',
        status: user.email_confirmed_at ? 'Confirmé' : 'En attente'
      }));

      return simpleUsers;

    } catch (error) {
      console.error('💥 Erreur getBasicUsers:', error);
      return [];
    }
  },

  // Récupérer les vendeurs depuis user_profiles
  async getSellers() {
    try {
      const { data: profiles, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erreur user_profiles:', error);
        return [];
      }

      return profiles.map(profile => ({
        id: profile.id,
        phone_number: profile.phone_number,
        city: profile.city,
        status: profile.verification_status,
        created_at: new Date(profile.created_at).toLocaleDateString('fr-FR')
      }));

    } catch (error) {
      console.error('💥 Erreur getSellers:', error);
      return [];
    }
  }
};