"use client";
import { useState } from "react";
import {
  Check,
  CheckCircle2,
  Circle,
  MessageSquare,
  Plus,
  Send,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
  initials: string;
  color: string;
}

interface Task {
  id: string;
  title: string;
  assignedTo: string | null;
  status: "pending" | "in-progress" | "completed";
  category: string;
  comments: Comment[];
}

interface Comment {
  id: string;
  author: string;
  text: string;
  time: string;
}

const COLORS = [
  "bg-blue-500",
  "bg-emerald-500",
  "bg-purple-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-teal-500",
];

const INITIAL_MEMBERS: Member[] = [
  { id: "1", name: "Sarah M.", email: "sarah@example.com", role: "Lead coordinator", initials: "SM", color: "bg-blue-500" },
  { id: "2", name: "James T.", email: "james@example.com", role: "Family member", initials: "JT", color: "bg-emerald-500" },
];

const INITIAL_TASKS: Task[] = [
  { id: "t1", title: "Register the death at Romford Register Office", assignedTo: "1", status: "completed", category: "Legal", comments: [] },
  { id: "t2", title: "Contact funeral director and get quotes", assignedTo: "1", status: "in-progress", category: "Funeral", comments: [{ id: "c1", author: "Sarah M.", text: "I've spoken to Co-op Funeralcare — getting a quote tomorrow.", time: "Yesterday, 3:24pm" }] },
  { id: "t3", title: "Notify DWP and HMRC via Tell Us Once", assignedTo: "2", status: "pending", category: "Government", comments: [] },
  { id: "t4", title: "Contact NatWest bank to freeze accounts", assignedTo: null, status: "pending", category: "Financial", comments: [] },
  { id: "t5", title: "Notify British Gas and Thames Water", assignedTo: "2", status: "pending", category: "Utilities", comments: [] },
  { id: "t6", title: "Contact pension provider (Royal London)", assignedTo: null, status: "pending", category: "Financial", comments: [] },
  { id: "t7", title: "Arrange flowers for the funeral", assignedTo: null, status: "pending", category: "Funeral", comments: [] },
  { id: "t8", title: "Write and send death notices", assignedTo: "1", status: "pending", category: "Personal", comments: [] },
];

