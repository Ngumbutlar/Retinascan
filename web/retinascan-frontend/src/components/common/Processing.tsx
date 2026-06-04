import * as React from 'react';
import {
  Box,
  Fade,
  Modal,
  Typography,
} from '@mui/material';
import CheckCircleOutlined from '@mui/icons-material/CheckCircleOutlined';
import DescriptionOutlined from '@mui/icons-material/DescriptionOutlined';
import RemoveRedEyeOutlined from '@mui/icons-material/RemoveRedEyeOutlined';
import ShieldOutlined from '@mui/icons-material/ShieldOutlined';
import type { ScreeningResult } from '../../types/screening';
import borderImage from '../../assets/Border.png';

const STAGE_DURATION_MS = 1500;
const COMPLETE_DELAY_MS = 1000;

const STEP_LABELS = [
  'Preprocessing image',
  'Running AI analysis',
  'Generating report',
] as const;

export interface ProcessingProps {
  isOpen: boolean;
  patientName: string;
  eye: string;
  imagePreview?: string | null;
  onAnalyse: () => Promise<ScreeningResult>;
  onComplete: (result: ScreeningResult) => void;
  onError: (error: string) => void;
}

type StepStatus = 'completed' | 'active' | 'pending';

function getStepStatus(stepIndex: number, currentStage: number): StepStatus {
  if (currentStage > stepIndex) return 'completed';
  if (currentStage === stepIndex) return 'active';
  return 'pending';
}

function StepIcon({ status }: { status: StepStatus }) {
  if (status === 'completed') {
    return (
      <div className="grid size-7 shrink-0 place-items-center rounded-full bg-brand-green text-white">
        <CheckCircleOutlined sx={{ fontSize: 18 }} />
      </div>
    );
  }

  if (status === 'active') {
    return (
      <div className="grid size-7 shrink-0 place-items-center rounded-full border-2 border-brand-green">
        <span className="size-2.5 rounded-full bg-brand-green" />
      </div>
    );
  }

  return (
    <div className="grid size-7 shrink-0 place-items-center rounded-full bg-[#EDF2F0] text-[#A0AEC0]">
      <DescriptionOutlined sx={{ fontSize: 16 }} />
    </div>
  );
}

function StepStatusIndicator({ status }: { status: StepStatus }) {
  if (status === 'completed') {
    return (
      <span className="text-[0.68rem] font-extrabold uppercase tracking-wider text-brand-green">
        Success
      </span>
    );
  }

  if (status === 'active') {
    return (
      <div className="h-1.5 w-28 overflow-hidden rounded-full bg-[#E2E8F0]">
        <div className="animate-analysis-progress h-full rounded-full bg-brand-green" />
      </div>
    );
  }

  return (
    <span className="text-[0.68rem] font-extrabold uppercase tracking-wider text-[#A0AEC0]">
      Waiting
    </span>
  );
}

function ProgressStepRow({
  label,
  stepIndex,
  stage,
}: {
  label: string;
  stepIndex: number;
  stage: number;
}) {
  const status = getStepStatus(stepIndex, stage);

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3.5 ${
        stepIndex < STEP_LABELS.length - 1 ? 'border-b border-[#E8EDEA]' : ''
      }`}
    >
      <StepIcon status={status} />
      <Typography
        variant="body2"
        sx={{
          flex: 1,
          fontWeight: status === 'pending' ? 500 : 600,
          color: status === 'pending' ? 'text.secondary' : 'text.primary',
        }}
      >
        {label}
      </Typography>
      <StepStatusIndicator status={status} />
    </div>
  );
}

export default function Processing({
  isOpen,
  patientName,
  eye,
  imagePreview,
  onAnalyse,
  onComplete,
  onError,
}: ProcessingProps) {
  const [stage, setStage] = React.useState(0);

  const onAnalyseRef = React.useRef(onAnalyse);
  const onCompleteRef = React.useRef(onComplete);
  const onErrorRef = React.useRef(onError);

  onAnalyseRef.current = onAnalyse;
  onCompleteRef.current = onComplete;
  onErrorRef.current = onError;

  React.useEffect(() => {
    if (!isOpen) {
      setStage(0);
      return;
    }

    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];

    setStage(0);

    const stage1Timer = setTimeout(async () => {
      if (cancelled) return;
      setStage(1);

      try {
        const result = await onAnalyseRef.current();
        if (cancelled) return;

        setStage(2);

        const completeTimer = setTimeout(() => {
          if (cancelled) return;
          onCompleteRef.current(result);
        }, COMPLETE_DELAY_MS);
        timers.push(completeTimer);
      } catch (err) {
        if (cancelled) return;
        const message =
          err instanceof Error
            ? err.message
            : 'Analysis failed. Please try again.';
        onErrorRef.current(message);
      }
    }, STAGE_DURATION_MS);
    timers.push(stage1Timer);

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [isOpen]);

  const previewSrc = imagePreview ?? borderImage;

  return (
    <Modal
      open={isOpen}
      onClose={() => {}}
      closeAfterTransition
      slotProps={{
        backdrop: {
          className: 'bg-black/50',
        },
      }}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Fade in={isOpen}>
        <Box
          className="flex w-full max-w-xl flex-col items-center rounded-2xl bg-white p-8 shadow-2xl outline-none sm:p-10"
          role="dialog"
          aria-modal="true"
          aria-labelledby="processing-title"
          aria-describedby="processing-subtitle"
          aria-live="polite"
        >
          <span className="sr-only">
            Analysing {patientName}, {eye}
          </span>

          <div className="relative mb-6">
            <div className="animate-retina-pulse animate-retina-ripple overflow-hidden rounded-2xl shadow-[0_8px_32px_rgba(26,107,60,0.18)]">
              <img
                src={previewSrc}
                alt="Retinal fundus scan"
                className="block h-44 w-44 object-cover sm:h-48 sm:w-48"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 grid size-9 place-items-center rounded-xl bg-brand-green text-white shadow-md">
              <RemoveRedEyeOutlined sx={{ fontSize: 18 }} />
            </div>
          </div>

          <Typography
            id="processing-title"
            variant="h4"
            sx={{ fontWeight: 800, lineHeight: 1.2, color: 'text.primary', textAlign: 'center' }}
          >
            Analyzing Retina Data
          </Typography>

          <Typography
            id="processing-subtitle"
            variant="body1"
            sx={{ mt: 1, color: 'text.secondary', textAlign: 'center' }}
          >
            Usually takes 3–5 seconds.
          </Typography>

          <div className="mt-8 w-full overflow-hidden rounded-xl border border-[#E2E8F0] bg-[#F9FBFA]">
            {STEP_LABELS.map((label, index) => (
              <ProgressStepRow
                key={label}
                label={label}
                stepIndex={index}
                stage={stage}
              />
            ))}
          </div>

          <div className="mt-10 flex items-center justify-center gap-1.5 text-[#A0AEC0]">
            <ShieldOutlined sx={{ fontSize: 14 }} />
            <Typography variant="caption" sx={{ color: 'inherit', letterSpacing: '0.02em' }}>
              Secured by HIPAA-compliant Clinical Cloud
            </Typography>
          </div>
        </Box>
      </Fade>
    </Modal>
  );
}
