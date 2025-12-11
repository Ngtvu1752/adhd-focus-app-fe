import axiosClient from "./axiosClient";
interface LoginPayload {
    username: string;
    password: string;
    role: 'SUPERVISOR' | 'CHILD';
}
interface SignupPayload {
    username: string;
    firstName: string;
    lastName: string;
    password: string;
    role: 'SUPERVISOR' | 'CHILD';
}
interface CreateChildPayload {
  username: string;
  firstName: string;
  lastName: string;
  password: string;
}
interface User {
  id?: string;
  username: string; // Đổi từ email sang username
  name: string;
  role: 'parent' | 'child';
  totalPoints: number;
  userLevel: number;
  currentStreak: number;
}

const authApi = {
    login: (payload: LoginPayload) => {
        return axiosClient.post('/auth/login', payload);
    },
    signup: (payload: SignupPayload) => {
        return axiosClient.post('/auth/register', payload);
    },
    getProfile: () => {
        return axiosClient.get('/users/my') as Promise<User>; 
    },
    getChildren: () => {
        return axiosClient.get('/supervisors/my-children');
    },
    createChild: (payload: CreateChildPayload) => {
        return axiosClient.post('/supervisors/my-children', payload);
    }
};

export default authApi;