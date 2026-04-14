# Configuration Google OAuth

## Étapes pour configurer Google OAuth :

1. **Aller sur Google Cloud Console** : https://console.cloud.google.com/

2. **Créer un projet** ou sélectionner un projet existant

3. **Activer l'API Google+** :
   - Dans le menu latéral, aller à "APIs & Services" > "Library"
   - Rechercher "Google+ API" et l'activer

4. **Créer des credentials OAuth 2.0** :
   - Aller à "APIs & Services" > "Credentials"
   - Cliquer sur "Create Credentials" > "OAuth 2.0 Client IDs"
   - Sélectionner "Web application"
   - Ajouter ces URIs de redirection autorisées :
     - `http://localhost:5173/oauth2/redirect`
   - Copier le Client ID généré

5. **Configurer l'application** :
   - Copier `.env.example` vers `.env`
   - Remplacer `votre_google_client_id_ici` par votre Client ID réel

6. **Redémarrer le frontend** :
   ```bash
   cd frontend
   npm run dev
   ```

## Test de Google OAuth

Une fois configuré, vous pouvez :
- Aller sur http://localhost:5173/login
- Cliquer sur "Continue with Google"
- Accepter les permissions
- Vous serez redirigé vers le dashboard après connexion réussie