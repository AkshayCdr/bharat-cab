declare global {
    namespace NodeJS {
        interface ProcessEnv {
            DB_USER: string;
            DB_HOST: string;
            DB_DATABASE: string;
            DB_PASSWORD: string;
            DB_PORT: string;
            PORT: string;
        }
    }
}

export {};
