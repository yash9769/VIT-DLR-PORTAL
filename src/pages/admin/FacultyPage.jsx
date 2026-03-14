import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Search } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Modal, toast } from '../../components/ui'

export default function FacultyPage() {
  const [faculty, setFaculty] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ full_name: '', employee_id: '', department: 'IT', email: '', role: 'faculty' })

  useEffect(() => {
    fetchFaculty()
  }, [])

  const fetchFaculty = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'faculty')
        .order('full_name')
      if (error) throw error
      setFaculty(data || [])
    } catch (error) {
      toast.error('Failed to fetch faculty')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      if (editing) {
        const { error } = await supabase
          .from('users')
          .update(form)
          .eq('id', editing.id)
        if (error) throw error
        toast.success('Faculty updated')
      } else {
        const { error } = await supabase
          .from('users')
          .insert([form])
        if (error) throw error
        toast.success('Faculty added')
      }
      setShowModal(false)
      setEditing(null)
      setForm({ full_name: '', employee_id: '', department: 'IT', email: '', role: 'faculty' })
      fetchFaculty()
    } catch (error) {
      toast.error(editing ? 'Failed to update' : 'Failed to add')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this faculty member?')) return
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id)
      if (error) throw error
      toast.success('Faculty deleted')
      fetchFaculty()
    } catch (error) {
      toast.error('Failed to delete')
    }
  }

  const filtered = faculty.filter(f => 
    f.full_name.toLowerCase().includes(search.toLowerCase()) || 
    f.employee_id?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="font-display font-bold text-xl" style={{ color: 'var(--text-primary)' }}>Faculty Management</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{faculty.length} faculty members</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" /> Add Faculty</button>
      </div>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
        <input className="input-field pl-10 text-sm" placeholder="Search faculty…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <div className="glass-card overflow-hidden">
        <table className="data-table w-full">
          <thead><tr><th>Name</th><th>Employee ID</th><th>Department</th><th>Role</th><th>Actions</th></tr></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center py-10 opacity-50">Loading faculty...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-10 opacity-50">No faculty found</td></tr>
            ) : filtered.map(f => (
              <tr key={f.id}>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white flex-shrink-0" style={{ background: 'linear-gradient(135deg,#4A6CF7,#3355e8)' }}>{f.full_name[0]}</div>
                    <span className="font-medium text-sm">{f.full_name}</span>
                  </div>
                </td>
                <td className="font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>{f.employee_id}</td>
                <td className="text-sm">{f.department}</td>
                <td><span className="badge badge-approved capitalize">{f.role}</span></td>
                <td>
                  <div className="flex gap-1">
                    <button onClick={() => { setEditing(f); setForm(f); setShowModal(true) }} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(74,108,247,0.15)' }}><Edit2 className="w-3.5 h-3.5 text-brand-400" /></button>
                    <button onClick={() => handleDelete(f.id)} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(248,81,73,0.1)' }}><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add Faculty" size="sm">
        <div className="space-y-4">
          {[['Full Name','full_name','text'],['Employee ID','employee_id','text'],['Email','email','email']].map(([label,key,type]) => (
            <div key={key}>
              <label className="form-label">{label}</label>
              <input type={type} className="input-field" value={form[key]} onChange={e => setForm(f=>({...f,[key]:e.target.value}))} />
            </div>
          ))}
          <div className="flex gap-2 pt-2">
            <button onClick={() => { setShowModal(false); setEditing(null) }} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleSave} className="btn-primary flex-1">{editing ? 'Update' : 'Add'}</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
