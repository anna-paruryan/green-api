import type {
    GreenApiCredentials,
    GreenApiError,
} from "./types"

export class GreenApiClient {
    private readonly baseUrl: string
    private readonly idInstance: string
    private readonly apiTokenInstance: string

    constructor(credentials: GreenApiCredentials) {
        this.idInstance = credentials.idInstance
        this.apiTokenInstance = credentials.apiTokenInstance

        this.baseUrl = this.normalizeBaseUrl(
            credentials.apiUrl,
        )
    }

    private normalizeBaseUrl(apiUrl?: string): string {
        if (!apiUrl) {
            throw new Error("GREEN-API URL is required")
        }

        return apiUrl.replace(/\/+$/, "")
    }

    private buildUrl(
        method: string,
        extraPath = "",
    ): string {
        return [
            this.baseUrl,
            `waInstance${this.idInstance}`,
            method,
            this.apiTokenInstance,
        ].join("/") + extraPath
    }

    async get<T>(
        method: string,
        extraPath = "",
    ): Promise<T> {
        const response = await fetch(
            this.buildUrl(method, extraPath),
        )

        return this.handleResponse<T>(response)
    }

    async post<T>(
        method: string,
        body: unknown,
    ): Promise<T> {
        const response = await fetch(
            this.buildUrl(method),
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            },
        )

        return this.handleResponse<T>(response)
    }

    async delete<T>(
        method: string,
        extraPath = "",
    ): Promise<T> {
        const response = await fetch(
            this.buildUrl(method, extraPath),
            {
                method: "DELETE",
            },
        )

        return this.handleResponse<T>(response)
    }

    private async handleResponse<T>(
        response: Response,
    ): Promise<T> {
        if (!response.ok) {
            throw await this.createError(response)
        }

        const text = await response.text()

        if (!text) {
            return null as T
        }

        return JSON.parse(text) as T
    }

    private async createError(
        response: Response,
    ): Promise<GreenApiError> {
        let message =
            response.statusText || "Unknown error"

        try {
            const data = await response.json()

            if (typeof data?.message === "string") {
                message = data.message
            } else if (typeof data?.error === "string") {
                message = data.error
            }
        } catch {
            // Response body is not JSON.
        }

        return {
            statusCode: response.status,
            message,
        }
    }
}