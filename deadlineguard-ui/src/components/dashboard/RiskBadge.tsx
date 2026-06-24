import type { RiskTier } from '../../types'
import { useRiskColor } from '../../hooks/useRiskColor'

export default function RiskBadge({ tier }: { tier: RiskTier }) {
  const { badge, label } = useRiskColor(tier)
  return <span className={badge}>{label}</span>
}
