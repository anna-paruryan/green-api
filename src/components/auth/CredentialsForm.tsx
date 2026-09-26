import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { Eye, EyeOff, MessageCircle } from "lucide-react"
import { useGreenApi } from "../../context/GreenApiContext.tsx"
import { type CredentialsFormValues, credentialsSchema } from "../../schemas/credentials.schema.ts"
const apiUrl = import.meta.env.VITE_GREEN_API_URL
const mediaUrl = import.meta.env.VITE_GREEN_API_MEDIA_URL
const TOAST_ID='chat_form'
export function CredentialsForm() {
    const navigate = useNavigate()

    const { connect, isConnecting } = useGreenApi()

    const [showToken, setShowToken] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<CredentialsFormValues>({
        resolver: zodResolver(credentialsSchema),
        mode: "onChange",
        defaultValues: {
            idInstance: "",
            apiTokenInstance: "",
        },
    })

    const onSubmit = async (values: CredentialsFormValues) => {
        try {
            await connect({
                idInstance: values.idInstance,
                apiTokenInstance: values.apiTokenInstance,
                apiUrl,
                mediaUrl,
            })

            toast.success("Connected successfully",{id:TOAST_ID})
            navigate("/chat")
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : "Failed to connect to GREEN-API",{id:TOAST_ID, duration: 5000,},
            )
        }
    }

    const inputClass = (hasError: boolean) =>
        `h-11 sm:h-12 w-full rounded-[var(--max-radius-md)] border bg-[var(--max-surface-secondary)] px-4 text-[15px] text-[var(--max-text)] outline-none! transition placeholder:text-[var(--max-text-muted)] focus:outline-none! focus-visible:outline-none! focus:bg-[var(--max-surface)] focus:ring-2 ${
            hasError
                ? "border-red-400 focus:border-red-400 focus:ring-red-400/20"
                : "border-[var(--max-border)] focus:border-[var(--max-primary)] focus:ring-[var(--max-primary-soft)]"
        }`

    return (
        <div>
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="w-full max-w-md rounded-[var(--max-radius-lg)] bg-[var(--max-surface)] p-6 shadow-[var(--max-shadow)] sm:p-8"
                noValidate
            >
                <div className="mb-6 flex flex-col items-center text-center sm:mb-8">
                    <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-[var(--max-primary)] sm:size-16">
                        <MessageCircle className="size-7 text-white sm:size-8" strokeWidth={2} />
                    </div>

                    <h1 className="text-xl font-semibold tracking-tight text-[var(--max-text)] sm:text-2xl">
                        Connect to WhatsApp
                    </h1>

                    <p className="mt-1.5 text-sm text-[var(--max-text-secondary)]">
                        Enter your GREEN-API credentials
                    </p>
                </div>

                <div className="space-y-4">
                    {/* ID INSTANCE */}
                    <div>
                        <label
                            htmlFor="idInstance"
                            className="mb-1.5 block text-sm font-medium text-[var(--max-text)]"
                        >
                            ID Instance
                        </label>

                        <input
                            id="idInstance"
                            {...register("idInstance")}
                            placeholder="710722745916"
                            autoComplete="off"
                            className={inputClass(!!errors.idInstance)}
                        />

                        {errors.idInstance && (
                            <p role="alert" className="mt-1.5 text-xs text-red-500">
                                {errors.idInstance.message}
                            </p>
                        )}
                    </div>

                    {/* API TOKEN */}
                    <div>
                        <label
                            htmlFor="apiTokenInstance"
                            className="mb-1.5 block text-sm font-medium text-[var(--max-text)]"
                        >
                            API Token
                        </label>

                        <div className="relative">
                            <input
                                id="apiTokenInstance"
                                type={showToken ? "text" : "password"}
                                {...register("apiTokenInstance")}
                                placeholder="Your API token"
                                autoComplete="off"
                                className={`${inputClass(!!errors.apiTokenInstance)} pr-11`}
                            />

                            <button
                                type="button"
                                onClick={() => setShowToken((value) => !value)}
                                aria-label={showToken ? "Hide token" : "Show token"}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--max-text-muted)] outline-none! transition hover:text-[var(--max-text)] focus-visible:outline-none!"
                            >
                                {showToken ? (
                                    <EyeOff className="size-[18px]" />
                                ) : (
                                    <Eye className="size-[18px]" />
                                )}
                            </button>
                        </div>

                        {errors.apiTokenInstance && (
                            <p role="alert" className="mt-1.5 text-xs text-red-600">
                                {errors.apiTokenInstance.message}
                            </p>
                        )}
                    </div>

                    {/* SUBMIT */}
                    <button
                        type="submit"
                        disabled={isConnecting}
                        className="mt-2 h-11 w-full rounded-[var(--max-radius-md)] bg-[var(--max-primary)] font-medium text-white outline-none! transition hover:bg-[var(--max-primary-hover)] focus-visible:outline-none! focus-visible:ring-2 focus-visible:ring-[var(--max-primary-soft)] disabled:cursor-not-allowed disabled:opacity-50 sm:h-12"
                    >
                        {isConnecting ? "Connecting..." : "Connect"}
                    </button>
                </div>
            </form>
        </div>
    )
}