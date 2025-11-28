import axiosClient from "./axiosClient";
interface LoginPayload {
    username: string;
    password: string;
    role: 'SUPERVISOR' | 'CHILD';
}
interface SignupPayload {
    name: string;
    email: string;
    password: string;
    role: 'SUPERVISOR' | 'CHILD';
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
    }
};

export default authApi;