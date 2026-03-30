import { Grid, Stack } from "@mui/material";
import { useAuth } from "../../hooks/useAuth";
import { ProfileAccountDataCard } from "./components/ProfileAccountDataCard";
import { ProfilePageHeader } from "./components/ProfilePageHeader";
import { ProfilePasswordCard } from "./components/ProfilePasswordCard";
import { useProfilePasswordForm } from "./hooks/useProfilePasswordForm";

export default function ProfilePage() {
  const auth = useAuth();
  const passwordForm = useProfilePasswordForm();

  if (!auth.user) {
    return null;
  }

  return (
    <Stack spacing={3.5}>
      <ProfilePageHeader user={auth.user} />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <ProfileAccountDataCard user={auth.user} />
        </Grid>

        <Grid size={{ xs: 12, lg: 5 }}>
          <ProfilePasswordCard {...passwordForm} />
        </Grid>
      </Grid>
    </Stack>
  );
}
