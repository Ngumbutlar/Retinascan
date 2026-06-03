import * as React from 'react';
import {
  Box,
  CircularProgress,
  Fade,
  Modal,
  Typography,
} from '@mui/material';
import CheckCircleOutlined from '@mui/icons-material/CheckCircleOutlined';
import RemoveRedEyeOutlined from '@mui/icons-material/RemoveRedEyeOutlined';
import ShieldOutlined from '@mui/icons-material/ShieldOutlined';
import type { ScreeningResult } from '../../types/screening';
import borderImage from '../../assets/Border.png';

const STAGE_DURATION_MS = 1500;
const COMPLETE_DELAY_MS = 1000;

const STAGES = [
  {
    title: 'Preprocessing image...',
    subtext: 'Applying contrast enhancement',
  },
  {
    title: 'Running AI analysis...',
    subtext: 'Classifying retinal features',
  },
  {
    title: 'Preparing your results...',
    subtext: 'Almost done',
  },
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

function StageIcon({ stage }: { stage: number }) {
  if (stage === 0) {
    return (
      <CircularProgress
        size={48}
        thickness={4}
        sx={{ color: '#1A6B3C' }}
      />
    );
  }

  if (stage === 1) {
    return (
      <div className="animate-pulse">
        <RemoveRedEyeOutlined sx={{ fontSize: 48, color: '#1A6B3C' }} />
      </div>
    );
  }

  return (
    <CheckCircleOutlined
      className="animate-check-pop"
      sx={{ fontSize: 52, color: '#1A6B3C' }}
    />
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
  const { title, subtext } = STAGES[stage];

  return (
    <Modal
      open={isOpen}
      onClose={() => {}}
      closeAfterTransition
      slotProps={{
        backdrop: {
          className: 'bg-black/60',
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
          className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl outline-none"
          role="dialog"
          aria-modal="true"
          aria-labelledby="processing-title"
          aria-live="polite"
        >
          <Typography
            id="processing-title"
            variant="body2"
            sx={{
              mb: 3,
              textAlign: 'center',
              fontWeight: 600,
              color: 'text.secondary',
            }}
          >
            Analysing: {patientName} — {eye}
          </Typography>

          <div className="mx-auto mb-6 flex justify-center">
            <div className="relative">
              <div className="animate-retina-pulse animate-retina-ripple overflow-hidden rounded-2xl">
                <img
                  src={previewSrc}
                  alt="Retinal fundus scan"
                  className="block h-44 w-44 object-cover sm:h-48 sm:w-48"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 grid size-8 place-items-center rounded-lg bg-brand-green text-white shadow-md">
                <RemoveRedEyeOutlined sx={{ fontSize: 16 }} />
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center text-center">
            <StageIcon stage={stage} />

            <Typography
              variant="h6"
              sx={{ mt: 2.5, fontWeight: 700, color: 'text.primary' }}
            >
              {title}
            </Typography>

            <Typography
              variant="body2"
              sx={{ mt: 0.75, color: 'text.secondary' }}
            >
              {subtext}
            </Typography>
          </div>

          <div className="mt-8 flex justify-center gap-2">
            {STAGES.map((_, index) => (
              <span
                key={index}
                className={`size-2 rounded-full transition-colors duration-300 ${
                  index === stage ? 'bg-brand-green' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          <div className="mt-6 flex items-center justify-center gap-1.5 text-gray-400">
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
