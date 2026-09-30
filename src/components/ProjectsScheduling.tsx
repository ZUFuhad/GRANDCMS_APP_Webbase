import React, { useState } from 'react';
import { ProjectSchedule, QuotationItem } from '../types';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Plus,
  Search,
  CheckSquare,
  Square,
  ArrowRight,
  Receipt,
  User,
  MapPin,
  Users,
  Edit3,
  Trash2,
  DollarSign,
  AlertCircle,
  FileCheck,
  Sparkles,
  X,
} from 'lucide-react';

interface ProjectsSchedulingProps {
  projects: ProjectSchedule[];
  onSaveProject: (project: ProjectSchedule) => void;
  onDeleteProject: (id: string) => void;
  onDoneProject: (project: ProjectSchedule) => void;
  onViewInvoice?: (invoiceId?: string) => void;
}

export const ProjectsScheduling: React.FC<ProjectsSchedulingProps> = ({
  projects,
  onSaveProject,
  onDeleteProject,
  onDoneProject,
  onViewInvoice,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Upcoming' | 'In Progress' | 'Completed'>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectSchedule | null>(null);

  // Form State for New/Edit Project
  const [formProjectName, setFormProjectName] = useState('');
  const [formClientName, setFormClientName] = useState('');
  const [formVenue, setFormVenue] = useState('');
  const [formEventDate, setFormEventDate] = useState('');
  const [formSetupDate, setFormSetupDate] = useState('');
  const [formStatus, setFormStatus] = useState<'Upcoming' | 'In Progress' | 'Completed'>('Upcoming');
  const [formTeamInput, setFormTeamInput] = useState('');
  const [formChecklistTasks, setFormChecklistTasks] = useState<string>('');

  const handleOpenCreate = () => {
    setEditingProject(null);
    setFormProjectName('');
    setFormClientName('');
    setFormVenue('CDA Market / Designated Venue, Chattogram');
    setFormSetupDate(new Date().toISOString().split('T')[0]);
    setFormEventDate(new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0]);
    setFormStatus('Upcoming');
    setFormTeamInput('Zahir Uddin Fuhad, Production Lead, Logistics');
    setFormChecklistTasks(
      'Venue inspection & measurements\nFabrication and printing wrap\nOn-site stage & booth assembly\nClient sign-off walkthrough'
    );
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: ProjectSchedule) => {
    setEditingProject(p);
    setFormProjectName(p.projectName);
    setFormClientName(p.clientName);
    setFormVenue(p.venue);
    setFormSetupDate(p.setupDate);
    setFormEventDate(p.eventDate);
    setFormStatus(p.status === 'Cancelled' ? 'Upcoming' : p.status);
    setFormTeamInput(p.assignedTeam.join(', '));
    setFormChecklistTasks(p.checklist.map((c) => c.task).join('\n'));
    setIsModalOpen(true);
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formProjectName.trim() || !formClientName.trim()) {
      alert('Please enter Project Name and Client Name');
      return;
    }

    const teamList = formTeamInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const checklistItems = formChecklistTasks
      .split('\n')
      .map((t) => t.trim())
      .filter(Boolean)
      .map((task) => {
        // preserve existing completed status if editing
        const existing = editingProject?.checklist.find((c) => c.task.toLowerCase() === task.toLowerCase());
        return {
          task,
          completed: existing ? existing.completed : false,
        };
      });

    const projectToSave: ProjectSchedule = {
      id: editingProject ? editingProject.id : `proj-${Date.now()}`,
      projectName: formProjectName.trim(),
      clientName: formClientName.trim(),
      venue: formVenue.trim() || 'Chattogram',
      eventDate: formEventDate || new Date().toISOString().split('T')[0],
      setupDate: formSetupDate || new Date().toISOString().split('T')[0],
      status: formStatus,
      assignedTeam: teamList.length > 0 ? teamList : ['Operations Team'],
      checklist: checklistItems.length > 0 ? checklistItems : [{ task: 'Complete booth setup', completed: false }],
      quotationId: editingProject?.quotationId,
      quotationNumber: editingProject?.quotationNumber,
      clientCompany: editingProject?.clientCompany,
      clientAddress: editingProject?.clientAddress,
      clientPhone: editingProject?.clientPhone,
      items: editingProject?.items,
      totalAmount: editingProject?.totalAmount,
      advance: editingProject?.advance,
      due: editingProject?.due,
      invoiceId: editingProject?.invoiceId,
    };

    onSaveProject(projectToSave);
    setIsModalOpen(false);
  };

  // Toggle single task in checklist
  const handleToggleChecklistTask = (project: ProjectSchedule, taskIndex: number) => {
    const updatedChecklist = project.checklist.map((chk, idx) =>
      idx === taskIndex ? { ...chk, completed: !chk.completed } : chk
    );
    const allCompleted = updatedChecklist.every((c) => c.completed);
    const updatedProject: ProjectSchedule = {
      ...project,
      checklist: updatedChecklist,
      status: allCompleted ? 'Completed' : project.status === 'Completed' ? 'In Progress' : project.status,
    };
    onSaveProject(updatedProject);
  };

  // Filter projects
  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.venue.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.quotationNumber && p.quotationNumber.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalCount = projects.length;
  const upcomingCount = projects.filter((p) => p.status === 'Upcoming').length;
  const inProgressCount = projects.filter((p) => p.status === 'In Progress').length;
  const completedCount = projects.filter((p) => p.status === 'Completed').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-white">Project Scheduling & Execution</h1>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Workflow Engine
            </span>
          </div>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
            Track exhibition setups, task checklists, and click <strong className="text-emerald-400">Done</strong> to automatically generate Tax Invoices & Receipts.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Project Schedule</span>
        </button>
      </div>

      {/* Stats Counter Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div
          onClick={() => setStatusFilter('All')}
          className={`p-4 rounded-2xl bg-[#0B192C] border transition-all cursor-pointer ${
            statusFilter === 'All' ? 'border-amber-500/80 shadow-amber-950/20 shadow-lg' : 'border-slate-800'
          }`}
        >
          <p className="text-xs font-semibold text-slate-400 uppercase">Total Schedules</p>
          <h3 className="text-xl font-black text-white mt-1">{totalCount}</h3>
        </div>
        <div
          onClick={() => setStatusFilter('Upcoming')}
          className={`p-4 rounded-2xl bg-[#0B192C] border transition-all cursor-pointer ${
            statusFilter === 'Upcoming' ? 'border-blue-500/80 shadow-blue-950/20 shadow-lg' : 'border-slate-800'
          }`}
        >
          <p className="text-xs font-semibold text-blue-400 uppercase">Upcoming</p>
          <h3 className="text-xl font-black text-white mt-1">{upcomingCount}</h3>
        </div>
        <div
          onClick={() => setStatusFilter('In Progress')}
          className={`p-4 rounded-2xl bg-[#0B192C] border transition-all cursor-pointer ${
            statusFilter === 'In Progress' ? 'border-amber-500/80 shadow-amber-950/20 shadow-lg' : 'border-slate-800'
          }`}
        >
          <p className="text-xs font-semibold text-amber-400 uppercase">In Progress</p>
          <h3 className="text-xl font-black text-white mt-1">{inProgressCount}</h3>
        </div>
        <div
          onClick={() => setStatusFilter('Completed')}
          className={`p-4 rounded-2xl bg-[#0B192C] border transition-all cursor-pointer ${
            statusFilter === 'Completed' ? 'border-emerald-500/80 shadow-emerald-950/20 shadow-lg' : 'border-slate-800'
          }`}
        >
          <p className="text-xs font-semibold text-emerald-400 uppercase">Done / Invoiced</p>
          <h3 className="text-xl font-black text-emerald-400 mt-1">{completedCount}</h3>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#0B192C] rounded-2xl p-4 shadow-xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-200">
        <div className="flex items-center gap-3 w-full sm:w-96 bg-[#07101C] rounded-xl px-3 py-2 border border-slate-700">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search by project, client, venue, quotation #..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none w-full"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {(['All', 'Upcoming', 'In Progress', 'Completed'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === tab
                  ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                  : 'bg-[#07101C] text-slate-400 hover:text-white border border-slate-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="bg-[#0B192C] rounded-2xl p-12 text-center border border-slate-800">
          <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No project schedules found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Approve a quotation from the Quotations tab or click "New Project Schedule" to add execution milestones.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredProjects.map((p) => {
            const completedTasks = p.checklist.filter((c) => c.completed).length;
            const totalTasks = p.checklist.length;
            const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
            const isCompleted = p.status === 'Completed';

            return (
              <div
                key={p.id}
                className={`bg-[#0B192C] rounded-2xl p-6 shadow-xl border transition-all flex flex-col justify-between space-y-4 text-slate-200 ${
                  isCompleted
                    ? 'border-emerald-500/40 bg-gradient-to-b from-[#0B192C] to-emerald-950/20'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  {/* Top Status & Dates */}
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider border ${
                            isCompleted
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                              : p.status === 'In Progress'
                              ? 'bg-amber-950 text-amber-300 border-amber-700'
                              : 'bg-blue-950 text-blue-300 border-blue-700'
                          }`}
                        >
                          {p.status}
                        </span>

                        {p.quotationNumber && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700">
                            Linked: {p.quotationNumber}
                          </span>
                        )}
                      </div>

                      <h3 className="font-black text-base sm:text-lg text-white mt-2 leading-snug">
                        {p.projectName}
                      </h3>
                      <p className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mt-0.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>Client: {p.clientName}</span>
                        {p.clientCompany && (
                          <span className="text-slate-400">({p.clientCompany})</span>
                        )}
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="p-1.5 rounded-lg bg-[#07101C] hover:bg-slate-800 text-slate-400 hover:text-amber-400 border border-slate-700 transition-colors cursor-pointer"
                        title="Edit Project Schedule"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete "${p.projectName}"?`)) {
                            onDeleteProject(p.id);
                          }
                        }}
                        className="p-1.5 rounded-lg bg-[#07101C] hover:bg-red-950 text-slate-400 hover:text-red-400 border border-slate-700 transition-colors cursor-pointer"
                        title="Delete Project Schedule"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Schedule Details Badge */}
                  <div className="mt-4 p-3 bg-[#07101C] rounded-xl border border-slate-800/90 text-xs text-slate-300 space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="truncate"><strong>Venue:</strong> {p.venue}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span>
                        <strong>Setup:</strong> {p.setupDate} &nbsp;|&nbsp; <strong>Event:</strong> {p.eventDate}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      <span className="truncate"><strong>Team:</strong> {p.assignedTeam.join(', ')}</span>
                    </div>

                    {/* Financial Summary if linked to quotation */}
                    {typeof p.totalAmount === 'number' && p.totalAmount > 0 && (
                      <div className="pt-1.5 mt-1.5 border-t border-slate-800 flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 font-medium">Budget:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-amber-400">৳ {p.totalAmount.toLocaleString()}/-</span>
                          {(p.advance || 0) > 0 && (
                            <span className="text-emerald-400 font-bold">(Adv: ৳ {p.advance?.toLocaleString()}/-)</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Checklist Section */}
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-amber-400 uppercase tracking-wide flex items-center gap-1.5">
                        <CheckSquare className="w-3.5 h-3.5 text-amber-400" />
                        <span>Execution Checklist ({completedTasks}/{totalTasks})</span>
                      </h4>
                      <span className="text-[10px] font-bold text-slate-400">
                        {progressPercent}% Complete
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          isCompleted || progressPercent === 100
                            ? 'bg-emerald-500'
                            : 'bg-gradient-to-r from-amber-500 to-emerald-400'
                        }`}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>

                    <div className="space-y-1.5 mt-2 max-h-44 overflow-y-auto pr-1">
                      {p.checklist.map((chk, idx) => (
                        <div
                          key={idx}
                          onClick={() => handleToggleChecklistTask(p, idx)}
                          className={`flex items-start gap-2 text-xs p-1.5 rounded-lg border transition-colors cursor-pointer select-none ${
                            chk.completed
                              ? 'bg-emerald-950/20 border-emerald-900/40 text-slate-400'
                              : 'bg-[#07101C]/60 border-slate-800 hover:border-slate-700 text-slate-200'
                          }`}
                        >
                          {chk.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-500 hover:text-slate-300 shrink-0 mt-0.5" />
                          )}
                          <span
                            className={`flex-1 leading-snug ${
                              chk.completed ? 'line-through text-slate-500 font-medium' : 'font-semibold text-slate-200'
                            }`}
                          >
                            {chk.task}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ACTION BAR: THE DONE BUTTON REQUESTED BY USER */}
                <div className="pt-3 border-t border-slate-800 flex items-center gap-2">
                  {!isCompleted ? (
                    <button
                      onClick={() => onDoneProject(p)}
                      className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/60 hover:shadow-emerald-900/40 transition-all cursor-pointer active:scale-98"
                      title="Click Done to complete project schedule and immediately transition to Invoice / Receipts"
                    >
                      <CheckCircle2 className="w-4 h-4 text-white" />
                      <span>Done (Go to Invoices & Receipts)</span>
                      <ArrowRight className="w-3.5 h-3.5 text-white/80" />
                    </button>
                  ) : (
                    <div className="w-full flex items-center justify-between gap-2 bg-emerald-950/40 border border-emerald-800/60 rounded-xl p-2.5">
                      <div className="flex items-center gap-1.5 text-emerald-300 text-xs font-bold">
                        <FileCheck className="w-4 h-4 text-emerald-400" />
                        <span>Done & Invoiced</span>
                      </div>
                      <button
                        onClick={() => onViewInvoice && onViewInvoice(p.invoiceId)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        <span>View Invoice</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New / Edit Schedule Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-[#0B192C] border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4 my-8">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-400" />
                <span>{editingProject ? 'Edit Project Schedule' : 'New Project Schedule'}</span>
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Project Name / Subject *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Brand Activation Setup & Borfi Exhibition"
                  value={formProjectName}
                  onChange={(e) => setFormProjectName(e.target.value)}
                  className="w-full bg-[#07101C] border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Client Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Whiz Communication"
                    value={formClientName}
                    onChange={(e) => setFormClientName(e.target.value)}
                    className="w-full bg-[#07101C] border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full bg-[#07101C] border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500 text-xs font-semibold"
                  >
                    <option value="Upcoming">Upcoming</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Venue Location</label>
                <input
                  type="text"
                  placeholder="e.g. GEC Convention Centre, Chattogram"
                  value={formVenue}
                  onChange={(e) => setFormVenue(e.target.value)}
                  className="w-full bg-[#07101C] border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Setup Date</label>
                  <input
                    type="date"
                    value={formSetupDate}
                    onChange={(e) => setFormSetupDate(e.target.value)}
                    className="w-full bg-[#07101C] border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Event Date</label>
                  <input
                    type="date"
                    value={formEventDate}
                    onChange={(e) => setFormEventDate(e.target.value)}
                    className="w-full bg-[#07101C] border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Assigned Team (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Zahir Uddin Fuhad, Rahim, Production Team"
                  value={formTeamInput}
                  onChange={(e) => setFormTeamInput(e.target.value)}
                  className="w-full bg-[#07101C] border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  Execution Checklist (one task per line)
                </label>
                <textarea
                  rows={4}
                  placeholder="Venue clearance&#10;Wooden fabrication&#10;PVC branding installation"
                  value={formChecklistTasks}
                  onChange={(e) => setFormChecklistTasks(e.target.value)}
                  className="w-full bg-[#07101C] border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500 text-xs font-mono"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-xl shadow-md transition-all cursor-pointer"
                >
                  {editingProject ? 'Update Schedule' : 'Create Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsScheduling;
