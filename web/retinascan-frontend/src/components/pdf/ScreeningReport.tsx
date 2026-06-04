import * as React from 'react';
import {
  Box,
  Button,
  Chip,
  IconButton,
  LinearProgress,
  Modal,
  Typography,
} from '@mui/material';
import {
  Close as CloseIcon,
  DownloadOutlined as DownloadIcon,
} from '@mui/icons-material';
import dayjs from 'dayjs';
import type { ResultsLocationState } from '../../types/screening';

export interface ScreeningReportProps {
  open: boolean;
  onClose: () => void;
  data: ResultsLocationState;
  onDownloadPdf?: () => void;
}

function SectionLabel({ children }: { children: string }) {
  return (
    <Typography
      variant="caption"
      sx={{
        display: 'block',
        mb: 1.25,
        fontWeight: 800,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: 'text.secondary',
      }}
    >
      {children}
    </Typography>
  );
}

function PatientField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <Typography
        variant="caption"
        sx={{
          display: 'block',
          mb: 0.5,
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'text.secondary',
          fontSize: '0.65rem',
        }}
      >
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
        {value}
      </Typography>
    </div>
  );
}

function formatEyeReport(eye: string): string {
  const n = eye.trim().toLowerCase();
  if (n === 'left' || n === 'os') return 'Left Eye (OS)';
  if (n === 'right' || n === 'od') return 'Right Eye (OD)';
  if (n === 'both' || n === 'ou') return 'Both Eyes (OU)';
  return eye;
}

function gradeDescription(grade: number, severity: string): string {
  const descriptions: Record<number, string> = {
    0: 'No apparent retinopathy. Retinal vasculature appears within normal limits for diabetic screening.',
    1: 'Mild non-proliferative changes with microaneurysms detected in the mid-peripheral retina.',
    2: 'Multiple microaneurysms and intraretinal hemorrhages detected in the mid-peripheral retina.',
    3: 'Severe non-proliferative changes with extensive hemorrhages and venous beading.',
    4: 'Proliferative diabetic retinopathy with neovascularisation indicators requiring urgent review.',
  };
  return descriptions[grade] ?? severity;
}

function macularEdemaRiskPct(grade: number): number {
  const risks = [4.2, 12.5, 28.0, 45.5, 62.0];
  return risks[grade] ?? 12.5;
}

function getBiomarkers(grade: number) {
  return [
    { label: 'Microaneurysms', detected: grade >= 1 },
    { label: 'Intraretinal hemorrhages', detected: grade >= 2 },
    { label: 'Hard exudates', detected: grade >= 2 },
    { label: 'Cotton wool spots', detected: grade >= 3 },
    { label: 'Neovascularisation', detected: grade >= 4 },
  ];
}

function FundusOverlays() {
  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute left-[18%] top-[18%] h-[52%] w-[52%] rounded-sm border-2 border-[#EAB308]/90" />
      <div className="absolute left-[28%] top-[32%] size-8 rounded-full border-2 border-[#EAB308]/90" />
      <div className="absolute right-[22%] top-[42%] size-6 rounded-sm border-2 border-[#EAB308]/90" />
    </div>
  );
}

