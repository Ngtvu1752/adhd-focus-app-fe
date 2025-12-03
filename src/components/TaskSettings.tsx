import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus, Trash2, Calendar, User, FileText, Filter } from 'lucide-react'; // Thêm icon Filter
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { toast } from 'sonner';

import taskApi, { Task, TaskStatus } from '../api/taskApi';
import authApi from '../api/authApi';
import { useAuth } from '../context/AuthContext';

interface ChildAccount {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
}

export function TaskSettings() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [children, setChildren] = useState<ChildAccount[]>([]);
  const [loading, setLoading] = useState(false);

  // --- Form State (Dùng cho phần Giao nhiệm vụ) ---
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [assignChildId, setAssignChildId] = useState(''); 

  const [filterChildId, setFilterChildId] = useState<string>('all'); // Mặc định là 'all'
  console.log("Loading tasks for filterChildId:", user);

  useEffect(() => {
    loadChildren();
  }, []);

  // 2. Khi filter thay đổi -> Load lại danh sách task tương ứng
  useEffect(() => {
    if (user?.id) {
      loadTasks();
    }
  }, [filterChildId, user?.id]);

  const loadChildren = async () => {
    try {
      const res: any = await authApi.getChildren();
      const childList = Array.isArray(res) ? res : (res.data || []);
      setChildren(childList);

      if (childList.length > 0) {
        setAssignChildId(childList[0].id);
      }
    } catch (error) {
      console.error("Lỗi tải danh sách con:", error);
    }
  };

  const loadTasks = async () => {
    try {
      let data: Task[] = [];

      if (filterChildId === 'all') {
        if (user?.id) {
           data = await taskApi.getTasksBySupervisor(user.id);
        }
      } else {
        data = await taskApi.getTasksByFilter(filterChildId);
      }
      
      setTasks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Lỗi tải task:", error);
    }
  };

  const addTask = async () => {
    if (!newTaskTitle.trim()) {
      toast.error('Please enter a task title');
      return;
    }
    if (!assignChildId) {
      toast.error('Please select a child to assign the task');
      return;
    }

    setLoading(true);
    try {
      const formattedDate = newTaskDueDate ? new Date(newTaskDueDate).toISOString() : undefined;

      const payload = {
        title: newTaskTitle,
        description: newTaskDesc,
        dueDate: formattedDate,
        childId: assignChildId // Dùng ID từ form giao nhiệm vụ
      };

      await taskApi.create(payload);
      loadTasks();

      // Reset form
      setNewTaskTitle('');
      setNewTaskDesc('');
      setNewTaskDueDate('');
      toast.success('Task assigned successfully! 🎉');

    } catch (error) {
      console.error(error);
      toast.error('Failed to assign task.');
    } finally {
      setLoading(false);
    }
  };

  const deleteTask = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await taskApi.delete(id);
      setTasks(tasks.filter(t => t.id !== id));
      toast.success('Task deleted successfully');
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.COMPLETED:
        return <Badge className="bg-green-100 text-green-700 border-green-200">Completed</Badge>;
      case TaskStatus.IN_PROGRESS:
        return <Badge className="bg-blue-100 text-blue-700 border-blue-200">In Progress</Badge>;
      default:
        return <Badge variant="outline" className="text-gray-500">Not Started</Badge>;
    }
  };

  // Helper lấy tên con để hiển thị trong list "Tất cả"
  const getChildNameById = (childId: string) => {
    const child = children.find(c => c.id === childId);
    return child ? `${child.firstName} (${child.lastName})` : 'Unknown';
  };

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: '#F7F4EE' }}>
      <div className="max-w-4xl mx-auto">
        <motion.div className="mb-8" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="mb-2 text-2xl font-bold text-[#333333]">Task Management</h1>
          <p className="text-[#666666]">Assign tasks and track progress for your children</p>
        </motion.div>

        {/* --- FORM GIAO NHIỆM VỤ (PHẦN TRÊN) --- */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="p-6 rounded-2xl border-0 mb-6 bg-white shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <Plus className="w-6 h-6 text-[#FFD966]" />
              <h2 className="text-lg font-semibold text-[#333333]">Assign New Task</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Chọn Child để giao bài */}
              <div className="col-span-1 md:col-span-2">
                <Label className="text-[#333333]">Assign to Child <span className="text-red-500">*</span></Label>
                <Select value={assignChildId} onValueChange={setAssignChildId}>
                  <SelectTrigger className="mt-1 bg-[#F7F4EE] border-0 h-12">
                    <SelectValue placeholder="Select a child account" />
                  </SelectTrigger>
                  <SelectContent>
                    {children.map((child) => (
                      <SelectItem key={child.id} value={child.id}>
                        {child.lastName} {child.firstName} (@{child.username})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Các input khác giữ nguyên */}
              <div className="col-span-1 md:col-span-2">
                <Label htmlFor="title" className="text-[#333333]">Title <span className="text-red-500">*</span></Label>
                <Input
                  id="title"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="e.g., Complete Math Homework..."
                  className="mt-1 bg-[#F7F4EE] border-0"
                />
              </div>

              <div className="col-span-1 md:col-span-2">
                <Label htmlFor="desc" className="text-[#333333]">Description</Label>
                <Textarea
                  id="desc"
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  placeholder="Details..."
                  className="mt-1 bg-[#F7F4EE] border-0 resize-none h-20"
                />
              </div>

              <div className="col-span-1">
                <Label htmlFor="dueDate" className="text-[#333333]">Due Date</Label>
                <Input
                  id="dueDate"
                  type="datetime-local"
                  value={newTaskDueDate}
                  onChange={(e) => setNewTaskDueDate(e.target.value)}
                  className="mt-1 bg-[#F7F4EE] border-0"
                />
              </div>
            </div>

            <Button
              onClick={addTask}
              disabled={loading}
              className="w-full md:w-auto bg-[#FFD966] text-[#333333] hover:bg-[#ffcf40]"
            >
              {loading ? 'Sending...' : 'Assign Task'}
            </Button>
          </Card>
        </motion.div>

        {/* --- TASK LIST (WITH SEPARATE FILTER) --- */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="p-6 rounded-2xl border-0 bg-white">
            
            {/* Header: Tiêu đề + Bộ lọc */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-[#333333]">Task List</h2>
                <Badge variant="secondary">{tasks.length}</Badge>
              </div>
              
              {/* Dropdown Lọc riêng cho danh sách */}
              <div className="flex items-center gap-2 w-full md:w-auto">
                <Filter className="w-4 h-4 text-gray-500" />
                <Select value={filterChildId} onValueChange={setFilterChildId}>
                  <SelectTrigger className="w-full md:w-[200px] bg-white border border-gray-200">
                    <SelectValue placeholder="Lọc theo bé" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Children</SelectItem>
                    {children.map((child) => (
                      <SelectItem key={child.id} value={child.id}>
                        {child.lastName} {child.firstName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Nội dung danh sách */}
            {tasks.length === 0 ? (
              <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-100 rounded-xl">
                <FileText className="w-10 h-10 mx-auto mb-2 opacity-20" />
                <p>No tasks found.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-4 rounded-xl bg-[#F7F4EE] border border-transparent hover:border-[#FFD966] transition-all group relative"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-[#333333]">{task.title}</h3>
                          {getStatusBadge(task.status)}
                        </div>
                        
                        {task.description && (
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">{task.description}</p>
                        )}
                        
                        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                          {/* Hiển thị tên bé thực hiện (quan trọng khi xem chế độ "Tất cả") */}
                          <span className="flex items-center gap-1 font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                            <User className="w-3 h-3" />
                            {getChildNameById(task.childId)}
                          </span>

                          {task.dueDate && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Hạn: {new Date(task.dueDate).toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <Button
                        onClick={() => deleteTask(task.id)}
                        variant="ghost"
                        size="icon"
                        className="text-gray-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
}