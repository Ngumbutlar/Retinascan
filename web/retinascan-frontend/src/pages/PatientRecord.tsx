import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import {
  AnalyticsOutlined as AnalysisIcon,
  ArchiveOutlined as ArchiveIcon,
  DashboardOutlined as DashboardIcon,
  DescriptionOutlined as ReportIcon,
  DownloadOutlined as DownloadIcon,
  EditOutlined as EditIcon,
  InfoOutlined as InfoIcon,
  PeopleOutlined as PatientsIcon,
  RemoveRedEyeOutlined as EyeIcon,
  AddAPhotoOutlined as CaptureIcon,
} from '@mui/icons-material';
import { useParams } from 'react-router-dom';

type HistoryRow = {
  date: string;
  time: string;
  eye: string;
  grade: 'Moderate NPDR' | 'Mild NPDR' | 'No Apparent DR';
  confidence: number;
  mode: string;
};

const HISTORY: HistoryRow[] = [
  { date: 'Oct 14, 2023', time: '10:45 AM', eye: 'Right (OD)', grade: 'Moderate NPDR', confidence: 98.2, mode: 'Color Fundus' },
  { date: 'May 22, 2023', time: '02:15 PM', eye: 'Both (OU)', grade: 'Mild NPDR', confidence: 94.8, mode: 'Color Fundus' },
  { date: 'Dec 08, 2022', time: '09:30 AM', eye: 'Left (OS)', grade: 'No Apparent DR', confidence: 99.1, mode: 'Color Fundus' },
];

function gradeChip(grade: HistoryRow['grade']) {
  const base = { height: 24, borderRadius: '999px', fontWeight: 700, fontSize: '0.7rem' };
  if (grade === 'Moderate NPDR') return <Chip label={grade} size="small" sx={{ ...base, bgcolor: '#FFF0D9', color: '#B7791F' }} />;
  if (grade === 'Mild NPDR') return <Chip label={grade} size="small" sx={{ ...base, bgcolor: '#E8F5EE', color: '#2E8B57' }} />;
  return <Chip label={grade} size="small" sx={{ ...base, bgcolor: '#EDF2F0', color: '#1A6B3C' }} />;
}

