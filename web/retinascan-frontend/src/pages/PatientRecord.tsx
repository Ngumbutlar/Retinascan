import { useState, useEffect, useMemo } from 'react';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  IconButton,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Skeleton, // Added Skeleton import
} from '@mui/material';
import {
  // AnalyticsOutlined as AnalysisIcon,
  // ArchiveOutlined as ArchiveIcon,
  // DashboardOutlined as DashboardIcon,
  DescriptionOutlined as ReportIcon,
  QueryStatsOutlined as TrendIcon,
  DownloadOutlined as DownloadIcon,
  EditOutlined as EditIcon,
  InfoOutlined as InfoIcon,
  PeopleOutlined as PatientsIcon,
  RemoveRedEyeOutlined as EyeIcon,
  AddAPhotoOutlined as CaptureIcon, // Keep CaptureIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom'; // Added useNavigate import
import dayjs from 'dayjs';
import api from '../services/api';
import { useDownloadPDF } from '../hooks/useDownloadPDF';
import ScreeningReport from '../components/pdf/ScreeningReport';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';

interface PatientScreening {
  id: number;
  patient_name: string;
  patient_age: number;
  patient_sex: string;
  hospital_id: string;
  eye: string;
  grade: number;
  grade_label: string;
  confidence: number;
  recommendation_urgency: string;
  recommendation_color: string;
  refer: boolean;
  facility_name: string;
  screened_at: string;
}

function GradeBadge({ record }: { record: PatientScreening }) {
  const color = record.recommendation_color;
  return (
    <Chip
      label={record.grade_label}
      size="small"
      sx={{
        height: 24,
        fontWeight: 700,
        borderRadius: '999px',
        fontSize: '0.7rem',
        bgcolor: `${color}15`,
        color: color,
        border: `1px solid ${color}30`,
      }}
    />
  );
}

function MiniSummaryCard({ icon, label, value, subValue }: { icon: React.ReactNode; label: string; value: React.ReactNode; subValue?: React.ReactNode }) {
  return (
    <Card variant="outlined" sx={{ borderRadius: '10px', bgcolor: '#F9FBFA', border: '1px solid #E2E8F0' }}>
      <CardContent className="p-4!">
        <div className="flex items-center gap-3">
          <div className="grid size-9 place-items-center rounded-md bg-[#EDF2F0] text-brand-green">
            {icon}
          </div>
          <div className="flex-1">
            <p className="text-[0.62rem] font-extrabold uppercase tracking-wider text-brand-muted">
              {label}
            </p>
            <div className="flex items-end justify-between gap-1">
              <div className="text-[1.2rem] font-bold text-brand-slate leading-tight">{value}</div>
              {subValue && <div className="leading-tight">{subValue}</div>}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
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

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <Box sx={{ bgcolor: 'white', p: 1.5, border: '1px solid #E2E8F0', borderRadius: '8px', boxShadow: 2 }}>
        <Typography variant="caption" sx={{ fontWeight: 800, display: 'block', mb: 0.5 }}>{label}</Typography>
        <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', color: 'text.secondary' }}>
          Result: {data.grade_label}
        </Typography>
        <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main', display: 'block' }}>
          AI Confidence: {Math.round(data.confidence > 1 ? data.confidence : data.confidence * 100)}%
        </Typography>
      </Box>
    );
  }
  return null;
};

