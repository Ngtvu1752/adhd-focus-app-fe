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
const authApi = {
    login: (payload: LoginPayload) => {
        return axiosClient.post('/auth/login', payload);
    },
    signup: (payload: SignupPayload) => {
        return axiosClient.post('/auth/register', payload);
    },
    getProfile: () => {
        return axiosClient.get('/auth/profile');
    },
    getChildren: () => {
        return axiosClient.get('/supervisors/my-children');
    },
    createChild: (payload: CreateChildPayload) => {
        return axiosClient.post('/supervisors/my-children', payload);
    }
};

export default authApi;