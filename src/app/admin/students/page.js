'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { formatDate } from '@/lib/utils';
import { debounce } from '@/lib/utils';

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    const supabase = createClient();
    let query = supabase.from('profiles').select('*').eq('role', 'student').order('created_at', { ascending: false });
    const { data } = await query;
    setStudents(data || []);
    setLoading(false);
  }

  if (loading) return <div className="page-loader"><div className="spinner spinner-lg"></div></div>;

  const filtered = students.filter(s =>
    (s.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.phone || '').includes(search)
  );

  return (
    <div className="fade-in">
      <div className="page-header">
        <div><h1>Students ({students.length})</h1><p>View and manage all registered students</p></div>
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input className="input" placeholder="Search by name, email, phone..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card empty-state"><div className="empty-icon">👥</div><h3>No Students Found</h3></div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead><tr><th>Student</th><th>Phone</th><th>City</th><th>Gender</th><th>Joined</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id}>
                  <td>
                    <div className="flex items-center gap-sm">
                      <div className="avatar" style={{width:'32px',height:'32px',fontSize:'0.7rem'}}>{s.full_name?.[0]?.toUpperCase() || '?'}</div>
                      <div>
                        <strong>{s.full_name || '—'}</strong>
                        <div style={{fontSize:'0.78rem',color:'var(--text-muted)'}}>{s.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>{s.phone || '—'}</td>
                  <td>{s.city || '—'}</td>
                  <td style={{textTransform:'capitalize'}}>{s.gender || '—'}</td>
                  <td>{formatDate(s.created_at)}</td>
                  <td><Link href={`/admin/students/${s.id}`} className="btn btn-ghost btn-sm">View →</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
