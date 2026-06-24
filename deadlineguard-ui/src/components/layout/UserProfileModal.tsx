import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, User, Settings, BatteryCharging, Loader2, Lock, Image as ImageIcon, Upload } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchUser, updateUser } from '../../api/client'
import Cropper from 'react-easy-crop'
import { getCroppedImg } from '../../utils/cropImage'

export default function UserProfileModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient()
  const { data: user, isLoading } = useQuery({
    queryKey: ['user-profile'],
    queryFn: () => fetchUser()
  })

  const [form, setForm] = useState({
    name: '',
    energyPattern: 'MORNING',
    password: '',
    confirmPassword: '',
    avatarUrl: ''
  })
  const [error, setError] = useState('')

  // Crop states
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null)

  useEffect(() => {
    if (user) {
      setForm(f => ({
        ...f,
        name: user.name || '',
        energyPattern: user.energyPattern || 'MORNING',
        avatarUrl: user.avatarUrl || ''
      }))
    }
  }, [user])

  const updateMutation = useMutation({
    mutationFn: (data: any) => updateUser(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['user-profile'] })
      alert('Profile updated successfully!')
      onClose()
    },
    onError: (err: any) => {
      console.error("Profile update failed:", err)
      setError(err?.response?.data?.message || err?.message || 'Failed to update profile')
    }
  })

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (form.password && form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    const payload: any = {
      name: form.name,
      energyPattern: form.energyPattern,
      avatarUrl: form.avatarUrl
    }
    
    if (form.password) {
      payload.password = form.password
    }

    updateMutation.mutate(payload)
  }

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setImageSrc(reader.result?.toString() || null)
      setCrop({ x: 0, y: 0 })
      setZoom(1)
    }
    reader.readAsDataURL(file)
  }

  const handleCropComplete = async () => {
    try {
      if (imageSrc && croppedAreaPixels) {
        const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels)
        if (croppedImage) set('avatarUrl', croppedImage)
      }
    } catch (e) {
      console.error(e)
    }
    setImageSrc(null)
  }

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"
         style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
      <div className="glass-card w-full max-w-md animate-slide-in-up">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-2 text-text-primary font-bold">
            <Settings size={18} className="text-violet-400" />
            User Profile
          </div>
          <button onClick={onClose} className="btn-ghost p-1"><X size={18} /></button>
        </div>

        {imageSrc ? (
          <div className="p-5 flex flex-col items-center">
            <h3 className="text-sm font-medium mb-4 text-text-primary">Position and scale your photo</h3>
            <div className="relative w-full h-64 bg-black rounded-xl overflow-hidden mb-4">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onCropComplete={(_, croppedPixels) => setCroppedAreaPixels(croppedPixels)}
                onZoomChange={setZoom}
              />
            </div>
            <div className="w-full flex items-center gap-3 text-xs text-text-secondary">
              Zoom: 
              <input type="range" min={1} max={3} step={0.1} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="flex-1 accent-violet-500" />
            </div>
            <div className="flex gap-3 mt-6 w-full">
              <button type="button" onClick={() => setImageSrc(null)} className="btn-secondary flex-1">Cancel</button>
              <button type="button" onClick={handleCropComplete} className="btn-primary flex-1">Confirm Crop</button>
            </div>
          </div>
        ) : isLoading ? (
          <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-violet-400" /></div>
        ) : (
          <form onSubmit={submit} className="p-5 space-y-4">
            
            {error && (
              <div className="px-3 py-2.5 rounded-lg text-sm text-red-400"
                   style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                {error}
              </div>
            )}

            {/* Email (Read Only) */}
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">Email Address</label>
              <input type="email" className="input opacity-50 cursor-not-allowed" disabled value={user?.email || ''} />
            </div>

            {/* Avatar Upload */}
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5 flex items-center justify-between">
                <span><ImageIcon size={11} className="inline mr-1" /> Profile Picture</span>
                {form.avatarUrl && (
                  <img src={form.avatarUrl} alt="Avatar Preview" className="w-8 h-8 rounded-full object-cover border border-border" />
                )}
              </label>
              <div className="flex gap-2">
                <label className="btn-secondary flex-1 flex items-center justify-center gap-2 cursor-pointer text-sm">
                  <Upload size={14} /> Upload Image
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
                {form.avatarUrl && (
                  <button type="button" onClick={() => set('avatarUrl', '')} 
                    className="btn-ghost px-3 text-red-400 hover:text-red-300" title="Remove image">
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">
                <User size={11} className="inline mr-1" /> Display Name
              </label>
              <input type="text" className="input" required
                value={form.name} onChange={e => set('name', e.target.value)} />
            </div>

            {/* Energy Pattern */}
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">
                <BatteryCharging size={11} className="inline mr-1" /> Peak Energy Pattern
              </label>
              <select className="input" value={form.energyPattern} onChange={e => set('energyPattern', e.target.value)}>
                <option value="MORNING">🌅 Morning</option>
                <option value="AFTERNOON">☀️ Afternoon</option>
                <option value="EVENING">🌆 Evening</option>
                <option value="NIGHT">🌙 Night</option>
              </select>
              <p className="text-xs text-text-muted mt-1.5">
                AI uses this to intelligently schedule your most difficult tasks.
              </p>
            </div>

            {/* Password Reset */}
            <div className="pt-3 border-t border-border">
              <label className="block text-xs font-medium text-text-secondary mb-2">
                <Lock size={11} className="inline mr-1" /> Change Password (Optional)
              </label>
              <div className="space-y-3">
                <input type="password" placeholder="New password" className="input text-sm"
                  value={form.password} onChange={e => set('password', e.target.value)} />
                {form.password && (
                  <input type="password" placeholder="Confirm new password" className="input text-sm" required
                    value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} />
                )}
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-3 pt-3">
              <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
              <button type="submit" disabled={updateMutation.isPending} className="btn-primary flex-1 flex items-center justify-center gap-2">
                {updateMutation.isPending ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body
  )
}