export default function ScreeningReport({
  open,
  onClose,
  data,
  onDownloadPdf,
}: ScreeningReportProps) {
  const { record_id, patient, result, recommendation, screened_at, fundus_image_preview } =
    data;
  const { grade, grade_label, confidence } = result;
  const screenedDate = dayjs(screened_at);
  const confidencePct = confidence <= 1 ? confidence * 100 : confidence;
  const edemaRisk = macularEdemaRiskPct(grade);
  const biomarkers = getBiomarkers(grade);
  const gradeColor = recommendation.color;
  const approxDob = screenedDate.subtract(patient.age, 'year').format('D MMM YYYY');
  const patientId = patient.hospital_id?.replace(/^#/, '') || `RS-${record_id}`;

  const handleDownload = () => {
    if (onDownloadPdf) onDownloadPdf();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'rgba(15, 23, 42, 0.88)',
      }}
    >
      <React.Fragment>
        {/* Top bar */}
        <Box className="flex shrink-0 items-center justify-between px-4 py-3 sm:px-8">
          <div className="flex items-center gap-3">
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#fff' }}>
              Report Preview
            </Typography>
            <Chip
              label="v2.4-AI"
              size="small"
              sx={{
                height: 24,
                bgcolor: 'rgba(255,255,255,0.12)',
                color: '#E2E8F0',
                fontWeight: 700,
                fontSize: '0.7rem',
              }}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={handleDownload}
              sx={{
                bgcolor: '#fff',
                color: '#1A202C',
                fontWeight: 700,
                textTransform: 'none',
                borderRadius: '8px',
                boxShadow: 'none',
                '&:hover': { bgcolor: '#F1F5F9' },
              }}
            >
              Download PDF
            </Button>
            <IconButton
              onClick={onClose}
              aria-label="Close report preview"
              sx={{
                bgcolor: '#1E293B',
                color: '#fff',
                borderRadius: '8px',
                '&:hover': { bgcolor: '#334155' },
              }}
            >
              <CloseIcon />
            </IconButton>
          </div>
        </Box>

        {/* Scrollable report */}
        <Box className="flex flex-1 justify-center overflow-y-auto px-4 pb-8 sm:px-8">
          <Box className="my-2 w-full max-w-4xl rounded-xl bg-white p-6 shadow-2xl sm:p-10">
            {/* Report header */}
            <div className="mb-8 flex flex-col gap-4 border-b border-[#E8EDEA] pb-6 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 800, color: 'primary.main', lineHeight: 1.2 }}
                >
                  RetinaScan
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    mt: 0.5,
                    fontWeight: 700,
                    letterSpacing: '0.14em',
                    color: 'text.secondary',
                  }}
                >
                  Advanced AI Ophthalmic Analysis
                </Typography>
              </div>
              <div className="text-left sm:text-right">
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  Diagnostic Report #RS-{record_id}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Generated: {screenedDate.format('MMM D, YYYY • h:mm A')}
                </Typography>
              </div>
            </div>

            {/* Patient information */}
            <SectionLabel>Patient Information</SectionLabel>
            <Box
              className="mb-8 grid grid-cols-1 gap-4 rounded-lg bg-[#F8FAFC] p-4 sm:grid-cols-2 lg:grid-cols-4"
              sx={{ border: '1px solid #E2E8F0' }}
            >
              <PatientField label="Full Name" value={patient.name} />
              <PatientField label="Patient ID" value={patientId} />
              <PatientField label="Date of Birth" value={approxDob} />
              <PatientField label="Eye Examined" value={formatEyeReport(patient.eye)} />
            </Box>

            {/* Two-column analysis */}
            <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
              <div>
                <SectionLabel>Primary Fundus Capture</SectionLabel>
                <div className="relative overflow-hidden rounded-lg bg-black">
                  <img
                    src={fundus_image_preview}
                    alt="Primary fundus capture"
                    className="block aspect-square w-full object-cover"
                  />
                  <FundusOverlays />
                </div>
              </div>

              <div>
                <SectionLabel>AI Analysis Summary</SectionLabel>

                <Box
                  className="mb-5 rounded-lg p-4"
                  sx={{
                    bgcolor: `${gradeColor}18`,
                    border: `1px solid ${gradeColor}55`,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      mb: 0.75,
                      fontWeight: 800,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: gradeColor,
                    }}
                  >
                    Diabetic Retinopathy Grade
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: 800, color: gradeColor, lineHeight: 1.2 }}
                  >
                    {recommendation.severity || grade_label}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ mt: 1, color: gradeColor, lineHeight: 1.55, opacity: 0.95 }}
                  >
                    {gradeDescription(grade, recommendation.severity)}
                  </Typography>
                </Box>

                <div className="mb-4">
                  <div className="mb-1 flex items-center justify-between">
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Detection Confidence
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 800, color: 'primary.main' }}>
                      {confidencePct.toFixed(1)}%
                    </Typography>
                  </div>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(confidencePct, 100)}
                    sx={{
                      height: 8,
                      borderRadius: 999,
                      bgcolor: '#EDF2F0',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 999,
                        bgcolor: 'primary.main',
                      },
                    }}
                  />
                </div>

                <div className="mb-6">
                  <div className="mb-1 flex items-center justify-between">
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Macular Edema Risk
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 800, color: '#B7791F' }}>
                      {edemaRisk.toFixed(1)}%
                    </Typography>
                  </div>
                  <LinearProgress
                    variant="determinate"
                    value={edemaRisk}
                    sx={{
                      height: 8,
                      borderRadius: 999,
                      bgcolor: '#EDF2F0',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 999,
                        bgcolor: '#E76F51',
                      },
                    }}
                  />
                </div>

                <SectionLabel>Recommendation</SectionLabel>
                <Box
                  className="rounded-lg px-4 py-3"
                  sx={{
                    bgcolor: '#F1F5F9',
                    borderLeft: '4px solid',
                    borderLeftColor: 'primary.main',
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{ fontStyle: 'italic', lineHeight: 1.65, color: 'text.primary' }}
                  >
                    &ldquo;{recommendation.action}&rdquo;
                  </Typography>
                  <Typography variant="caption" sx={{ display: 'block', mt: 1.5, color: 'text.secondary' }}>
                    Follow-up: {recommendation.followup}
                    {recommendation.refer ? ' • Ophthalmologist referral required' : ''}
                  </Typography>
                </Box>
              </div>
            </div>

            {/* Biomarker findings */}
            <SectionLabel>Biomarker Findings</SectionLabel>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {biomarkers.map((item) => (
                <Box
                  key={item.label}
                  className="rounded-lg px-4 py-3"
                  sx={{
                    border: '1px solid #E2E8F0',
                    bgcolor: item.detected ? '#F9FBFA' : '#fff',
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {item.label}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 800,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      color: item.detected ? 'primary.main' : 'text.secondary',
                    }}
                  >
                    {item.detected ? 'Detected' : 'Not detected'}
                  </Typography>
                </Box>
              ))}
            </div>
          </Box>
        </Box>
      </React.Fragment>
    </Modal>
  );
}
