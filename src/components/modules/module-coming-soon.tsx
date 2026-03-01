import BuildCircleRoundedIcon from "@mui/icons-material/BuildCircleRounded";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

type ModuleComingSoonProps = {
  title: string;
  description: string;
};

export default function ModuleComingSoon({ title, description }: ModuleComingSoonProps) {
  return (
    <Paper elevation={0} className="admin-panel rounded-2xl p-8">
      <Stack spacing={2}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <BuildCircleRoundedIcon color="primary" />
          <Typography variant="h4" fontWeight={700}>
            {title}
          </Typography>
          <Chip label="Coming soon" color="primary" size="small" />
        </Stack>
        <Typography variant="body1" color="text.secondary">
          {description}
        </Typography>
      </Stack>
    </Paper>
  );
}
