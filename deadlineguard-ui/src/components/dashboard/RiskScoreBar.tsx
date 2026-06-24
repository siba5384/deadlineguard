import { useRiskColor } from '../../hooks/useRiskColor'
import type { RiskTier } from '../../types'

interface Props {
  score: number
  tier: RiskTier
  showLabel?: boolean
}

export default function RiskScoreBar({ score, tier, showLabel = true }: Props) {
  const { bar } = useRiskColor(tier)
  const pct = Math.min(Math.max(score, 0), 100)

  return (
    <div className="space-y-1">
      {showLabel && (
        <div className="flex justify-between text-xs text-text-secondary">
          <span>Risk Score</span>
          <span className="font-mono font-semibold" style={{ color: bar }}>{pct.toFixed(0)}</span>
        </div>
      )}
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${pct}%`, background: bar }}
        />
      </div>
    </div>
  )
}
