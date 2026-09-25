import React from 'react';
import { ProjectSchedule } from '../types';
import { Calendar, CheckCircle2, Clock } from 'lucide-react';

interface ProjectsSchedulingProps {
  projects: ProjectSchedule[];
}

export const ProjectsScheduling: React.FC<ProjectsSchedulingProps> = ({ projects }) => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-white">Project Scheduling & Execution</h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
          Monitor exhibition dates, venue setups, and team task checklists.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map((p) => (
          <div key={p.id} className="bg-[#0B192C] rounded-2xl p-6 shadow-xl border border-slate-800 space-y-4 text-slate-200">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 uppercase">
                  {p.status}
                </span>
                <h3 className="font-black text-base text-white mt-2">{p.projectName}</h3>
                <p className="text-xs font-semibold text-slate-300">Client: {p.clientName}</p>
              </div>
            </div>

            <div className="p-3 bg-[#07101C] rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1">
              <p>📍 <strong>Venue:</strong> {p.venue}</p>
              <p>📅 <strong>Setup Date:</strong> {p.setupDate} | <strong>Event Date:</strong> {p.eventDate}</p>
              <p>👥 <strong>Team:</strong> {p.assignedTeam.join(', ')}</p>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-xs text-amber-400 uppercase tracking-wide">Execution Checklist</h4>
              <div className="space-y-1.5">
                {p.checklist.map((chk, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs">
                    {chk.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                    )}
                    <span className={chk.completed ? 'line-through text-slate-500 font-medium' : 'text-slate-200 font-semibold'}>
                      {chk.task}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
