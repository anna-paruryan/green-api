import type {
    SendMessageRequest,
    SendMessageResponse,
} from "./types"

import { GreenApiClient } from "./client"

export class MessagesApi {
    private readonly client: GreenApiClient

    constructor(client: GreenApiClient) {
        this.client = client
    }

    sendMessage(
        data: SendMessageRequest,
    ): Promise<SendMessageResponse> {
        return this.client.post<SendMessageResponse>(
            "sendMessage",
            data,
        )
    }
}