function NavItem({
  icon,
  label,
  active = false,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-md px-3 py-2 ${active ? 'bg-[#EDF2F0] text-brand-green' : 'text-brand-slate'}`}
    >
      <span className="text-[1.1rem]">{icon}</span>
      <span className={`text-[1.05rem] ${active ? 'font-semibold' : 'font-medium'}`}>{label}</span>
    </div>
  );
}

function ProgressChart() {
  return (
    <div className="relative h-[250px]">
      <div className="absolute inset-0">
        <svg viewBox="0 0 640 250" className="h-full w-full">
          <line x1="50" y1="200" x2="620" y2="200" stroke="#E2E8F0" strokeDasharray="4 5" />
          <line x1="50" y1="150" x2="620" y2="150" stroke="#E2E8F0" strokeDasharray="4 5" />
          <line x1="50" y1="100" x2="620" y2="100" stroke="#E2E8F0" strokeDasharray="4 5" />
          <line x1="50" y1="50" x2="620" y2="50" stroke="#E2E8F0" strokeDasharray="4 5" />

          <polyline
            points="100,165 340,120 580,80"
            fill="none"
            stroke="#1A6B3C"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx="100" cy="165" r="4" fill="#1A6B3C" />
          <circle cx="340" cy="120" r="4" fill="#1A6B3C" />
          <circle cx="580" cy="80" r="4" fill="#1A6B3C" />

          <polyline
            points="100,175 340,165 580,160"
            fill="none"
            stroke="#6B7280"
            strokeWidth="2.5"
            strokeDasharray="4 5"
            strokeLinecap="round"
          />
          <circle cx="100" cy="175" r="3.5" fill="#6B7280" />
          <circle cx="340" cy="165" r="3.5" fill="#6B7280" />
          <circle cx="580" cy="160" r="3.5" fill="#6B7280" />
        </svg>
      </div>

      <div className="pointer-events-none absolute left-0 top-[45px] space-y-[35px] text-[0.72rem] text-gray-500">
        <div>Proliferative</div>
        <div>Severe</div>
        <div>Moderate</div>
        <div>Mild</div>
        <div>No DR</div>
      </div>
      <div className="pointer-events-none absolute bottom-0 left-[70px] right-[40px] flex justify-between text-[0.75rem] text-gray-500">
        <span>Dec 2022</span>
        <span>May 2023</span>
        <span>Oct 2023</span>
      </div>
    </div>
  );
}

export default function PatientRecord() {
  const { id } = useParams<{ id: string }>();

  return (
    <Box className="w-full">
      {/* The main content now takes full width */}
      <div className="grid grid-cols-1 gap-4">
        {/* Main content */}
        <div className="space-y-4">
          <Card sx={{ borderRadius: '12px' }}>
            <CardContent className="flex flex-col gap-4 p-4! md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <Avatar src="/favicon.ico" sx={{ width: 54, height: 54 }} />
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1.1 }}>
                      Elena Rodriguez
                    </Typography>
                    <Chip
                      label={`Patient ID: ${id ?? 'ER-4492'}`}
                      size="small"
                      sx={{ bgcolor: '#FFF7E6', color: '#8B6F22', fontWeight: 700 }}
                    />
                  </div>
                  <Typography variant="body1" sx={{ color: 'text.secondary', mt: 0.5 }}>
                    64 Years Old • Female • O- Positive
                  </Typography>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outlined" startIcon={<EditIcon />} sx={{ textTransform: 'none', fontWeight: 700 }}>
                  Edit Profile
                </Button>
                <Button variant="contained" startIcon={<CaptureIcon />} sx={{ textTransform: 'none', fontWeight: 700 }}>
                  Capture New Image
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[320px_1fr]">
            <Card sx={{ borderRadius: '12px' }}>
              <CardContent className="p-5!">
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                  Clinical Summary
                </Typography>
                {[
                  ['Primary Diagnosis', 'Type 2 Diabetes'],
                  ['Diagnosis Date', 'Mar 2018'],
                  ['Latest HbA1c', '7.2%'],
                  ['Last Screening', 'Oct 14, 2023'],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between border-b border-[#EDF2F0] py-3 text-[1rem]">
                    <span className="text-brand-muted">{k}</span>
                    <span className="font-semibold text-brand-slate">{v}</span>
                  </div>
                ))}

                <Card className="mt-4" sx={{ borderRadius: '10px', bgcolor: '#F5F7F6', border: '1px solid #E2E8F0' }}>
                  <CardContent className="p-3.5!">
                    <div className="mb-2 flex items-center gap-2">
                      <InfoIcon fontSize="small" sx={{ color: 'primary.main' }} />
                      <p className="text-[0.82rem] font-extrabold uppercase tracking-wider text-brand-green">
                        Physician&apos;s Note
                      </p>
                    </div>
                    <p className="text-[0.98rem] leading-relaxed text-brand-slate">
                      Moderate progression in OD observed since May session. Follow-up recommended in 6 months.
                    </p>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>

            <Card sx={{ borderRadius: '12px' }}>
              <CardContent className="p-5!">
                <div className="mb-3 flex items-center justify-between">
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    DR Progression Analysis
                  </Typography>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-sm text-brand-slate">
                      <span className="size-2.5 rounded-full bg-brand-green" />
                      Right Eye (OD)
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-brand-slate">
                      <span className="size-2.5 rounded-full bg-gray-500" />
                      Left Eye (OS)
                    </div>
                  </div>
                </div>
                <ProgressChart />
              </CardContent>
            </Card>
          </div>

          <Card sx={{ borderRadius: '12px' }}>
            <CardContent className="p-0!">
              <div className="flex items-center justify-between border-b border-[#E8EDEA] px-5 py-4">
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  Screening History
                </Typography>
                <Button variant="text" startIcon={<DownloadIcon />} sx={{ textTransform: 'none', fontWeight: 700, color: 'primary.main' }}>
                  Export Full History
                </Button>
              </div>
              <Box sx={{ overflowX: 'auto' }}>
                <Table size="small" sx={{ minWidth: 860 }}>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#F9FBFA' }}>
                      {['Date', 'Eye Examined', 'DR Grade', 'AI Confidence', 'Imaging Mode', 'Actions'].map((col) => (
                        <TableCell key={col} sx={{ fontWeight: 800, letterSpacing: '0.08em', fontSize: '0.68rem', color: 'text.secondary' }}>
                          {col.toUpperCase()}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {HISTORY.map((row) => (
                      <TableRow key={`${row.date}-${row.time}`} hover>
                        <TableCell>
                          <p className="font-semibold text-brand-slate">{row.date}</p>
                          <p className="text-xs text-brand-muted">{row.time}</p>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-brand-slate">
                            <EyeIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                            {row.eye}
                          </div>
                        </TableCell>
                        <TableCell>{gradeChip(row.grade)}</TableCell>
                        <TableCell sx={{ minWidth: 180 }}>
                          <div className="flex items-center gap-2">
                            <LinearProgress
                              variant="determinate"
                              value={row.confidence}
                              sx={{
                                flex: 1,
                                height: 6,
                                borderRadius: 999,
                                bgcolor: '#EDF2F0',
                                '& .MuiLinearProgress-bar': { borderRadius: 999, bgcolor: 'primary.main' },
                              }}
                            />
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>
                              {row.confidence}%
                            </Typography>
                          </div>
                        </TableCell>
                        <TableCell sx={{ color: 'text.secondary' }}>{row.mode}</TableCell>
                        <TableCell>
                          <IconButton size="small" sx={{ color: 'text.secondary' }} aria-label="Report">
                            <ReportIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" sx={{ color: 'text.secondary' }} aria-label="Download">
                            <DownloadIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ borderRadius: '12px', bgcolor: '#273246', color: '#fff' }}>
            <CardContent className="flex flex-col gap-3 p-4! lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-[0.78rem] font-extrabold uppercase tracking-wider text-[#A8B5C8]">
                  Detected Pathologies
                </p>
                <p className="text-[1.9rem] font-semibold">Current Risk Profile</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Chip label="Microaneurysms detected" size="small" sx={{ bgcolor: '#5E6440', color: '#F6E7A2' }} />
                <Chip label="Clear Vitreous" size="small" sx={{ bgcolor: '#2A4A57', color: '#95F0CC' }} />
                <Chip label="Venous Beading" size="small" sx={{ bgcolor: '#5E6440', color: '#F6E7A2' }} />
              </div>
              <Button
                variant="contained"
                sx={{ bgcolor: '#3C4A63', textTransform: 'none', fontWeight: 700, '&:hover': { bgcolor: '#4A5A75' } }}
              >
                View Detailed Scan
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </Box>
  );
}