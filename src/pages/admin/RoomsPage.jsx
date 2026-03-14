import { useState, useEffect } from 'react'
import { Plus, Trash2, Wifi, Monitor } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Modal, toast } from '../../components/ui'

export default function RoomsPage() {
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ room_number: '', building: '', floor: '', capacity: '', has_smartboard: false, has_projector: false })

  useEffect(() => {
    fetchRooms()
  }, [])

  const fetchRooms = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .order('room_number')
      if (error) throw error
      setRooms(data || [])
    } catch (error) {
      toast.error('Failed to fetch rooms')
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async () => {
    try {
      const { error } = await supabase
        .from('rooms')
        .insert([{
          ...form,
          floor: Number(form.floor),
          capacity: Number(form.capacity)
        }])
      if (error) throw error
      toast.success('Room added')
      setShowModal(false)
      setForm({ room_number: '', building: '', floor: '', capacity: '', has_smartboard: false, has_projector: false })
      fetchRooms()
    } catch (error) {
      toast.error('Failed to add room')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this room?')) return
    try {
      const { error } = await supabase
        .from('rooms')
        .delete()
        .eq('id', id)
      if (error) throw error
      toast.success('Room deleted')
      fetchRooms()
    } catch (error) {
      toast.error('Failed to delete room')
    }
  }

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-xl" style={{ color: 'var(--text-primary)' }}>Room Management</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{rooms.length} rooms configured</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" /> Add Room</button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {loading ? (
          <div className="col-span-full py-10 opacity-50 text-center">Loading rooms...</div>
        ) : rooms.length === 0 ? (
          <div className="col-span-full py-10 opacity-50 text-center">No rooms configured</div>
        ) : rooms.map(r => (
          <div key={r.id} className="glass-card p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-display font-bold text-lg" style={{ color: 'var(--text-primary)' }}>{r.room_number}</p>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{r.building} Building, Floor {r.floor}</p>
              </div>
              <button onClick={() => handleDelete(r.id)} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(248,81,73,0.1)' }}><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>
            </div>
            <p className="text-sm mb-3"><span style={{ color: 'var(--text-secondary)' }}>Capacity:</span> <strong>{r.capacity}</strong></p>
            <div className="flex gap-2">
              {r.has_smartboard && <span className="badge badge-approved flex items-center gap-1 text-xs"><Monitor className="w-3 h-3" /> Smartboard</span>}
              {r.has_projector && <span className="badge badge-pending flex items-center gap-1 text-xs"><Wifi className="w-3 h-3" /> Projector</span>}
            </div>
          </div>
        ))}
      </div>
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add Room" size="sm">
        <div className="space-y-4">
          {[['Room Number','room_number'],['Building','building'],['Floor','floor'],['Capacity','capacity']].map(([label,key]) => (
            <div key={key}>
              <label className="form-label">{label}</label>
              <input className="input-field" value={form[key]} onChange={e => setForm(f=>({...f,[key]:e.target.value}))} />
            </div>
          ))}
          <div className="flex gap-4">
            {[['has_smartboard','Smartboard'],['has_projector','Projector']].map(([key,label]) => (
              <label key={key} className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={form[key]} onChange={e => setForm(f=>({...f,[key]:e.target.checked}))} className="w-4 h-4" />
                {label}
              </label>
            ))}
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleAdd} className="btn-primary flex-1">Add</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
