import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Modal, toast } from '../../components/ui'

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ subject_code: '', subject_name: '', short_name: '', semester: '', credits: '' })

  useEffect(() => {
    fetchSubjects()
  }, [])

  const fetchSubjects = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('semester', { ascending: true })
        .order('subject_code', { ascending: true })
      if (error) throw error
      setSubjects(data || [])
    } catch (error) {
      toast.error('Failed to fetch subjects')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      const payload = {
        ...form,
        semester: Number(form.semester),
        credits: Number(form.credits)
      }
      if (editing) {
        const { error } = await supabase
          .from('subjects')
          .update(payload)
          .eq('id', editing.id)
        if (error) throw error
        toast.success('Subject updated')
      } else {
        const { error } = await supabase
          .from('subjects')
          .insert([payload])
        if (error) throw error
        toast.success('Subject added')
      }
      setShowModal(false)
      setEditing(null)
      setForm({ subject_code: '', subject_name: '', short_name: '', semester: '', credits: '' })
      fetchSubjects()
    } catch (error) {
      toast.error(editing ? 'Failed to update' : 'Failed to add')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this subject?')) return
    try {
      const { error } = await supabase
        .from('subjects')
        .delete()
        .eq('id', id)
      if (error) throw error
      toast.success('Subject deleted')
      fetchSubjects()
    } catch (error) {
      toast.error('Failed to delete subject')
    }
  }

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-xl" style={{ color: 'var(--text-primary)' }}>Subjects</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{subjects.length} subjects configured</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" /> Add Subject</button>
      </div>
      <div className="glass-card overflow-hidden">
        <table className="data-table w-full">
          <thead><tr><th>Code</th><th>Name</th><th>Short</th><th>Semester</th><th>Actions</th></tr></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center py-10 opacity-50">Loading subjects...</td></tr>
            ) : subjects.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-10 opacity-50">No subjects configured</td></tr>
            ) : subjects.map(s => (
              <tr key={s.id}>
                <td className="font-mono text-xs font-semibold" style={{ color: '#7090ff' }}>{s.subject_code}</td>
                <td className="text-sm font-medium">{s.subject_name}</td>
                <td><span className="badge badge-locked">{s.short_name}</span></td>
                <td className="text-sm">Sem {s.semester}</td>
                <td>
                  <div className="flex gap-1">
                    <button onClick={() => { setEditing(s); setForm(s); setShowModal(true) }} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(74,108,247,0.15)' }}><Edit2 className="w-3.5 h-3.5 text-brand-400" /></button>
                    <button onClick={() => handleDelete(s.id)} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(248,81,73,0.1)' }}><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add Subject" size="sm">
        <div className="space-y-4">
          {[['Code','subject_code'],['Name','subject_name'],['Short Name','short_name'],['Semester','semester'],['Credits','credits']].map(([label,key]) => (
            <div key={key}>
              <label className="form-label">{label}</label>
              <input className="input-field" value={form[key]} onChange={e => setForm(f=>({...f,[key]:e.target.value}))} />
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
