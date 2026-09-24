import React, { useState } from 'react';
import { ProjectSchedule, Client } from '../types';
import {
  CalendarClock,
  Plus,
  Bell,
  Clock,
  CheckCircle,
  AlertTriangle,
  MapPin,
  Users,
  Send,
  Calendar,
  X,
} from 'lucide-react';

interface ProjectsSchedulingProps {
  projects: ProjectSchedule[];
  clients: Client[];
  onSaveProject: (project: ProjectSchedule) => void;
  onTriggerPushNotification: (title: string, message: string) => void;
  onPreviewQuotationByNumber?: (qNum: string) => void;
}

export const ProjectsScheduling: React.FC<ProjectsSchedulingProps> = ({
  projects,
  clients,
  onSaveProject,
  onTriggerPushNotification,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Form State
  const [title, setTitle] = useState('');
  const [clientId, setClientId] = useState('');
  const [clientName, setClientName] = useState('');
  const [eventDate, setEventDate] = useState(
    new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
  );
  const [printClearanceDeadline, setPrintClearanceDeadline] = useState(
    new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
  );
  const [installationDeadline, setInstallationDeadline] = useState(
    new Date(Date.now() + 13 * 86400000).toISOString().split('T')[0],
  );
  const [status, setStatus] = useState<ProjectSchedule['status']>('Planning');
  const [priority, setPriority] = useState<ProjectSchedule['priority']>('High');
  const [location, setLocation] = useState('Polo Ground / Chittagong Club Pavilion');
  const [assignedTeam, setAssignedTeam] = useState('Mohin Uddin (Lead), Kabir (Woodwork)');

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    const newProject: ProjectSchedule = {
      id: `proj-${Date.now()}`,
      title,
      clientId: clientId || 'general',
      clientName: clientName || 'Corporate Client',
      eventDate,
      printClearanceDeadline,
      installationDeadline,
      status,
      priority,
      progressPercent: status === 'Planning' ? 10 : status === 'Design & Clearance' ? 35 : status === 'Fabrication' ? 60 : 85,
      location,
      assignedTeam: assignedTeam.split(',').map((t) => t.trim()),
      notes: 'Materials: Wooden battens, 340gsm PVC, MS frame',
      createdAt: new Date().toISOString(),
    };

    onSaveProject(newProject);
    onTriggerPushNotification(
      `Project Scheduled: ${newProject.title}`,
      `Print Clearance Due: ${newProject.printClearanceDeadline} | Venue: ${newProject.location}`,
    );

    setShowModal(false);
    resetForm();
  };

  const resetForm = () => {
    setTitle('');
    setClientId('');
    setClientName('');
  };

  const calculateDaysLeft = (targetDate: string) => {
    const diff = new Date(targetDate).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const filteredProjects = projects.filter((p) => {
    if (filterStatus === 'all') return true;
    return p.status.toLowerCase() === filterStatus.toLowerCase();
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#0B192C] tracking-tight flex items-center gap-2">
            <CalendarClock className="w-6 h-6 text-[#0B192C]" />
            Projects & Installation Scheduling
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Strict 12-day design clearance enforcement, fabrication milestones, and crew push alerts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              onTriggerPushNotification(
                'Grand System Broadcast',
                'Crew alert: 3 days left for Borfi frame installation at Polo Ground venue.',
              )
            }
            className="px-3.5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            title="Send Test Push Notification"
          >
            <Bell className="w-3.5 h-3.5 text-[#0B192C]" />
            Test Push Notification
          </button>

          <button
            onClick={() => setShowModal(true)}
            className="px-5 py-2.5 bg-[#0B192C] hover:bg-[#1E3E62] text-white font-black text-xs rounded-xl shadow-md shadow-[#0B192C]/20 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            New Project Schedule
          </button>
        </div>
      </div>

      {/* Project Status Filters in Navy Blue & White */}
      <div className="flex flex-wrap items-center gap-2 bg-white border border-slate-200 p-2 rounded-2xl shadow-xs">
        {['all', 'planning', 'design & clearance', 'fabrication', 'installation', 'completed'].map(
          (st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                filterStatus === st
                  ? 'bg-[#0B192C] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
              }`}
            >
              {st}
            </button>
          ),
        )}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProjects.map((project) => {
          const daysToEvent = calculateDaysLeft(project.eventDate);
          const daysToClearance = calculateDaysLeft(project.printClearanceDeadline);

          const statusBadgeColor =
            project.status === 'Fabrication'
              ? 'bg-[#1E3E62] text-white'
              : project.status === 'Design & Clearance'
              ? 'bg-blue-50 text-[#0B192C] border border-blue-200'
              : project.status === 'Installation'
              ? 'bg-[#0B192C] text-white'
              : 'bg-emerald-50 text-emerald-700 border border-emerald-200';

          return (
            <div
              key={project.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-[#0B192C] hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${statusBadgeColor}`}>
                    {project.status}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      project.priority === 'High'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {project.priority} Priority
                  </span>
                </div>

                <h3 className="font-bold text-slate-950 text-base leading-snug mb-1">
                  {project.title}
                </h3>
                <p className="text-xs text-[#0B192C] font-bold mb-3">
                  Client: {project.clientName}
                </p>

                {/* Deadlines Countdown Box */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2 text-xs mb-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 font-medium flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-blue-600" />
                      Print Clearance:
                    </span>
                    <span
                      className={`font-mono font-bold ${
                        daysToClearance <= 2 ? 'text-rose-600' : 'text-slate-900'
                      }`}
                    >
                      {project.printClearanceDeadline}{' '}
                      <span className="text-[10px] text-slate-500">({daysToClearance}d left)</span>
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 font-medium flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-700" />
                      Program Day (Event):
                    </span>
                    <span className="font-mono font-bold text-slate-950">
                      {project.eventDate}{' '}
                      <span className="text-[10px] text-slate-500">({daysToEvent}d left)</span>
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1 mb-3">
                  <div className="flex justify-between text-[11px] text-slate-500 font-semibold">
                    <span>Overall Execution</span>
                    <span className="font-mono font-bold text-slate-950">
                      {project.progressPercent}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                    <div
                      className="h-full bg-[#0B192C] rounded-full transition-all duration-300"
                      style={{ width: `${project.progressPercent}%` }}
                    ></div>
                  </div>
                </div>

                {/* Team & Venue */}
                <div className="space-y-1 text-xs text-slate-600 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-1.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{project.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{project.assignedTeam.join(', ')}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100">
                <button
                  onClick={() => {
                    const nextProgress = Math.min(100, project.progressPercent + 20);
                    const updated: ProjectSchedule = {
                      ...project,
                      progressPercent: nextProgress,
                      status: nextProgress === 100 ? 'Completed' : project.status,
                    };
                    onSaveProject(updated);
                  }}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold cursor-pointer transition-colors"
                >
                  +20% Progress
                </button>

                <button
                  onClick={() =>
                    onTriggerPushNotification(
                      `Push Alert: ${project.title}`,
                      `Attention team! Installation deadline is ${project.installationDeadline} at ${project.location}.`,
                    )
                  }
                  className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#0B192C] rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Send className="w-3 h-3 text-[#0B192C]" />
                  Notify Team
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Schedule Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-[#0B192C]/80 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateProject}
            className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-950 text-base">Schedule New Project / Exhibition</h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-950 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Project Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Borfi & Standee Setup (200 units each)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Client *</label>
                <select
                  value={clientId}
                  onChange={(e) => {
                    setClientId(e.target.value);
                    const c = clients.find((item) => item.id === e.target.value);
                    if (c) setClientName(c.name);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 font-medium mb-1.5"
                >
                  <option value="">-- Select Client --</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Or Enter Client Name"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Event Day (Program)
                  </label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1 text-blue-600">
                    Print Clearance Due
                  </label>
                  <input
                    type="date"
                    value={printClearanceDeadline}
                    onChange={(e) => setPrintClearanceDeadline(e.target.value)}
                    className="w-full bg-slate-50 border border-blue-300 rounded-xl px-2.5 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Installation Due
                  </label>
                  <input
                    type="date"
                    value={installationDeadline}
                    onChange={(e) => setInstallationDeadline(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Stage Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 font-medium"
                  >
                    <option value="Planning">Planning</option>
                    <option value="Design & Clearance">Design & Clearance</option>
                    <option value="Fabrication">Fabrication (Workshop)</option>
                    <option value="Installation">Installation (Venue)</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 font-medium"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Installation Venue</label>
                <input
                  type="text"
                  placeholder="e.g. Radisson Blu Chattogram / Polo Ground"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Assigned Team</label>
                <input
                  type="text"
                  placeholder="Comma separated team names"
                  value={assignedTeam}
                  onChange={(e) => setAssignedTeam(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 font-medium"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#0B192C] hover:bg-[#1E3E62] text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
              >
                Schedule & Send Push Alert
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
