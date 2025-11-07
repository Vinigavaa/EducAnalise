import {DefaultSession} from "next-auth"

declare module "next-auth" {
    interface Session {
        user: User & DefaultSession["user"];
    }
}

interface User{
    id: string,
    name: string,
    email: string,
    emailVerified?: null | string | boolean,
    image?: string,
    stripe_customer_id?: string,
    times: string[],
    status: boolean,
    created_at: string,
    updated_at: string
}

    