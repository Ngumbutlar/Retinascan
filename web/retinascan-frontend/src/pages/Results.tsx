import * as React from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  LinearProgress,
  Typography,
} from '@mui/material';
import {
  Add as AddIcon,
  FiberManualRecord as DotIcon,
  InfoOutlined as InfoIcon,
  PersonOutlined as PersonIcon,
  PictureAsPdfOutlined as PdfIcon,
  RemoveRedEyeOutlined as EyeIcon,
} from '@mui/icons-material';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';
import { Link as RouterLink, Navigate, useLocation, useNavigate } from 'react-router-dom';
import {
  DR_GRADE_LABELS,
  SEVERITY_SCALE_COLORS,
  type ResultsLocationState,
} from '../types/screening';

function formatEyeBadge(eye: string): string {
  const normalized = eye.trim().toLowerCase();
  if (normalized === 'left' || normalized === 'os') return 'OS (LEFT EYE)';
  if (normalized === 'right' || normalized === 'od') return 'OD (RIGHT EYE)';
  if (normalized === 'both' || normalized === 'ou') return 'OU (BOTH EYES)';
  return eye.toUpperCase();
}

function formatEyeCaption(eye: string): string {
  const normalized = eye.trim().toLowerCase();
  if (normalized === 'left' || normalized === 'os') return 'Left Eye (OS)';
  if (normalized === 'right' || normalized === 'od') return 'Right Eye (OD)';
  if (normalized === 'both' || normalized === 'ou') return 'Both Eyes (OU)';
  return eye;
}

function formatSex(sex: string): string {
  if (!sex) return '—';
  const s = sex.trim().toLowerCase();
  if (s === 'male') return 'Male';
  if (s === 'female') return 'Female';
  return sex;
}

function toPercent(value: number): number {
  return value <= 1 ? value * 100 : value;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-[#EDF2F0] py-2.5 last:border-b-0">
      <span className="text-sm text-brand-muted">{label}</span>
      <span className="text-sm font-semibold text-brand-slate">{value}</span>
    </div>
  );
}

