import type { RiskTier } from '../types'

export function useRiskColor(tier: RiskTier) {
  const map: Record<RiskTier, { badge: string; bar: string; glow: string; label: string }> = {
    LOW:      { badge: 'badge-low',      bar: '#10b981', glow: 'rgba(16,185,129,0.2)',  label: 'Low' },
    MEDIUM:   { badge: 'badge-medium',   bar: '#f59e0b', glow: 'rgba(245,158,11,0.2)',  label: 'Medium' },
    HIGH:     { badge: 'badge-high',     bar: '#f97316', glow: 'rgba(249,115,22,0.2)',  label: 'High' },
    CRITICAL: { badge: 'badge-critical', bar: '#ef4444', glow: 'rgba(239,68,68,0.25)',  label: 'Critical' },
  }
  return map[tier] ?? map.LOW
}
