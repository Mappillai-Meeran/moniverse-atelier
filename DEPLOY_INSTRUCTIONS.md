# How to Deploy "Moniverse Atelier" to Vercel

Since you are using Vercel, here is the easiest way to get your site online manually:

1.  **Go to Vercel**: Visit [https://vercel.com](https://vercel.com) and log in (or sign up).
2.  **Add New Project**: Click on the **"Add New..."** button and select **"Project"**.
3.  **Upload**: You should see an option to **"Import Third-Party Git Repository"** or simply drag and drop used if you use the Vercel CLI, but the easiest web-based way without Git is:
    *   **Install Vercel CLI** (if you are comfortable with command line): `npm i -g vercel` then run `vercel` in this folder.
    *   **OR (Easier) Connect GitHub**:
        1.  Create a repository on GitHub.
        2.  Upload these files to it.
        3.  In Vercel, select "Import from GitHub" and choose your new repository.

**Important**: When Vercel asks for the **Project Name**, enter: `moniverse-atelier`
(Vercel URLs use hyphens `-` instead of underscores `_`, so `moniverse_atelier` will become `moniverse-atelier`).

Your site will be live at: **https://moniverse-atelier.vercel.app**
