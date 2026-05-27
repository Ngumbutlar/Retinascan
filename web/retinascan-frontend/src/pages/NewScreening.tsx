import * as React from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  FormControl,
  FormControlLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  BoltOutlined as BoltIcon,
  CloudUploadOutlined as UploadIcon,
  ImageSearchOutlined as FundusIcon,
  InfoOutlined as InfoIcon,
  LockOutlined as LockIcon,
  MemoryOutlined as ServerIcon,
  PersonOutlined as PersonIcon,
  ShieldOutlined as ShieldIcon,
  SpeedOutlined as SpeedIcon,
  VerifiedOutlined as VerifiedIcon,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

function LabeledField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Typography
        component="label"
        sx={{
          display: 'block',
          mb: 0.75,
          fontSize: '0.72rem',
          fontWeight: 800,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'text.secondary',
        }}
      >
        {label}
      </Typography>
      {children}
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Card sx={{ borderRadius: '10px' }}>
      <CardContent className="flex items-center gap-3 p-3!">
        <div className="grid size-9 place-items-center rounded-md bg-[#EDF2F0] text-brand-green">{icon}</div>
        <div>
          <p className="text-[0.62rem] font-extrabold uppercase tracking-wider text-brand-muted">{label}</p>
          <p className="text-[1.05rem] font-semibold text-brand-slate">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function NewScreening() {
  const [sex, setSex] = React.useState('male');
  const [eyeTarget, setEyeTarget] = React.useState('');

  return (
    <Box className="w-full">
      {/* Header */}
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div>
          <Button
            component={Link}
            to="/records"
            startIcon={<ArrowBackIcon fontSize="small" />}
            sx={{
              px: 0,
              mb: 0.5,
              minWidth: 0,
              color: 'text.secondary',
              fontWeight: 500,
              textTransform: 'none',
              '&:hover': { backgroundColor: 'transparent', color: 'text.primary' },
            }}
          >
            Back to Patients
          </Button>
          <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1.15 }}>
            New Screening
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
            Initiate a new AI-assisted retinal analysis for a clinical patient.
          </Typography>
        </div>

        <Chip
          size="small"
          label="Clinical Hub Connected"
          icon={<BoltIcon sx={{ color: '#1A6B3C !important' }} />}
          sx={{
            mt: { xs: 0, md: 1.5 },
            height: 28,
            bgcolor: '#BDF2C6',
            color: '#0F3D24',
            fontWeight: 700,
            borderRadius: '999px',
            '& .MuiChip-label': { px: 1.25, fontSize: '0.78rem' },
          }}
        />
      </div>

      {/* Main content */}
      <div className="mt-8 grid grid-cols-1 gap-4 xl:grid-cols-5">
        {/* Left column */}
        <div className="space-y-4 xl:col-span-2">
          <Card sx={{ borderRadius: '10px' }}>
            <CardContent className="p-0!">
              <div className="flex items-center gap-2 px-5 py-4">
                <PersonIcon sx={{ color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Patient Identification
                </Typography>
              </div>
              <Divider />
              <div className="space-y-4 px-5 py-4">
                <LabeledField label="Full Name">
                  <TextField fullWidth size="small" placeholder="e.g. Eleanor Rigby" />
                </LabeledField>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <LabeledField label="Age">
                    <TextField fullWidth size="small" placeholder="Years" />
                  </LabeledField>
                  <LabeledField label="Hospital ID">
                    <TextField fullWidth size="small" placeholder="ID-000000" />
                  </LabeledField>
                </div>

                <LabeledField label="Sex">
                  <FormControl>
                    <RadioGroup
                      row
                      value={sex}
                      onChange={(e) => setSex(e.target.value)}
                      className="gap-5"
                    >
                      <FormControlLabel value="male" control={<Radio size="small" />} label="Male" />
                      <FormControlLabel value="female" control={<Radio size="small" />} label="Female" />
                      <FormControlLabel value="other" control={<Radio size="small" />} label="Other" />
                    </RadioGroup>
                  </FormControl>
                </LabeledField>

                <LabeledField label="Eye to Screen">
                  <FormControl fullWidth size="small">
                    <Select
                      displayEmpty
                      value={eyeTarget}
                      onChange={(e) => setEyeTarget(e.target.value)}
                      renderValue={(selected) =>
                        selected || <span className="text-gray-500">Select observation target...</span>
                      }
                    >
                      <MenuItem value="od">Right Eye (OD)</MenuItem>
                      <MenuItem value="os">Left Eye (OS)</MenuItem>
                      <MenuItem value="ou">Both Eyes (OU)</MenuItem>
                    </Select>
                  </FormControl>
                </LabeledField>
              </div>
            </CardContent>
          </Card>

          <Card sx={{ borderRadius: '10px' }}>
            <CardContent className="p-4!">
              <div className="flex items-start gap-2.5">
                <InfoIcon sx={{ color: 'primary.main', mt: '2px' }} fontSize="small" />
                <div>
                  <p className="text-[0.72rem] font-extrabold uppercase tracking-wider text-brand-green">
                    Protocol Notice
                  </p>
                  <p className="mt-1 text-[1.03rem] leading-relaxed text-brand-slate">
                    Ensure the patient is seated in a dark environment for at least 3 minutes prior to
                    fundus imaging for optimal pupil dilation.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-4 xl:col-span-3">
          <Card sx={{ borderRadius: '10px' }}>
            <CardContent className="p-0!">
              <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                <div className="flex items-center gap-2">
                  <FundusIcon sx={{ color: 'primary.main' }} />
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Retinal Fundus Image
                  </Typography>
                </div>

                <div className="flex items-center gap-2">
                  <p className="text-[0.7rem] font-extrabold uppercase tracking-wider text-brand-muted">Quality:</p>
                  <Chip
                    size="small"
                    label="No Input"
                    sx={{
                      height: 24,
                      borderRadius: '999px',
                      bgcolor: '#EDF2F0',
                      color: '#718096',
                      fontWeight: 700,
                    }}
                  />
                </div>
              </div>
              <Divider />

              <div className="p-5">
                <div className="rounded-xl border border-dashed border-[#D5DCE3] bg-[#F9FBFA] p-8 text-center">
                  <div className="mx-auto mb-4 grid size-14 place-items-center rounded-xl bg-[#BDF2C6] text-brand-green">
                    <UploadIcon sx={{ fontSize: 30 }} />
                  </div>
                  <Typography variant="h5" sx={{ fontWeight: 500, mb: 1 }}>
                    Drop retinal fundus image here
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'text.secondary', mb: 2.5 }}>
                    Support for high-resolution TIFF, JPG, or DICOM
                    <br />
                    files (Max 50MB per file)
                  </Typography>
                  <Button
                    variant="outlined"
                    sx={{
                      borderColor: '#AFC4B9',
                      color: 'primary.main',
                      fontWeight: 700,
                      textTransform: 'none',
                      borderRadius: '10px',
                      px: 3,
                      '&:hover': { borderColor: 'primary.main', backgroundColor: 'transparent' },
                    }}
                  >
                    or click to browse
                  </Button>
                </div>
              </div>

              <Divider />

              <div className="flex flex-col gap-4 px-5 py-4 md:flex-row md:items-center md:justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-brand-slate">
                    <ShieldIcon fontSize="small" />
                    <Typography variant="h6" sx={{ fontWeight: 500 }}>
                      AI Model v4.2 Ready
                    </Typography>
                  </div>
                  <div className="flex items-center gap-2 text-brand-slate">
                    <LockIcon fontSize="small" />
                    <Typography variant="h6" sx={{ fontWeight: 500 }}>
                      HIPAA Compliant Processing
                    </Typography>
                  </div>
                </div>

                <Button
                  variant="contained"
                  disabled
                  endIcon={<ArrowForwardIcon />}
                  sx={{
                    minWidth: 170,
                    py: 1.2,
                    borderRadius: '10px',
                    textTransform: 'none',
                    fontWeight: 700,
                  }}
                >
                  Analyse Image
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <MetricCard icon={<ServerIcon fontSize="small" />} label="Server Load" value="14% (Optimal)" />
            <MetricCard icon={<SpeedIcon fontSize="small" />} label="Est. Speed" value="~3.4 Seconds" />
            <MetricCard icon={<VerifiedIcon fontSize="small" />} label="Accuracy" value="99.2% Validated" />
          </div>
        </div>
      </div>

      <footer className="mt-28 flex flex-col gap-3 pb-2 text-[0.72rem] font-semibold uppercase tracking-wider text-gray-500 md:flex-row md:items-center md:justify-between">
        <p>© 2024 RetinaScan Diagnostics • Version 2.1.0-Stable</p>
        <div className="flex items-center gap-6">
          <span>Privacy Policy</span>
          <span>Security Audit</span>
        </div>
      </footer>
    </Box>
  );
}