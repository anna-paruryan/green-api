//src/api/green-api/types.ts
export interface GreenApiCredentials {
    idInstance: string
    apiTokenInstance: string
    apiUrl?: string
    mediaUrl?:string
}

export type StateInstance =
    | "authorized"
    | "notAuthorized"
    | "blocked"
    | "sleepMode"
    | "starting"

export interface StateInstanceResponse {
    stateInstance: StateInstance | string
}

export interface SendMessageRequest {
    chatId: string
    message: string
}

export interface SendMessageResponse {
    idMessage: string
}





export interface GreenApiError {
    statusCode?: number
    message: string
}