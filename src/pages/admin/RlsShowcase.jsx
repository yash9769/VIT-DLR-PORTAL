import { useState } from 'react'
import { Shield, ShieldAlert, Terminal, Lock, CheckCircle, Database } from 'lucide-react'
import { SectionHeader, Spinner } from '../../components/ui'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'

export default function RlsShowcase() {
  const { demoMode, logSecurityEvent } = useAuth()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [activeTab, setActiveTab] = useState('exploit')
  const [targetId, setTargetId] = useState('00000000-0000-0000-0000-000000000001') // Mock victim ID

  const simulateAttack = async () => {
    setLoading(true)
    setResult(null)
    
    logSecurityEvent('UNAUTHORIZED_ACCESS_ATTEMPT', {
      target_user_id: targetId,
      attack_type: 'IDOR_TEST',
      endpoint: 'users_table_fetch'
    })

    if (demoMode) {
      // Simulate network delay and RLS block in demo mode
      setTimeout(() => {
        setResult({
          status: 200, // PostgREST returns 200 with empty array on RLS fail for SELECT
          data: [],
          error: null,
          message: 'Zero rows returned. Row Level Security successfully blocked the unauthorized SELECT query.'
        })
        setLoading(false)
      }, 800)
      return
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', targetId)
        
      setResult({
        status: error ? 400 : 200,
        data,
        error,
        message: data?.length === 0 
          ? 'Zero rows returned. Row Level Security successfully blocked the query.' 
          : 'Data returned. (If you are an Admin, you are allowed to see this).'
      })
    } catch (err) {
      setResult({ error: err.message })
    } finally {
      setLoading(false)
    }
  }

  const sqlPolicy = `-- 4. Strict RLS on Users table to prevent IDOR
CREATE POLICY "Users view own profile or admin views all" ON public.users
    FOR SELECT
    USING (
        id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.users u2 
            WHERE u2.id = auth.uid() AND u2.role IN ('admin', 'hod')
        )
    );`

  return (
    <div className="space-y-6 animate-fade-in">
      <SectionHeader 
        title="Vulnerability Sandbox: IDOR & RLS" 
        subtitle="Interactive demonstration of Insecure Direct Object Reference (IDOR) prevention using Row Level Security."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Attack Vector */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
            <ShieldAlert className="text-danger w-6 h-6" />
            <div>
              <h3 className="font-semibold text-lg">IDOR Attack Simulator</h3>
              <p className="text-xs text-secondary">Attempt to fetch another user's profile data.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="form-label text-xs">Target UUID (Victim)</label>
              <input 
                type="text" 
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
                className="input-field font-mono text-sm"
              />
              <p className="text-[10px] text-secondary mt-1">
                An attacker changes this ID in the API request to scrape data they shouldn't see.
              </p>
            </div>

            <div className="bg-black/30 p-4 rounded-xl border border-white/5 font-mono text-xs text-white/70">
              <span className="text-brand-400">GET</span> /rest/v1/users?id=eq.{targetId}
              <br/>
              <span className="text-secondary">Host:</span> {demoMode ? 'demo.supabase.co' : 'api.supabase.com'}
              <br/>
              <span className="text-secondary">Authorization:</span> Bearer [YOUR_JWT]
            </div>

            <button 
              onClick={simulateAttack}
              disabled={loading}
              className="w-full btn-primary bg-danger hover:bg-danger/80 border-none h-12 flex items-center justify-center gap-2"
            >
              {loading ? <Spinner /> : <><Terminal className="w-4 h-4" /> Execute Exploit</>}
            </button>
          </div>
        </div>

        {/* Right Column: Defense & Output */}
        <div className="space-y-6">
          <div className="glass-card p-0 overflow-hidden flex flex-col h-full">
            <div className="flex border-b border-white/10">
              <button 
                onClick={() => setActiveTab('exploit')}
                className={`flex-1 p-3 text-xs font-semibold ${activeTab === 'exploit' ? 'bg-white/10 text-white' : 'text-secondary hover:bg-white/5'}`}
              >
                Attack Results
              </button>
              <button 
                onClick={() => setActiveTab('defense')}
                className={`flex-1 p-3 text-xs font-semibold flex items-center justify-center gap-2 ${activeTab === 'defense' ? 'bg-brand-500/20 text-brand-400' : 'text-secondary hover:bg-white/5'}`}
              >
                <Shield className="w-4 h-4" /> View Defense (RLS)
              </button>
            </div>

            <div className="p-6 flex-1 bg-black/20">
              {activeTab === 'exploit' && (
                <div className="h-full flex flex-col">
                  {result ? (
                    <div className="space-y-4 animate-fade-in">
                      <div className={`p-4 rounded-xl border ${result.data?.length === 0 ? 'bg-success/10 border-success/30' : 'bg-warning/10 border-warning/30'}`}>
                        <div className="flex items-center gap-2 mb-2">
                          {result.data?.length === 0 ? <CheckCircle className="text-success w-5 h-5" /> : <AlertTriangle className="text-warning w-5 h-5" />}
                          <span className="font-semibold">{result.data?.length === 0 ? 'Attack Defeated' : 'Request Processed'}</span>
                        </div>
                        <p className="text-sm text-white/80">{result.message}</p>
                      </div>

                      <div>
                        <p className="text-xs text-secondary mb-1">Raw JSON Response:</p>
                        <pre className="bg-black/50 p-4 rounded-xl border border-white/10 font-mono text-xs overflow-x-auto text-brand-300">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-secondary opacity-50">
                      <Terminal className="w-12 h-12 mb-3" />
                      <p className="text-sm">Run the exploit to view network response</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'defense' && (
                <div className="h-full animate-fade-in">
                  <div className="flex items-center gap-2 mb-4">
                    <Database className="w-5 h-5 text-brand-400" />
                    <h4 className="font-semibold">Row Level Security Policy</h4>
                  </div>
                  <p className="text-sm text-white/70 mb-4">
                    Supabase intercepts the query at the database level and appends this policy. Since the JWT does not match the target ID (and the user is not an admin), the database simply returns 0 rows.
                  </p>
                  <pre className="bg-black/50 p-4 rounded-xl border border-brand-500/30 font-mono text-xs overflow-x-auto text-emerald-400">
                    {sqlPolicy}
                  </pre>
                  
                  <div className="mt-4 p-4 bg-brand-500/10 border border-brand-500/20 rounded-xl flex gap-3">
                    <Lock className="w-5 h-5 text-brand-400 shrink-0" />
                    <p className="text-xs text-brand-100/70 leading-relaxed">
                      <strong>Security Note:</strong> IDOR vulnerabilities occur when an application provides direct access to objects based on user-supplied input. By enforcing policies at the database layer (RLS), we neutralize IDOR regardless of backend API flaws.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
