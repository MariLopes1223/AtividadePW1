declare namespace Express{
    export interface Request{
        user: User;
    }
    type User = {
        id: String;
        name: string;
        username: string;
        tecnologias: Technology[];
    }
}