import { GreenApiClient } from "./client"
import type { StateInstanceResponse } from "./types"

export class AccountApi {
    private readonly client: GreenApiClient

    constructor(client: GreenApiClient) {
        this.client = client
    }

    getStateInstance(): Promise<StateInstanceResponse> {
        return this.client.get<StateInstanceResponse>(
            "getStateInstance",
        )
    }
}