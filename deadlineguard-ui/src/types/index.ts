export type RiskTier = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'MISSED'
export type TaskType = 'GENERAL' | 'EMAIL' | 'DOCUMENT' | 'CODING' | 'STUDY' | 'PRESENTATION'
export type CheckInType = 'MORNING' | 'MIDDAY' | 'EVENING'
export type TriggerReason = 'DEADLINE_APPROACHING' | 'TASK_UNTOUCHED' | 'HIGH_RISK' | 'CRITICAL_ESCALATION'
export type EnergyPattern = 'MORNING' | 'AFTERNOON' | 'EVENING' | 'NIGHT'

export interface User {
  id: number
  name: string
  email: string
  energyPattern: EnergyPattern
  avatarUrl?: string
  completionRate: number
  avgEffortUnderestimate: number
}

export interface Subtask {
  id: number
  title: string
  estimatedMinutes: number
  scheduledSlot: string | null
  completed: boolean
  completedAt: string | null
  orderIndex: number
}

export interface Task {
  id: number
  title: string
  description: string
  deadline: string
  estimatedEffortMinutes: number
  status: TaskStatus
  taskType: TaskType
  importance: number
  riskScore: number
  riskTier: RiskTier
  createdAt: string
  subtasks: Subtask[]
  notes: string | null
  calendarEventId?: string
}

export interface Nudge {
  id: number
  message: string
  triggerReason: TriggerReason
  sentAt: string
  dismissed: boolean
  taskId: number | null
  taskTitle: string | null
}

export interface CheckInResult {
  checkIn: {
    id: number
    type: CheckInType
    transcript: string
    extractedTaskCount: number
    checkinAt: string
  }
  createdTasks: Task[]
}

export interface Insight {
  title: string
  description: string
  icon: string
  percentage: number
}

export interface DraftResult {
  draft: string
  taskTitle: string
  taskType: string
}
