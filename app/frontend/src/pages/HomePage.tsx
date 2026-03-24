import { Stack } from "@mui/material";
import { useAuth } from "../hooks/useAuth";
import { HomeAuthenticatedSection } from "../components/home/HomeAuthenticatedSection.tsx";
import { HomeHero } from "../components/home/HomeHero.tsx";
import { HomePublicSection } from "../components/home/HomePublicSection.tsx";

export default function HomePage() {
  const auth = useAuth();

  return (
    <Stack spacing={3.5}>
      <HomeHero isAuthenticated={auth.isAuthenticated} isAdmin={auth.isAdmin} />
      {auth.isAuthenticated ? (
        <HomeAuthenticatedSection />
      ) : (
        <HomePublicSection />
      )}
    </Stack>
  );
}