export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as ResultsLocationState | null;
  const [scaleReady, setScaleReady] = React.useState(false);

  React.useEffect(() => {
    const timer = requestAnimationFrame(() => setScaleReady(true));
    return () => cancelAnimationFrame(timer);
  }, []);

  if (!state?.result || !state.patient) {
    return <Navigate to="/new-screening" replace />;
  }

  const { record_id, patient, result, recommendation, screened_at, fundus_image_preview } =
    state;
  const { grade, grade_label, confidence, probabilities } = result;
  const accentColor = recommendation.color;
  const screenedDate = dayjs(screened_at);
  const patientIdLabel = patient.hospital_id
    ? `#${patient.hospital_id.replace(/^#/, '')}`
    : '—';
  const confidencePct = toPercent(confidence);

  const handleDownloadPdf = () => {
    toast('PDF download coming soon', { icon: '📄' });
  };

  const handleScreenAnother = () => {
    // replace + null state so Results cannot show stale screening data
    navigate('/new-screening', { replace: true, state: null });
  };

  return (
    <Box className="w-full">
      {/* Page header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Typography
            variant="h4"
            sx={{ fontWeight: 800, lineHeight: 1.15, color: 'primary.main' }}
          >
            {patient.name}
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.75, color: 'text.secondary' }}>
            Patient ID: {patientIdLabel} • {screenedDate.format('MMM D, YYYY')}
          </Typography>
        </div>
        <Chip
          label={formatEyeBadge(patient.eye)}
          variant="outlined"
          sx={{
            alignSelf: { xs: 'flex-start', sm: 'center' },
            height: 32,
            fontWeight: 800,
            letterSpacing: '0.06em',
            fontSize: '0.72rem',
            borderColor: '#C8E6D4',
            color: 'primary.main',
            borderRadius: '8px',
          }}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-6">
        {/* Left column */}
        <div className="space-y-4">
          <Card sx={{ borderRadius: '12px' }}>
            <CardContent className="p-0!">
              <div className="flex items-center gap-2 px-5 py-4">
                <PersonIcon sx={{ color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Patient Information
                </Typography>
              </div>
              <Divider />
              <div className="px-5 py-3">
                <InfoRow label="Name" value={patient.name} />
                <InfoRow label="Age" value={`${patient.age} years`} />
                <InfoRow label="Sex" value={formatSex(patient.sex)} />
                <InfoRow
                  label="Hospital ID"
                  value={patient.hospital_id || '—'}
                />
                <InfoRow label="Eye examined" value={formatEyeCaption(patient.eye)} />
              </div>
            </CardContent>
          </Card>

          <Card
            sx={{
              borderRadius: '12px',
              bgcolor: '#1E293B',
              border: 'none',
              overflow: 'hidden',
            }}
          >
            <CardContent className="relative p-4! sm:p-5!">
              <Chip
                size="small"
                icon={<DotIcon sx={{ color: '#4ADE80 !important', fontSize: '10px !important' }} />}
                label="ENHANCED VIEW"
                sx={{
                  position: 'absolute',
                  top: 16,
                  left: 16,
                  height: 26,
                  bgcolor: 'rgba(15, 23, 42, 0.85)',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '0.65rem',
                  letterSpacing: '0.06em',
                  '& .MuiChip-label': { px: 1 },
                }}
              />

              <div className="flex justify-center py-6">
                <img
                  src={fundus_image_preview}
                  alt={`Fundus scan — ${formatEyeCaption(patient.eye)}`}
                  className="max-h-[280px] w-full max-w-[320px] rounded-full object-cover shadow-lg"
                />
              </div>

              <Chip
                label="Exposure: 1/60s • ISO 400"
                size="small"
                sx={{
                  position: 'absolute',
                  bottom: 16,
                  right: 16,
                  height: 26,
                  bgcolor: 'rgba(0, 0, 0, 0.55)',
                  color: '#fff',
                  fontSize: '0.68rem',
                  fontWeight: 600,
                }}
              />

              <Typography
                variant="body2"
                sx={{ mt: 1, textAlign: 'center', color: '#94A3B8', fontWeight: 600 }}
              >
                {formatEyeCaption(patient.eye)}
              </Typography>
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* AI Diagnostic Result */}
          <Card sx={{ borderRadius: '12px' }}>
            <CardContent className="p-5!">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  AI Diagnostic Result
                </Typography>
                <Chip
                  label={`${confidencePct.toFixed(0)}% Confidence`}
                  size="small"
                  sx={{
                    height: 28,
                    fontWeight: 700,
                    bgcolor: `${accentColor}22`,
                    color: accentColor,
                    border: `1px solid ${accentColor}44`,
                  }}
                />
              </div>

              <div className="flex items-start gap-3">
                <div
                  className="grid size-12 shrink-0 place-items-center rounded-lg"
                  style={{ backgroundColor: `${accentColor}33` }}
                >
                  <EyeIcon sx={{ color: accentColor }} />
                </div>
                <div>
                  <Typography variant="h5" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                    {recommendation.severity || grade_label}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5, color: 'text.secondary' }}>
                    Grade {grade}/4 • {grade_label}
                  </Typography>
                </div>
              </div>

              {/* Large grade badge */}
              <Box
                className="mt-4 rounded-xl px-5 py-4 text-white"
                sx={{ backgroundColor: accentColor }}
              >
                <Typography variant="h3" sx={{ fontWeight: 800, lineHeight: 1 }}>
                  {grade} / 4
                </Typography>
                <Typography variant="subtitle1" sx={{ mt: 0.5, fontWeight: 600, opacity: 0.95 }}>
                  {grade_label}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1.5, opacity: 0.9 }}>
                  Confidence: {confidencePct.toFixed(2)}%
                </Typography>
              </Box>

              {/* Severity scale */}
              <div className="mt-5">
                <div className="mb-1 flex justify-between text-[0.65rem] font-extrabold uppercase tracking-wider text-brand-muted">
                  <span>Healthy</span>
                  <span>Proliferative</span>
                </div>
                <div
                  className={`flex gap-1 ${scaleReady ? 'severity-scale-ready' : ''}`}
                >
                  {DR_GRADE_LABELS.map((label, index) => {
                    const isActive = index === grade;
                    return (
                      <div
                        key={label}
                        className="severity-scale-segment flex-1"
                        style={{ transitionDelay: `${index * 80}ms` }}
                      >
                        <div
                          className="h-3 rounded-sm"
                          style={{
                            backgroundColor: isActive
                              ? accentColor
                              : SEVERITY_SCALE_COLORS[index],
                            opacity: isActive ? 1 : 0.35,
                            outline: isActive ? '2px solid #1A202C' : 'none',
                            outlineOffset: 1,
                          }}
                        />
                        <Typography
                          variant="caption"
                          sx={{
                            display: 'block',
                            mt: 0.75,
                            textAlign: 'center',
                            fontWeight: isActive ? 800 : 500,
                            color: isActive ? 'text.primary' : 'text.secondary',
                            fontSize: '0.68rem',
                          }}
                        >
                          {label === 'Proliferative' ? 'PDR' : label}
                        </Typography>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Confidence breakdown */}
              <div className="mt-6">
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    mb: 2,
                    fontWeight: 800,
                    letterSpacing: '0.1em',
                    color: 'text.secondary',
                  }}
                >
                  CONFIDENCE BREAKDOWN
                </Typography>
                <div className="space-y-3">
                  {DR_GRADE_LABELS.map((label) => {
                    const raw = probabilities[label] ?? 0;
                    const pct = toPercent(raw);
                    const isWinner = label === DR_GRADE_LABELS[grade];
                    return (
                      <div key={label}>
                        <div className="mb-1 flex items-center justify-between">
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: isWinner ? 700 : 500, color: 'text.primary' }}
                          >
                            {label}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 700,
                              color: isWinner ? accentColor : 'text.secondary',
                            }}
                          >
                            {pct.toFixed(1)}%
                          </Typography>
                        </div>
                        <LinearProgress
                          variant="determinate"
                          value={pct}
                          sx={{
                            height: 8,
                            borderRadius: 999,
                            bgcolor: '#EDF2F0',
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 999,
                              bgcolor: isWinner ? accentColor : '#CBD5E0',
                              transition: 'transform 0.8s ease-out',
                            },
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Clinical recommendation */}
          <Card
            sx={{
              borderRadius: '12px',
              border: `1px solid ${accentColor}55`,
              bgcolor: `${accentColor}12`,
            }}
          >
            <CardContent className="p-5!">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <InfoIcon sx={{ color: accentColor }} fontSize="small" />
                <Typography variant="subtitle1" sx={{ fontWeight: 700, flex: 1 }}>
                  Clinical Recommendation
                </Typography>
                <Chip
                  label={recommendation.urgency.toUpperCase()}
                  size="small"
                  sx={{
                    height: 26,
                    fontWeight: 800,
                    letterSpacing: '0.05em',
                    bgcolor: accentColor,
                    color: '#fff',
                    fontSize: '0.7rem',
                  }}
                />
              </div>

              <Typography variant="body1" sx={{ lineHeight: 1.65, color: 'text.primary' }}>
                {recommendation.action}
              </Typography>

              <Typography variant="body2" sx={{ mt: 2, fontWeight: 600, color: 'text.secondary' }}>
                Recommended follow-up: {recommendation.followup}
              </Typography>

              {recommendation.refer && (
                <Typography
                  variant="body2"
                  sx={{
                    mt: 2,
                    fontWeight: 700,
                    color: '#C1121F',
                  }}
                >
                  ⚠ Ophthalmologist referral required
                </Typography>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom actions */}
      <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Button
          variant="contained"
          size="large"
          startIcon={<PdfIcon />}
          onClick={handleDownloadPdf}
          sx={{
            py: 1.4,
            borderRadius: '10px',
            fontWeight: 700,
            textTransform: 'none',
          }}
        >
          Download PDF Report
        </Button>
        <Button
          variant="outlined"
          size="large"
          startIcon={<AddIcon />}
          onClick={handleScreenAnother}
          sx={{
            py: 1.4,
            borderRadius: '10px',
            fontWeight: 700,
            textTransform: 'none',
            borderColor: 'primary.main',
            color: 'primary.main',
          }}
        >
          Screen Another Patient
        </Button>
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Typography variant="caption" sx={{ color: 'text.secondary', letterSpacing: '0.04em' }}>
          Screened on: {screenedDate.format('D MMM YYYY [at] h:mm A')} • Record ID: RS-
          {record_id}
        </Typography>
        <Button
          component={RouterLink}
          to="/dashboard"
          variant="text"
          sx={{
            alignSelf: { xs: 'flex-start', sm: 'center' },
            textTransform: 'none',
            fontWeight: 600,
            color: 'text.secondary',
            minWidth: 0,
            px: 0,
            '&:hover': { backgroundColor: 'transparent', color: 'primary.main' },
          }}
        >
          Back to Dashboard
        </Button>
      </div>

      <footer className="mt-10 flex flex-col gap-3 border-t border-[#E8EDEA] pt-5 text-[0.68rem] font-bold uppercase tracking-wider text-gray-400 md:flex-row md:items-center md:justify-between">
        <p>Verified AI Diagnostic Engine v4.2.1 • Clinical Grade</p>
        <div className="flex items-center gap-6">
          <span className="cursor-pointer hover:text-brand-green">Help Center</span>
          <span className="cursor-pointer hover:text-brand-green">Legal Compliance</span>
        </div>
      </footer>
    </Box>
  );
}
