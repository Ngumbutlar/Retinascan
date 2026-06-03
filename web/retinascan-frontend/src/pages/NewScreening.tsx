import * as React from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  InputAdornment,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import BoltIcon from '@mui/icons-material/BoltOutlined';
import FacilityIcon from '@mui/icons-material/BusinessOutlined';
import UploadIcon from '@mui/icons-material/CloudUploadOutlined';
import FundusIcon from '@mui/icons-material/ImageSearchOutlined';
import InfoIcon from '@mui/icons-material/InfoOutlined';
import LockIcon from '@mui/icons-material/LockOutlined';
import ServerIcon from '@mui/icons-material/MemoryOutlined';
import PersonIcon from '@mui/icons-material/PersonOutlined';
import ShieldIcon from '@mui/icons-material/ShieldOutlined';
import SpeedIcon from '@mui/icons-material/SpeedOutlined';
import VerifiedIcon from '@mui/icons-material/VerifiedOutlined';
import { Link, useNavigate } from 'react-router-dom';
import AnalysisModal from '../components/common/Processing';
import api from '../services/api';
import type { User } from '../types/auth';
import type { ScreeningResult } from '../types/screening';

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const QUALITY_GOOD_BYTES = 500 * 1024;

const disabledFieldSx = {
  '& .MuiOutlinedInput-root': {
    backgroundColor: '#F1F5F4',
    '& fieldset': { borderColor: '#E2E8F0' },
    '& .MuiOutlinedInput-input': {
      color: '#718096',
      WebkitTextFillColor: '#718096',
    },
  },
};

