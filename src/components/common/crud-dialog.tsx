import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";

export default function CrudDialog({
  open,
  title,
  onClose,
  onSubmit,
  submitLabel,
  loading,
  children
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  onSubmit: () => void;
  submitLabel: string;
  loading?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{ className: "rounded-3xl border border-[var(--admin-border)]" }}
    >
      <DialogTitle className="pb-1 font-semibold">{title}</DialogTitle>
      <DialogContent className="pt-2">{children}</DialogContent>
      <DialogActions className="px-6 pb-5">
        <Button onClick={onClose} color="inherit" className="rounded-xl">
          Cancel
        </Button>
        <Button onClick={onSubmit} variant="contained" disabled={loading} className="rounded-xl px-4">
          {loading ? "Saving..." : submitLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
