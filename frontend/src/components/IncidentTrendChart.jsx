import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function IncidentTrendChart({ trend }) {
  const data = {
    labels: trend.map((t) => t.month),
    datasets: [
      {
        label: 'Incidents per month',
        data: trend.map((t) => t.count),
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.15)',
        tension: 0.3,
        fill: true
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false }
    },
    scales: {
      y: { beginAtZero: true, ticks: { precision: 0 } }
    }
  };

  return (
    <div className="panel">
      <h2>Incident Trend (synced records)</h2>
      {trend.length === 0 ? <p className="empty">No synced incidents yet.</p> : <Line data={data} options={options} />}
    </div>
  );
}
