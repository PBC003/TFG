import CalculateRoundedIcon from "@mui/icons-material/CalculateRounded";
import { Box, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { Link as RouterLink } from "react-router-dom";
import { ROUTES } from "../../../constants/routes";

interface AppLayoutBrandProps {
  appName: string;
}

export function AppLayoutBrand({ appName }: AppLayoutBrandProps) {
  return (
    <Stack
      component={RouterLink}
      direction="row"
      spacing={1.5}
      to={ROUTES.home}
      sx={{
        alignItems: "center",
        color: "inherit",
        flexGrow: 1,
        minWidth: 0,
      }}
    >
      <Box
        sx={{
          width: 42,
          height: 42,
          borderRadius: 2.5,
          display: "grid",
          placeItems: "center",
          bgcolor: "rgba(255,255,255,0.14)",
          border: `1px solid ${alpha("#FFFFFF", 0.18)}`,
          flexShrink: 0,
        }}
      >
        <CalculateRoundedIcon />
      </Box>
      <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.15 }}>
        {appName}
      </Typography>
    </Stack>
  );
}
