// app/api/auth/[...nextauth]/route.ts
import { handlers } from "@/auth"; // Referring to root auth.ts
export const { GET, POST } = handlers;
