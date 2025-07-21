## Working with this Repository

This project uses Supabase for authentication and potentially other backend services.

### Environment Variables

To run this project locally and connect to Supabase, you need to set up the following environment variables.

1.  **Create a `.env` file:**
    In the root directory of the project, create a file named `.env`.

2.  **Add Supabase Credentials:**
    Open the `.env` file and add your Supabase project URL and anon key:

    ```env
    VITE_SUPABASE_URL="YOUR_SUPABASE_PROJECT_URL"
    VITE_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_PUBLIC_KEY"
    ```

    Replace `"YOUR_SUPABASE_PROJECT_URL"` with your actual Supabase project URL and `"YOUR_SUPABASE_ANON_PUBLIC_KEY"` with your Supabase project's public anon key. These can be found in your Supabase project settings under API.

### Running the Application

Ensure you have Node.js and npm installed.

1.  Install dependencies:
    ```bash
    npm install
    ```

2.  Run the development server:
    ```bash
    npm run dev
    ```

### Code Conventions & Structure

*   **Authentication**: Managed via Supabase.
    *   Supabase client is initialized in `src/lib/supabaseClient.ts`.
    *   Authentication service logic is in `src/services/authService.ts`.
    *   React Context for authentication state is `src/contexts/AuthContext.tsx`, which uses `react-query` for asynchronous operations.
*   **API Calls**: Use `react-query` for data fetching, caching, and state management related to API interactions.
*   **Modularity**: Keep components and services focused on specific functionalities.

### Future Development Notes

*   When adding new features that require backend interaction, consider using Supabase for consistency if it fits the requirements.
*   If you modify authentication logic, ensure it's compatible with the existing Supabase setup and that `AuthContext.tsx` is updated accordingly.
*   Remember to update environment variable instructions in this `AGENTS.md` if new environment-specific configurations are added.
