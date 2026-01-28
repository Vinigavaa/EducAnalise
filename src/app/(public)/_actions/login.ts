"use server"

import { signIn } from '../../../lib/auth'

export const handleRegister = (provider: string) => signIn(provider, { redirectTo: "/dashboard" })