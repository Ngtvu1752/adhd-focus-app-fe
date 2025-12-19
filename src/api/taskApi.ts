// src/api/taskApi.ts
import axiosClient from './axiosClient';

// Định nghĩa kiểu dữ liệu cho Task (theo yêu cầu mới)
export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED'
}
export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  childId: string;
  status: TaskStatus;
  startTime?: string;
  endTime?: string;
}

// Định nghĩa Payload gửi lên khi tạo mới
interface CreateTaskPayload {
  title: string;
  description?: string;
  dueDate?: string; // Format: 2025-12-15T17:00:00Z
  childId: string;
}

interface UpdateStatusPayload {
  taskId: string;
  status: TaskStatus;
}

const taskApi = {
  getTasksBySupervisor: (supervisorId: string) => {
    return axiosClient.get(`/tasks/supervisor/${supervisorId}`) as Promise<Task[]>;
  },

  getTasksByFilter: (childId: string) => {
    return axiosClient.get('/tasks', {
      params: { childId }
    }) as Promise<Task[]>;
  },

  getTaskDetail: (id: string) => {
    return axiosClient.get(`/tasks/${id}`) as Promise<Task>;
  },

  getTasksByChildId: (childId: string) => {
    return axiosClient.get(`/tasks/child/${childId}`) as Promise<Task[]>;
  },

  // 5. PATCH /tasks/status
  // Cập nhật trạng thái nhiệm vụ (Backend tự log time)
  updateStatus: (taskId: string, status: TaskStatus) => {
    return axiosClient.patch('/tasks/status', {
      id: taskId, 
      status: status
    }) as Promise<Task>;
  },

  
  // POST /tasks
  create: (data: CreateTaskPayload) => {
    return axiosClient.post('/tasks', data) as Promise<Task>;
  },

  // DELETE /tasks/:id
  delete: (id: string) => {
    return axiosClient.delete(`/tasks/${id}`);
  }
};

export default taskApi;