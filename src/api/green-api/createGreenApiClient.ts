//src/api/green-api/createGreenApiClient.ts
import { AccountApi } from "./account"
import { GreenApiClient } from "./client"
import { MessagesApi } from "./messages"
import type { GreenApiCredentials } from "./types"

export function createGreenApiClient(
    credentials: GreenApiCredentials,
) {
    const client = new GreenApiClient(credentials)

    return {
        account: new AccountApi(client),
        messages: new MessagesApi(client),
    }
}