function LabeledField({
  label,
  children,
  error,
}: {
  label: string;
  children: React.ReactNode;
  error?: string;
}) {
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
      {error ? (
        <FormHelperText error sx={{ mx: 0, mt: 0.75 }}>
          {error}
        </FormHelperText>
      ) : null}
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

function readStoredUser(): User | null {
  const stored = localStorage.getItem('retinascan_user');
  if (!stored) return null;
  try {
    return JSON.parse(stored) as User;
  } catch {
    return null;
  }
}

function formatEyeLabel(eye: string): string {
  if (eye === 'Left') return 'Left Eye (OS)';
  if (eye === 'Right') return 'Right Eye (OD)';
  if (eye === 'Both') return 'Both Eyes (OU)';
  return eye;
}

export default function NewScreening() {
  const navigate = useNavigate();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [facilityName, setFacilityName] = React.useState('');
  const [facilityId, setFacilityId] = React.useState<number | null>(null);

  const [patientName, setPatientName] = React.useState('');
  const [patientAge, setPatientAge] = React.useState('');
  const [patientSex, setPatientSex] = React.useState<'Male' | 'Female' | ''>('');
  const [hospitalId, setHospitalId] = React.useState('');
  const [eye, setEye] = React.useState<'Left' | 'Right' | 'Both' | ''>('');
  const [selectedImage, setSelectedImage] = React.useState<File | null>(null);
  const [imagePreview, setImagePreview] = React.useState('');

  const [isAnalysing, setIsAnalysing] = React.useState(false);
  const [submitAttempted, setSubmitAttempted] = React.useState(false);
  const [formError, setFormError] = React.useState('');
  const [imageError, setImageError] = React.useState('');
  const [isDragOver, setIsDragOver] = React.useState(false);

  React.useEffect(() => {
    const user = readStoredUser();
    if (!user) return;

    setFacilityName(user.facility ?? '');

    if (user.facility_id != null) {
      setFacilityId(user.facility_id);
      setHospitalId(String(user.facility_id));
      return;
    }

    if (!user.facility) return;

    api
      .get<{ id: number; name: string }[]>('/auth/facilities')
      .then((res) => {
        const facilities = res.data;
        const match = facilities.find((f) => f.name === user.facility);
        if (match) {
          setFacilityId(match.id);
          setHospitalId(String(match.id));
        }
      })
      .catch(() => {
        /* facility_id resolved on submit if still missing */
      });
  }, []);

  const ageNumber = patientAge.trim() === '' ? NaN : Number(patientAge);
  const isAgeValid = Number.isInteger(ageNumber) && ageNumber >= 1 && ageNumber <= 120;

  const canAnalyse =
    patientName.trim() !== '' &&
    isAgeValid &&
    patientSex !== '' &&
    eye !== '' &&
    selectedImage !== null &&
    facilityId != null;

  const fieldErrors = {
    patientName:
      submitAttempted && patientName.trim() === '' ? 'Patient name is required' : undefined,
    patientAge:
      submitAttempted && !isAgeValid ? 'Enter a valid age between 1 and 120' : undefined,
    patientSex: submitAttempted && patientSex === '' ? 'Please select sex' : undefined,
    eye: submitAttempted && eye === '' ? 'Please select which eye to screen' : undefined,
    image:
      submitAttempted && !selectedImage
        ? imageError || 'Please upload a fundus image'
        : imageError || undefined,
  };

  const qualityLabel = !selectedImage
    ? null
    : selectedImage.size > QUALITY_GOOD_BYTES
      ? { text: 'Good quality', color: '#1A6B3C', bg: '#E8F5EE' }
      : { text: 'Image may be low resolution', color: '#B7791F', bg: '#FFF7E6' };

  const applyImageFile = (file: File) => {
    setImageError('');

    if (!file.type.startsWith('image/')) {
      setImageError('File must be an image (JPEG, PNG, etc.)');
      setSelectedImage(null);
      setImagePreview('');
      return;
    }

    if (file.size > MAX_FILE_BYTES) {
      setImageError('Image must be 10MB or smaller');
      setSelectedImage(null);
      setImagePreview('');
      return;
    }

    setSelectedImage(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview((e.target?.result as string) ?? '');
    reader.readAsDataURL(file);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) applyImageFile(file);
    event.target.value = '';
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
    const file = event.dataTransfer.files?.[0];
    if (file) applyImageFile(file);
  };

  const handleAnalyse = async (): Promise<ScreeningResult> => {
    const user = readStoredUser();
    const resolvedFacilityId = facilityId ?? user?.facility_id;

    if (resolvedFacilityId == null) {
      throw new Error('Facility could not be determined. Please log in again.');
    }

    const formData = new FormData();
    formData.append('image', selectedImage!);
    formData.append('patient_name', patientName.trim());
    formData.append('patient_age', patientAge);
    formData.append('patient_sex', patientSex);
    formData.append('hospital_id', hospitalId.trim());
    formData.append('eye', eye);
    formData.append('facility_id', String(resolvedFacilityId));

    // Debugging form data (using forEach for TypeScript compatibility)
    formData.forEach((value, key) => {
      console.log(key, value);
    });

    try {
      // Do not set Content-Type manually — axios adds multipart boundary automatically
      const response = await api.post<ScreeningResult>('/predict', formData);
      return response.data;
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string; message?: string } } };
      const message =
        axiosErr.response?.data?.error ||
        axiosErr.response?.data?.message ||
        'Analysis failed. Please try again.';
      throw new Error(message);
    }
  };

  const handleSubmit = () => {
    setSubmitAttempted(true);
    setFormError('');

    if (!canAnalyse) return;

    setIsAnalysing(true);
  };

  const handleComplete = (result: ScreeningResult) => {
    setIsAnalysing(false);
    navigate('/results', {
      state: {
        ...result,
        patient: {
          ...result.patient,
          hospital_id: result.patient.hospital_id ?? hospitalId.trim(),
        },
        fundus_image_preview: imagePreview,
      },
    });
  };

  const handleError = (error: string) => {
    setIsAnalysing(false);
    setFormError(error);
  };

  return (
    <Box className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      <AnalysisModal
        isOpen={isAnalysing}
        patientName={patientName.trim() || 'Patient'}
        eye={eye ? formatEyeLabel(eye) : ''}
        imagePreview={imagePreview}
        onAnalyse={handleAnalyse}
        onComplete={handleComplete}
        onError={handleError}
      />

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

      {formError ? (
        <Alert severity="error" sx={{ mt: 3, borderRadius: '10px' }}>
          {formError}
        </Alert>
      ) : null}

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

                <LabeledField label="Full Name" error={fieldErrors.patientName}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="e.g. Eleanor Rigby"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    error={!!fieldErrors.patientName}
                  />
                </LabeledField>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <LabeledField label="Age" error={fieldErrors.patientAge}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Years"
                      type="number"
                      slotProps={{ htmlInput: { min: 1, max: 120 } }}
                      value={patientAge}
                      onChange={(e) => setPatientAge(e.target.value)}
                      error={!!fieldErrors.patientAge}
                    />
                  </LabeledField>
                  <LabeledField label="Hospital ID" error={submitAttempted && !facilityId ? 'ID not available — log in again' : undefined}>
                    <TextField
                      fullWidth
                      size="small"
                      disabled
                      value={hospitalId}
                      sx={disabledFieldSx}
                    />
                  </LabeledField>
                </div>

                <LabeledField label="Sex" error={fieldErrors.patientSex}>
                  <FormControl error={!!fieldErrors.patientSex}>
                    <RadioGroup
                      row
                      value={patientSex}
                      onChange={(e) => setPatientSex(e.target.value as 'Male' | 'Female')}
                      className="gap-5"
                    >
                      <FormControlLabel value="Male" control={<Radio size="small" />} label="Male" />
                      <FormControlLabel value="Female" control={<Radio size="small" />} label="Female" />
                    </RadioGroup>
                  </FormControl>
                </LabeledField>

                <LabeledField label="Eye to Screen" error={fieldErrors.eye}>
                  <FormControl fullWidth size="small" error={!!fieldErrors.eye}>
                    <Select
                      displayEmpty
                      value={eye}
                      onChange={(e) => setEye(e.target.value as 'Left' | 'Right' | 'Both')}
                      renderValue={(selected) =>
                        selected ? (
                          formatEyeLabel(selected)
                        ) : (
                          <span className="text-gray-500">Select observation target...</span>
                        )
                      }
                    >
                      <MenuItem value="Right">Right Eye (OD)</MenuItem>
                      <MenuItem value="Left">Left Eye (OS)</MenuItem>
                      <MenuItem value="Both">Both Eyes (OU)</MenuItem>
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
                    label={qualityLabel?.text ?? 'No Input'}
                    sx={{
                      height: 24,
                      borderRadius: '999px',
                      bgcolor: qualityLabel?.bg ?? '#EDF2F0',
                      color: qualityLabel?.color ?? '#718096',
                      fontWeight: 700,
                    }}
                  />
                </div>
              </div>
              <Divider />

              <div className="p-5">
                {imagePreview ? (
                  <div className="space-y-3 text-center">
                    <img
                      src={imagePreview}
                      alt="Fundus preview"
                      className="mx-auto max-h-56 rounded-xl border border-[#D5DCE3] object-contain"
                    />
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {selectedImage?.name}
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => fileInputRef.current?.click()}
                      sx={{ textTransform: 'none', fontWeight: 700 }}
                    >
                      Change image
                    </Button>
                  </div>
                ) : (
                  <div
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click();
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragOver(true);
                    }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={handleDrop}
                    className={`cursor-pointer rounded-xl border border-dashed p-8 text-center transition-colors ${
                      isDragOver
                        ? 'border-brand-green bg-[#E8F5EE]'
                        : 'border-[#D5DCE3] bg-[#F9FBFA]'
                    }`}
                  >
                    <div className="mx-auto mb-4 grid size-14 place-items-center rounded-xl bg-[#BDF2C6] text-brand-green">
                      <UploadIcon sx={{ fontSize: 30 }} />
                    </div>
                    <Typography variant="h5" sx={{ fontWeight: 500, mb: 1 }}>
                      Drop retinal fundus image here
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'text.secondary', mb: 2.5 }}>
                      Support for high-resolution TIFF, JPG, or PNG
                      <br />
                      files (max 10MB per file)
                    </Typography>
                    <Button
                      variant="outlined"
                      component="span"
                      sx={{
                        borderColor: '#AFC4B9',
                        color: 'primary.main',
                        fontWeight: 700,
                        textTransform: 'none',
                        borderRadius: '10px',
                        px: 3,
                        pointerEvents: 'none',
                        '&:hover': { borderColor: 'primary.main', backgroundColor: 'transparent' },
                      }}
                    >
                      or click to browse
                    </Button>
                  </div>
                )}
                {fieldErrors.image ? (
                  <FormHelperText error sx={{ mt: 1, mx: 0 }}>
                    {fieldErrors.image}
                  </FormHelperText>
                ) : null}
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
                  disabled={!canAnalyse}
                  endIcon={<ArrowForwardIcon />}
                  onClick={handleSubmit}
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
