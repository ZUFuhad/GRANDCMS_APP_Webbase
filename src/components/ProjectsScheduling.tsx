import React, { useMemo, useState } from 'react';
import { ProjectSchedule, Quotation } from '../types';
import { Calendar, CheckCircle2, Clock, Printer, Save, Briefcase } from 'lucide-react';

interface ProjectsSchedulingProps {
  projects: ProjectSchedule[];
  quotations: Quotation[];
  onSaveProject: (project: ProjectSchedule) => void;
}

export const ProjectsScheduling: React.FC<ProjectsSchedulingProps> = ({ projects, quotations, onSaveProject }) => {
  const [localProjects, setLocalProjects] = useState<ProjectSchedule[]>(projects);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const mergedProjects = useMemo(() => {
    const byQuotation = new Map(localProjects.filter(p => p.quotationId).map(p => [p.quotationId, p]));
    const autoProjects = quotations.filter(q => q.status === 'Approved' || q.advance > 0).map(q => byQuotation.get(q.id) || ({
      id: `proj-${q.id}`, quotationId: q.id, quotationNumber: q.quotationNumber,
      projectName: q.subject || q.items[0]?.job || `Project ${q.quotationNumber}`,
      clientName: q.clientName, clientCompany: q.clientCompany, venue: '', eventDate: '', setupDate: '',
      status: 'Upcoming' as const, assignedTeam: [],
      checklist: q.items.map(item => ({ task: `${item.job}${item.description ? ` — ${item.description}` : ''}`, completed: false })),
      workItems: q.items, instructions: '', createdAt: q.createdAt,
    } as ProjectSchedule));
    const ids = new Set(autoProjects.map(p => p.id));
    return [...autoProjects, ...localProjects.filter(p => !ids.has(p.id))];
  }, [localProjects, quotations]);

  const updateProject = (id: string, patch: Partial<ProjectSchedule>) => {
    setLocalProjects(prev => {
      const exists = prev.some(p => p.id === id);
      const base = prev.find(p => p.id === id) || mergedProjects.find(p => p.id === id);
      if (!base) return prev;
      const nextProject = { ...base, ...patch };
      onSaveProject(nextProject);
      return exists ? prev.map(p => p.id === id ? nextProject : p) : [...prev, nextProject];
    });
  };

  const printSchedule = (p: ProjectSchedule) => {
    const rows = (p.workItems || []).map(i => `<tr><td>${i.job}</td><td>${i.description || ''}</td><td>${i.quantity}</td></tr>`).join('');
    const w = window.open('', '_blank'); if (!w) return;
    w.document.write(`<html><head><title>Project Schedule</title><style>body{font-family:Arial;padding:30px}table{width:100%;border-collapse:collapse;margin-top:20px}th,td{border:1px solid #ccc;padding:8px;text-align:left}</style></head><body><h1>GRAND Communication & Marketing</h1><h2>Project Work Schedule</h2><p><b>Project:</b> ${p.projectName}</p><p><b>Client:</b> ${p.clientName}${p.clientCompany ? ` — ${p.clientCompany}` : ''}</p><p><b>Venue:</b> ${p.venue || 'To be finalized'}</p><p><b>Setup:</b> ${p.setupDate || 'To be finalized'} &nbsp; <b>Event:</b> ${p.eventDate || 'To be finalized'}</p><p><b>Team:</b> ${p.assignedTeam.join(', ') || 'To be assigned'}</p><p><b>Instructions:</b> ${p.instructions || 'None'}</p><table><thead><tr><th>Job</th><th>Description</th><th>Qty</th></tr></thead><tbody>${rows}</tbody></table><script>window.print()</script></body></html>`); w.document.close();
  };

  return <div className="space-y-6"><div><h1 className="text-xl sm:text-2xl font-black text-white">Project Scheduling & Execution</h1><p className="text-slate-400 text-xs sm:text-sm mt-0.5">Approved quotations and advance-paid work automatically appear here for final scheduling.</p></div>{mergedProjects.length === 0 ? <div className="bg-[#0B192C] border border-slate-800 rounded-2xl p-10 text-center text-slate-500">No approved/advance-paid quotation is ready for scheduling.</div> : <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">{mergedProjects.map(p => <div key={p.id} className="bg-[#0B192C] rounded-2xl p-6 shadow-xl border border-slate-800 space-y-4 text-slate-200"><div className="flex justify-between items-start"><div><span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 uppercase">{p.status}</span><h3 className="font-black text-base text-white mt-2">{p.projectName}</h3><p className="text-xs font-semibold text-slate-300">Client: {p.clientName}{p.clientCompany ? ` — ${p.clientCompany}` : ''}</p><p className="text-[11px] text-slate-500 mt-1">Quotation: {p.quotationNumber || '—'}</p></div><Briefcase className="w-5 h-5 text-amber-400" /></div><div className="grid grid-cols-1 sm:grid-cols-2 gap-3"><label className="text-xs">Venue<input value={p.venue} onChange={e=>updateProject(p.id,{venue:e.target.value})} className="mt-1 w-full bg-[#07101C] border border-slate-700 rounded-xl p-2.5"/></label><label className="text-xs">Setup Date<input type="date" value={p.setupDate} onChange={e=>updateProject(p.id,{setupDate:e.target.value})} className="mt-1 w-full bg-[#07101C] border border-slate-700 rounded-xl p-2.5"/></label><label className="text-xs">Event Date<input type="date" value={p.eventDate} onChange={e=>updateProject(p.id,{eventDate:e.target.value})} className="mt-1 w-full bg-[#07101C] border border-slate-700 rounded-xl p-2.5"/></label><label className="text-xs">Assigned Team<input value={p.assignedTeam.join(', ')} onChange={e=>updateProject(p.id,{assignedTeam:e.target.value.split(',').map(s=>s.trim()).filter(Boolean)})} placeholder="Worker 1, Worker 2" className="mt-1 w-full bg-[#07101C] border border-slate-700 rounded-xl p-2.5"/></label></div><label className="block text-xs">Work Instructions<textarea value={p.instructions || ''} onChange={e=>updateProject(p.id,{instructions:e.target.value})} rows={2} className="mt-1 w-full bg-[#07101C] border border-slate-700 rounded-xl p-2.5"/></label><div className="space-y-2"><h4 className="font-bold text-xs text-amber-400 uppercase tracking-wide">Quotation Jobs / Execution Checklist</h4>{p.checklist.map((chk,idx)=><div key={idx} className="flex items-center gap-2 text-xs"><button onClick={()=>{const next=[...p.checklist];next[idx]={...next[idx],completed:!next[idx].completed};updateProject(p.id,{checklist:next});}}>{chk.completed?<CheckCircle2 className="w-4 h-4 text-emerald-400"/>:<Clock className="w-4 h-4 text-amber-400"/>}</button><span className={chk.completed?'line-through text-slate-500':'text-slate-200 font-semibold'}>{chk.task}</span></div>)}</div><div className="flex flex-wrap gap-2"><button onClick={()=>setExpandedId(expandedId===p.id?null:p.id)} className="px-3 py-2 rounded-lg bg-slate-800 text-xs font-bold"><Calendar className="w-4 h-4 inline mr-1"/>{expandedId===p.id?'Hide Details':'Schedule Details'}</button><button onClick={()=>printSchedule(p)} className="px-3 py-2 rounded-lg bg-amber-500 text-slate-950 text-xs font-black"><Printer className="w-4 h-4 inline mr-1"/>Print Schedule</button><button onClick={()=>updateProject(p.id,{status:'Completed'})} className="px-3 py-2 rounded-lg bg-emerald-500 text-slate-950 text-xs font-black"><Save className="w-4 h-4 inline mr-1"/>Done</button></div></div>)}</div>}</div>;
};
