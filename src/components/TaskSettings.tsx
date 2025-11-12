import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus, Trash2, Clock, CheckCircle2, Edit2, Save } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';

interface Task {
  id: string;
  title: string;
  duration: number;
  completed: boolean;
}

export function TaskSettings() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDuration, setNewTaskDuration] = useState('25');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDuration, setEditDuration] = useState('25');
  const [defaultDuration, setDefaultDuration] = useState('25');

  useEffect(() => {
    loadTasks();
    const savedDefault = localStorage.getItem('defaultDuration') || '25';
    setDefaultDuration(savedDefault);
  }, []);

  const loadTasks = () => {
    const savedTasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    setTasks(savedTasks);
  };

  const saveTasks = (updatedTasks: Task[]) => {
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
    setTasks(updatedTasks);
  };

  const addTask = () => {
    if (!newTaskTitle.trim()) {
      toast.error('Please enter a task title');
      return;
    }

    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      duration: parseInt(newTaskDuration),
      completed: false
    };

    const updatedTasks = [...tasks, newTask];
    saveTasks(updatedTasks);
    setNewTaskTitle('');
    setNewTaskDuration('25');
    toast.success('Task added successfully! 🎉');
  };

  const deleteTask = (id: string) => {
    const updatedTasks = tasks.filter(task => task.id !== id);
    saveTasks(updatedTasks);
    toast.success('Task deleted');
  };

  const startEdit = (task: Task) => {
    setEditingId(task.id);
    setEditTitle(task.title);
    setEditDuration(task.duration.toString());
  };

  const saveEdit = (id: string) => {
    if (!editTitle.trim()) {
      toast.error('Task title cannot be empty');
      return;
    }

    const updatedTasks = tasks.map(task =>
      task.id === id
        ? { ...task, title: editTitle, duration: parseInt(editDuration) }
        : task
    );
    saveTasks(updatedTasks);
    setEditingId(null);
    toast.success('Task updated! ✅');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
    setEditDuration('25');
  };

  const saveDefaultDuration = () => {
    localStorage.setItem('defaultDuration', defaultDuration);
    toast.success('Default duration saved! ⏱️');
  };

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: '#F7F4EE' }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="mb-2" style={{ color: '#333333' }}>
            Task & Timer Settings
          </h1>
          <p style={{ color: '#666666' }}>
            Manage tasks and configure Pomodoro timer settings for your child
          </p>
        </motion.div>

        {/* Default Timer Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6 rounded-2xl border-0 mb-6" style={{ backgroundColor: '#E8F5FF' }}>
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-6 h-6" style={{ color: '#333333' }} />
              <h2 style={{ color: '#333333' }}>Default Timer Settings</h2>
            </div>
            
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <Label htmlFor="defaultDuration" style={{ color: '#333333' }}>
                  Default Focus Duration (minutes)
                </Label>
                <Select value={defaultDuration} onValueChange={setDefaultDuration}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 minutes</SelectItem>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="20">20 minutes</SelectItem>
                    <SelectItem value="25">25 minutes (recommended)</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={saveDefaultDuration}
                style={{ 
                  backgroundColor: '#FFD966',
                  color: '#333333'
                }}
              >
                <Save className="w-4 h-4 mr-2" />
                Save Default
              </Button>
            </div>
            
            <p className="mt-4 text-sm" style={{ color: '#666666' }}>
              ℹ️ Break duration is automatically set to 5 minutes after each focus session
            </p>
          </Card>
        </motion.div>

        {/* Add New Task */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6 rounded-2xl border-0 mb-6" style={{ backgroundColor: 'white' }}>
            <div className="flex items-center gap-3 mb-4">
              <Plus className="w-6 h-6" style={{ color: '#FFD966' }} />
              <h2 style={{ color: '#333333' }}>Add New Task</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="taskTitle" style={{ color: '#333333' }}>
                  Task Title
                </Label>
                <Input
                  id="taskTitle"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="e.g., Math homework, Reading practice..."
                  className="mt-2"
                  onKeyPress={(e) => e.key === 'Enter' && addTask()}
                />
              </div>

              <div>
                <Label htmlFor="taskDuration" style={{ color: '#333333' }}>
                  Duration (minutes)
                </Label>
                <Select value={newTaskDuration} onValueChange={setNewTaskDuration}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 min</SelectItem>
                    <SelectItem value="15">15 min</SelectItem>
                    <SelectItem value="20">20 min</SelectItem>
                    <SelectItem value="25">25 min</SelectItem>
                    <SelectItem value="30">30 min</SelectItem>
                    <SelectItem value="45">45 min</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              onClick={addTask}
              className="mt-4 w-full md:w-auto"
              size="lg"
              style={{ 
                backgroundColor: '#FFD966',
                color: '#333333'
              }}
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Task
            </Button>
          </Card>
        </motion.div>

        {/* Task List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6 rounded-2xl border-0" style={{ backgroundColor: 'white' }}>
            <div className="flex items-center gap-3 mb-6">
              <CheckCircle2 className="w-6 h-6" style={{ color: '#DFF7E8' }} />
              <h2 style={{ color: '#333333' }}>Current Tasks</h2>
            </div>

            {tasks.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-xl mb-2" style={{ color: '#333333' }}>
                  No tasks yet
                </p>
                <p style={{ color: '#666666' }}>
                  Add tasks above to get started
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {tasks.map((task, index) => (
                  <motion.div
                    key={task.id}
                    className="p-4 rounded-xl"
                    style={{ backgroundColor: '#F7F4EE' }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.05 }}
                  >
                    {editingId === task.id ? (
                      <div className="space-y-3">
                        <Input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          placeholder="Task title"
                        />
                        <div className="flex gap-3">
                          <Select value={editDuration} onValueChange={setEditDuration}>
                            <SelectTrigger className="flex-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="10">10 min</SelectItem>
                              <SelectItem value="15">15 min</SelectItem>
                              <SelectItem value="20">20 min</SelectItem>
                              <SelectItem value="25">25 min</SelectItem>
                              <SelectItem value="30">30 min</SelectItem>
                              <SelectItem value="45">45 min</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            onClick={() => saveEdit(task.id)}
                            style={{ backgroundColor: '#DFF7E8', color: '#333333' }}
                          >
                            <Save className="w-4 h-4 mr-2" />
                            Save
                          </Button>
                          <Button
                            onClick={cancelEdit}
                            variant="outline"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="mb-1" style={{ color: '#333333' }}>
                            {task.title}
                          </h3>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" style={{ color: '#666666' }} />
                            <span className="text-sm" style={{ color: '#666666' }}>
                              {task.duration} minutes
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => startEdit(task)}
                            variant="outline"
                            size="sm"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => deleteTask(task.id)}
                            variant="outline"
                            size="sm"
                            style={{ color: '#ef4444' }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </Card>
        </motion.div>

        {/* Tips */}
        <motion.div
          className="mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-6 rounded-2xl border-0" style={{ backgroundColor: '#DFF7E8' }}>
            <h3 className="mb-3" style={{ color: '#333333' }}>
              💡 Tips for Success
            </h3>
            <ul className="space-y-2" style={{ color: '#333333' }}>
              <li>• Start with shorter durations (10-15 min) for younger children</li>
              <li>• Gradually increase focus time as your child builds concentration skills</li>
              <li>• Be specific with task titles to help your child understand what to focus on</li>
              <li>• Encourage regular breaks between focus sessions for better retention</li>
              <li>• Celebrate achievements and review progress together regularly</li>
            </ul>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
