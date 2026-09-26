import {CredentialsForm} from "../../components/auth/CredentialsForm.tsx";


export default function LoginPage() {
    return (
        <main className="flex min-h-dvh items-center justify-center bg-[var(--max-bg)] px-4 py-8">
            <section className="w-full max-w-md rounded-2xl border border-[var(--max-border)] bg-[var(--max-surface)] p-6 shadow-[var(--max-shadow)] sm:p-8">
                <CredentialsForm />
            </section>
        </main>
    )
}