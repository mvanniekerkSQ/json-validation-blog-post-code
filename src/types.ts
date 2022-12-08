enum EventType {
    INIT = "init",
    QUOTE = "quote",
    MATCH = "match",
}

type EventBase = {
    eventType: EventType,
    /**
     * @format date-time
     */
    createdAt: string,
    /**
     * @format uuid
     */
    id: string,
    version: "1.0.0",
}

export type RfqEvent
    = EventInit
    | EventQuote
    | EventMatch
    ;

export interface EventInit extends EventBase {
    eventType: EventType.INIT,
    product: string,
    /**
     * @minimum 1
     * @asType integer
     */
    quantity: number,
    price: number,
    createdBy: string,
}

interface EventQuote extends EventBase {
    eventType: EventType.QUOTE,
    price: number,
    createdBy: string,
    /**
     * @format uuid
     */
    initId: string,
}

interface EventMatch extends EventBase {
    eventType: EventType.MATCH,
    /**
     * @format uuid
     */
    quoteId: string,
    /**
     * @format uuid
     */
    initId: string,
}