export default function FamilyPage() {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");

  const completed = tasks.filter((t) => t.status === "completed").length;

  const addTask = () => {
    if (!newTaskTitle.trim()) return;
    setTasks((prev) => [
      ...prev,
      { id: `t${Date.now()}`, title: newTaskTitle.trim(), assignedTo: null, status: "pending", category: "General", comments: [] },
    ]);
    setNewTaskTitle("");
  };

  const cycleStatus = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const next: Task["status"] =
          t.status === "pending" ? "in-progress" : t.status === "in-progress" ? "completed" : "pending";
        return { ...t, status: next };
      })
    );
  };

  const assignTask = (taskId: string, memberId: string | null) => {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, assignedTo: memberId } : t)));
  };

  const addComment = (taskId: string) => {
    if (!newComment.trim()) return;
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              comments: [
                ...t.comments,
                {
                  id: `c${Date.now()}`,
                  author: "You",
                  text: newComment.trim(),
                  time: "Just now",
                },
              ],
            }
          : t
      )
    );
    setNewComment("");
  };

  const inviteMember = () => {
    if (!inviteName.trim() || !inviteEmail.trim()) return;
    const initials = inviteName
      .split(" ")
      .map((p) => p[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
    setMembers((prev) => [
      ...prev,
      {
        id: `m${Date.now()}`,
        name: inviteName.trim(),
        email: inviteEmail.trim(),
        role: "Family member",
        initials,
        color: COLORS[prev.length % COLORS.length],
      },
    ]);
    setInviteEmail("");
    setInviteName("");
    setShowInvite(false);
  };

  const selectedTaskData = selectedTask ? tasks.find((t) => t.id === selectedTask) : null;

  const statusIcon = (status: Task["status"]) => {
    if (status === "completed") return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
    if (status === "in-progress") return <Circle className="h-5 w-5 text-amber-500" strokeWidth={2.5} />;
    return <Circle className="h-5 w-5 text-stone-300" />;
  };

  const statusBadge = (status: Task["status"]) => {
    if (status === "completed") return <Badge variant="completed">Completed</Badge>;
    if (status === "in-progress") return <Badge variant="week">In progress</Badge>;
    return <Badge variant="future">To do</Badge>;
  };

  return (
    <div className="bg-stone-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Family Workspace</h1>
              <p className="text-slate-500 text-sm mt-1">
                Coordinate tasks and communicate with family members in one place.
              </p>
            </div>
            <Button onClick={() => setShowInvite(true)}>
              <UserPlus className="h-4 w-4" />
              Invite Family Member
            </Button>
          </div>

          {/* Progress */}
          <div className="mt-6 flex items-center gap-6">
            <div className="flex-1 max-w-sm">
              <Progress value={completed} max={tasks.length} showLabel />
            </div>
            <p className="text-sm text-slate-600">
              {completed} of {tasks.length} tasks complete
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left – task list */}
          <div className="lg:col-span-2">
            {/* Add task */}
            <div className="flex gap-2 mb-5">
              <input
                type="text"
                placeholder="Add a new task..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTask()}
                className="flex-1 rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
              <Button onClick={addTask}>
                <Plus className="h-4 w-4" />
                Add
              </Button>
            </div>

            {/* Task list */}
            <div className="space-y-3">
              {tasks.map((task) => {
                const assignee = members.find((m) => m.id === task.assignedTo);
                return (
                  <Card
                    key={task.id}
                    className={cn(
                      "cursor-pointer transition-all hover:shadow-md",
                      selectedTask === task.id && "ring-2 ring-slate-400"
                    )}
                    onClick={() => setSelectedTask(selectedTask === task.id ? null : task.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <button
                          onClick={(e) => { e.stopPropagation(); cycleStatus(task.id); }}
                          className="flex-shrink-0 mt-0.5"
                        >
                          {statusIcon(task.status)}
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p
                              className={cn(
                                "text-sm font-medium text-slate-800",
                                task.status === "completed" && "line-through text-slate-400"
                              )}
                            >
                              {task.title}
                            </p>
                            {statusBadge(task.status)}
                          </div>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-xs text-slate-400">{task.category}</span>
                            {task.comments.length > 0 && (
                              <span className="flex items-center gap-1 text-xs text-slate-400">
                                <MessageSquare className="h-3 w-3" />
                                {task.comments.length}
                              </span>
                            )}
                            {assignee ? (
                              <div className="flex items-center gap-1.5">
                                <div
                                  className={cn(
                                    "w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold",
                                    assignee.color
                                  )}
                                >
                                  {assignee.initials}
                                </div>
                                <span className="text-xs text-slate-500">{assignee.name}</span>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400 italic">Unassigned</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Expanded */}
                      {selectedTask === task.id && (
                        <div className="mt-4 pt-4 border-t border-stone-100" onClick={(e) => e.stopPropagation()}>
                          {/* Assign */}
                          <div className="mb-4">
                            <p className="text-xs font-medium text-slate-500 mb-2">Assign to</p>
                            <div className="flex gap-2 flex-wrap">
                              {members.map((m) => (
                                <button
                                  key={m.id}
                                  onClick={() => assignTask(task.id, task.assignedTo === m.id ? null : m.id)}
                                  className={cn(
                                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                                    task.assignedTo === m.id
                                      ? "bg-slate-700 text-white border-slate-700"
                                      : "bg-white text-slate-600 border-stone-200 hover:border-stone-300"
                                  )}
                                >
                                  <div
                                    className={cn(
                                      "w-4 h-4 rounded-full flex items-center justify-center text-white text-xs",
                                      m.color
                                    )}
                                  >
                                    {m.initials[0]}
                                  </div>
                                  {m.name}
                                  {task.assignedTo === m.id && <Check className="h-3 w-3" />}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Comments */}
                          {task.comments.length > 0 && (
                            <div className="space-y-2 mb-3">
                              {task.comments.map((c) => (
                                <div key={c.id} className="bg-stone-50 rounded-lg p-3">
                                  <p className="text-xs font-medium text-slate-600">{c.author}</p>
                                  <p className="text-xs text-slate-500 mt-0.5">{c.text}</p>
                                  <p className="text-xs text-slate-400 mt-1">{c.time}</p>
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Add a comment..."
                              value={newComment}
                              onChange={(e) => setNewComment(e.target.value)}
                              onKeyDown={(e) => e.key === "Enter" && addComment(task.id)}
                              className="flex-1 rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400"
                            />
                            <button
                              onClick={() => addComment(task.id)}
                              className="p-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors"
                            >
                              <Send className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Right – team */}
          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-slate-500" />
                  Family Members
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {members.map((m) => (
                    <div key={m.id} className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0",
                          m.color
                        )}
                      >
                        {m.initials}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800">{m.name}</p>
                        <p className="text-xs text-slate-500">{m.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" size="sm" className="w-full mt-4" onClick={() => setShowInvite(true)}>
                  <UserPlus className="h-3.5 w-3.5" />
                  Invite someone
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Invite modal */}
      {showInvite && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">Invite a family member</h3>
              <button onClick={() => setShowInvite(false)} className="p-1 hover:bg-stone-100 rounded-lg">
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>
            <div className="space-y-4">
              <Input
                label="Name"
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                placeholder="e.g. James Thompson"
              />
              <Input
                label="Email address"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="james@example.com"
              />
              <Button className="w-full" onClick={inviteMember}>
                Send Invitation
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
