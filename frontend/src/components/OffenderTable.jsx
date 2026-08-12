import { useNavigate } from 'react-router-dom';

const STATUS_LABEL = {
  incarcerated: 'Sentenced',
  community_corrections: 'Community Corrections',
  released: 'Released'
};

export default function OffenderTable({ offenders }) {
  const navigate = useNavigate();

  return (
    <div className="panel">
      <h2>Offender Case Table</h2>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Facility</th>
              <th>Admission Date</th>
              <th>Status</th>
              <th>Next Action</th>
            </tr>
          </thead>
          <tbody>
            {offenders.map((o) => (
              <tr key={o.id} className="row-clickable" onClick={() => navigate(`/offenders/${o.id}`)}>
                <td>{o.name}</td>
                <td>{o.facility_name}</td>
                <td>{new Date(o.admission_date).toLocaleDateString('en-ZA')}</td>
                <td>
                  <span className={`status-pill status-${o.status}`}>{STATUS_LABEL[o.status]}</span>
                </td>
                <td>{o.next_action || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
