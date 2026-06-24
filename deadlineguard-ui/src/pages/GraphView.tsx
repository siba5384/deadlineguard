import { useCallback, useEffect } from 'react'
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useQuery } from '@tanstack/react-query'
import { fetchAllTasks } from '../api/client'
import { useAppStore } from '../store/appStore'
import TopBar from '../components/layout/TopBar'
import type { Task } from '../types'

export default function GraphView() {
  const userId = useAppStore(s => s.userId)
  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ['tasks-all', userId],
    queryFn: () => fetchAllTasks(userId || 1),
    enabled: !!userId,
  })

  // Generate nodes and edges dynamically based on data
  const generateGraph = () => {
    const newNodes = tasks.map((t, i) => ({
      id: `task-${t.id}`,
      position: { x: (i % 4) * 280 + Math.random() * 50, y: Math.floor(i / 4) * 180 + Math.random() * 50 },
      data: { 
        label: (
          <div className="p-3 w-56 bg-bg-card border-l-4 rounded-lg shadow-2xl text-left" style={{ borderLeftColor: t.riskTier === 'CRITICAL' ? '#ef4444' : t.riskTier === 'HIGH' ? '#f97316' : '#8b5cf6' }}>
            <div className="text-sm font-bold text-text-primary truncate">{t.title}</div>
            <div className="text-xs text-text-muted mt-2 flex justify-between items-center">
              <span className="px-2 py-0.5 rounded bg-bg-surface border border-border">{t.taskType}</span>
              <span className={t.riskTier === 'CRITICAL' ? 'text-red-400 font-bold animate-pulse' : ''}>{t.riskTier}</span>
            </div>
          </div>
        )
      },
      style: { background: 'transparent', border: 'none', padding: 0 }
    }))

    const newEdges: any[] = []
    // Link tasks of same type to simulate a knowledge graph cascade
    for (let i = 0; i < tasks.length; i++) {
      let linkedCount = 0
      for (let j = i + 1; j < tasks.length; j++) {
        if (tasks[i].taskType === tasks[j].taskType && linkedCount < 2) {
          const isCritical = tasks[i].riskTier === 'CRITICAL' || tasks[j].riskTier === 'CRITICAL'
          newEdges.push({
            id: `e-${tasks[i].id}-${tasks[j].id}`,
            source: `task-${tasks[i].id}`,
            target: `task-${tasks[j].id}`,
            animated: isCritical,
            style: { stroke: isCritical ? '#ef4444' : '#4b5563', strokeWidth: isCritical ? 3 : 1.5 },
            markerEnd: { type: MarkerType.ArrowClosed, color: isCritical ? '#ef4444' : '#4b5563' }
          })
          linkedCount++
        }
      }
    }
    return { newNodes, newEdges }
  }

  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])

  useEffect(() => {
    if (tasks.length > 0) {
      const { newNodes, newEdges } = generateGraph()
      setNodes(newNodes as any)
      setEdges(newEdges as any)
    }
  }, [tasks])

  return (
    <div className="flex-1 flex flex-col h-full bg-bg-base overflow-hidden">
      <TopBar title="Knowledge Graph" subtitle="Visualize your task risk cascade" />
      <div className="flex-1 relative">
         <ReactFlow
           nodes={nodes}
           edges={edges}
           onNodesChange={onNodesChange}
           onEdgesChange={onEdgesChange}
           fitView
           className="bg-bg-base"
         >
           <Background color="#30363d" gap={20} />
           <Controls className="bg-bg-card border-border fill-text-primary" />
           <MiniMap 
             nodeColor={(n: any) => n.data.label?.props?.style?.borderLeftColor || '#8b5cf6'} 
             maskColor="rgba(0,0,0,0.4)" 
             className="bg-bg-surface border border-border rounded-xl shadow-xl overflow-hidden" 
           />
         </ReactFlow>
         
         <div className="absolute top-6 left-6 bg-bg-card border border-border p-5 rounded-2xl shadow-2xl z-10 pointer-events-none max-w-sm animate-in fade-in slide-in-from-left-4">
           <h3 className="text-sm font-bold text-text-primary mb-2 flex items-center gap-2">
             <span className="w-2 h-2 rounded-full bg-violet-500 animate-ping" />
             Risk Cascade Simulation
           </h3>
           <p className="text-sm text-text-secondary leading-relaxed">
             This Obsidian-style graph links related tasks together. Notice how <strong className="text-red-400">CRITICAL</strong> tasks send an animated red pulse down the graph, visually increasing the <strong className="text-text-primary">Inherited Difficulty</strong> of linked tasks.
           </p>
         </div>
      </div>
    </div>
  )
}