function ProgressChart({ data }: { data: any[] }) {
  const gradeLabels: Record<number, string> = {
    0: 'No DR',
    1: 'Mild',
    2: 'Moderate',
    3: 'Severe',
    4: 'Prolif.'
  };

  return (
    <div className="relative h-[280px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 40, left: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#718096', fontSize: 11, fontWeight: 600 }}
            dy={10}
          />
          <YAxis 
            domain={[0, 4]} 
            ticks={[0, 1, 2, 3, 4]} 
            axisLine={false} 
            tickLine={false}
            tick={{ fill: '#718096', fontSize: 10, fontWeight: 700 }}
            tickFormatter={(val) => gradeLabels[val]}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine 
            y={2} 
            stroke="#ED8936" 
            strokeDasharray="4 4" 
            label={{ value: 'Refer threshold', position: 'insideTopRight', fill: '#ED8936', fontSize: 10, fontWeight: 700 }} 
          />
          <ReferenceLine 
            y={3} 
            stroke="#E53E3E" 
            strokeDasharray="4 4" 
            label={{ value: 'Urgent', position: 'insideTopRight', fill: '#E53E3E', fontSize: 10, fontWeight: 700 }} 
          />
          <Line 
            type="monotone" 
            dataKey="grade" 
            stroke="#1A6B3C" 
            strokeWidth={3} 
            dot={{ r: 5, fill: '#1A6B3C', strokeWidth: 2, stroke: '#fff' }} 
            activeDot={{ r: 7, strokeWidth: 0 }} 
            animationDuration={1500}
          />
        </LineChart>
      </ResponsiveContainer>
      {data.length === 1 && (
        <Box className="absolute inset-0 flex items-center justify-center bg-white/40 pointer-events-none">
          <Typography variant="body2" sx={{ bgcolor: 'white', px: 2, py: 1, borderRadius: '8px', border: '1px solid #E2E8F0', fontStyle: 'italic', color: 'text.secondary', fontWeight: 600, boxShadow: 1 }}>
            Screen this patient again to track progression over time
          </Typography>
        </Box>
      )}
    </div>
  );
}

