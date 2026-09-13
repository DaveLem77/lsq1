# LSQ Astra Simple

## Le plus simple pour le mettre en ligne

1. Crée un repository GitHub.
2. Mets tous les fichiers de ce dossier dedans.
3. Va sur Vercel.
4. Fais **Add New → Project** et choisis ton repository GitHub.
5. Clique sur **Deploy**.
6. Dans Vercel : **Settings → Environment Variables**.
7. Ajoute une variable nommée :

`OPENAI_API_KEY`

8. Colle ta clé API OpenAI comme valeur.
9. Fais **Redeploy**.

Après ça, tu n'as plus rien à entrer.

Sur ton téléphone, ouvre simplement l'URL `https://...vercel.app`,
autorise la caméra et appuie sur **Commencer**.

Important : ne mets jamais ta clé OpenAI directement dans `index.html`
ou dans un repository GitHub public.
