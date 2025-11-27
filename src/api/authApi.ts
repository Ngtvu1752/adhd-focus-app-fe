import axiosClient from "./axiosClient";
interface LoginPayload {
    email: string;
    password: string;
}
interface SignupPayload {
    name: string;
    email: string;
    password: string;
    role: 'supervisor' | 'user';
}

const authApi = {
    login: (payload: LoginPayload) => {
        return axiosClient.post('/auth/login', payload);
    },
    signup: (payload: SignupPayload) => {
        return axiosClient.post('/auth/signup', payload);
    },
    getProfile: () => {
        return axiosClient.get('/auth/profile');
    }
};

export default authApi;