export default function PatientRecord() {
  const { recordId } = useParams<{ recordId: string }>(); // Changed to recordId
  const navigate = useNavigate(); // Added useNavigate
  
  const [records, setRecords] = useState<PatientScreening[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [patientName, setPatientName] = useState(''); // State to store patient name
  
  const [selectedRecordIdForPreview, setSelectedRecordIdForPreview] = useState<number | null>(null); // Renamed for clarity
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  const { downloadPDF } = useDownloadPDF();

  useEffect(() => {
    const fetchHistory = async () => {
      if (!recordId) {
        setError('Record ID is missing.');
        setLoading(false);
        navigate('/records', { replace: true }); // Redirect to records page
        return;
      }

      setLoading(true);
      try {
        // First, fetch the specific record to get the patient name
        const singleRecordResponse = await api.get(`/api/records/${recordId}`);
        const patientNameFromRecord = singleRecordResponse.data.patient_name;
        setPatientName(patientNameFromRecord);

        // Then, use that patient_name to fetch all their screenings
        const allRecordsResponse = await api.get(`/api/records/patient/${encodeURIComponent(patientNameFromRecord)}`);
        setRecords(allRecordsResponse.data.records);
      } catch (err) {
        setError('Failed to load patient history. Please check your connection or if the record exists.');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [recordId, navigate]); // Added recordId and navigate to dependencies

  const chartData = useMemo(() => records.map(r => ({
    date: dayjs(r.screened_at).format('D MMM'),
    grade: r.grade,
    grade_label: r.grade_label,
    confidence: r.confidence,
    eye: r.eye
  })), [records]);

  const latest = records.length > 0 ? records[records.length - 1] : null; // Handle case where records might be empty
  const prev = records[records.length - 2];

  const trend = useMemo(() => {
    if (records.length <= 1) return { text: '— First screening', color: '#718096' };
    if (latest.grade < prev.grade) return { text: '↓ Improving', color: '#1A6B3C' };
    if (latest.grade > prev.grade) return { text: '↑ Worsening', color: '#C1121F' };
    return { text: '→ Stable', color: '#718096' };
  }, [records, latest, prev]);

  const handleOpenPreview = (id: number | null) => { // Changed type to allow null
    setSelectedRecordIdForPreview(id);
    setIsPreviewOpen(true);
  };

  return (
    <Box className="w-full pb-20"> {/* Added pb-20 for consistent padding */}
      <ScreeningReport
        open={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        recordId={selectedRecordIdForPreview}
      />

      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-4">
          <Card sx={{ borderRadius: '12px' }}>
            <CardContent className="flex flex-col gap-4 p-4! md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <Avatar src="/favicon.ico" sx={{ width: 54, height: 54 }} />
                <div>
                  <div className="flex flex-wrap items-center gap-2"> 
                    <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1.1 }}> 
                      {patientName || (loading ? 'Loading Patient...' : 'N/A')} {/* Display patientName from state */}
                    </Typography>
                    <Chip
                      label={`Record ID: ${recordId || (loading ? '...' : 'N/A')}`} // Display recordId from URL
                      size="small"
                      sx={{ bgcolor: '#FFF7E6', color: '#8B6F22', fontWeight: 700 }}
                    />
                  </div>
                  <Typography variant="body1" sx={{ color: 'text.secondary', mt: 0.5 }}>
                    {latest ? `${latest.patient_age} Years Old • ${latest.patient_sex}` : 'Loading profile...'}
                  </Typography>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 md:mt-0 mt-2">
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
                  ['Last Screening', latest ? dayjs(latest.screened_at).format('MMM D, YYYY') : (loading ? '...' : '—')], // Handle loading state
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

                <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <MiniSummaryCard 
                    icon={<PatientsIcon fontSize="small" />} 
                    label="Total Screenings" 
                    value={loading ? '...' : records.length} 
                  />
                  <MiniSummaryCard 
                    icon={<EyeIcon fontSize="small" />} 
                    label="Latest Grade" 
                    value={loading ? '...' : (latest ? <GradeBadge record={latest} /> : 'N/A')} // Handle null latest
                  />
                  <MiniSummaryCard 
                    icon={<TrendIcon fontSize="small" />} 
                    label="Trend" 
                    value={loading ? '...' : trend.text.replace(/^[↓↑→—]\s*/, '')}
                    subValue={!loading && (
                      <Typography variant="caption" sx={{ color: trend.color, fontWeight: 800, fontSize: '0.65rem' }}>
                        {trend.text}
                      </Typography>
                    )}
                  />
                </div>

                {loading ? (
                  <Box sx={{ height: 280, display: 'grid', placeItems: 'center' }}>
                    <CircularProgress size={30} />
                  </Box>
                ) : error ? (
                  <Typography color="error" sx={{ textAlign: 'center', py: 5 }}>{error}</Typography>
                ) : records.length === 0 ? (
                  <Typography sx={{ textAlign: 'center', py: 5, color: 'text.secondary' }}>No screening data available for this patient.</Typography>
                ) : <ProgressChart data={chartData} />}
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
                    {loading ? (
                      [...Array(3)].map((_, i) => ( // Show 3 skeleton rows
                        <TableRow key={i}>
                          {[...Array(6)].map((_, j) => ( // 6 columns
                            <TableCell key={j}><Skeleton variant="text" /></TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : error ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                          <Typography color="error">{error}</Typography>
                        </TableCell>
                      </TableRow>
                    ) : records.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 10 }}>
                          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 2 }}>
                            No screening records found for this patient.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      records.map((row) => (
                      <TableRow key={row.id} hover>
                        <TableCell>
                          <p className="font-semibold text-brand-slate">{dayjs(row.screened_at).format('MMM D, YYYY')}</p>
                          <p className="text-xs text-brand-muted">{dayjs(row.screened_at).format('h:mm A')}</p>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-brand-slate">
                            <EyeIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                            {row.eye}
                          </div>
                        </TableCell>
                        <TableCell><GradeBadge record={row} /></TableCell>
                        <TableCell sx={{ minWidth: 180 }}>
                          <div className="flex items-center gap-2">
                            <LinearProgress
                              variant="determinate"
                              value={row.confidence > 1 ? row.confidence : row.confidence * 100}
                              sx={{
                                flex: 1,
                                height: 6,
                                borderRadius: 999,
                                bgcolor: '#EDF2F0',
                                '& .MuiLinearProgress-bar': { borderRadius: 999, bgcolor: row.recommendation_color },
                              }}
                            />
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>
                              {Math.round(row.confidence > 1 ? row.confidence : row.confidence * 100)}%
                            </Typography>
                          </div>
                        </TableCell>
                        <TableCell sx={{ color: 'text.secondary' }}>Color Fundus</TableCell>
                        <TableCell>
                          <IconButton size="small" sx={{ color: 'primary.main' }} aria-label="Report" onClick={() => handleOpenPreview(row.id)}>
                            <ReportIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" sx={{ color: 'text.secondary' }} aria-label="Download" onClick={() => downloadPDF(row.id)}>
                            <DownloadIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    )))}
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