import axiosClient from "./axiosClient";
interface PomodoroSession {
    id?: string;             
    childId: string;        
    startTime: string;      
    endTime?: string;       
    focusMinutes: number;   
    breakMinutes: number;   
    createdAt?: string;
}


const pomodoroApi = {
    createPomodoroSession: (session: PomodoroSession) => {
        return axiosClient.post('/pomodoros', session) as Promise<PomodoroSession>;
    },
    getSessionsByChild: (childId: string) => {
        return axiosClient.get(`/pomodoros/child/${childId}`) as Promise<PomodoroSession[]>;
    },
    getPomodoroSessionById: (id: string) => {
        return axiosClient.get(`/pomodoros/${id}`) as Promise<PomodoroSession>;
    },
    updatePomodoroSession: (id: string, session: Partial<PomodoroSession>) => {
        return axiosClient.put(`/pomodoros/${id}`, session) as Promise<PomodoroSession>;
    }

};

export default pomodoroApi;