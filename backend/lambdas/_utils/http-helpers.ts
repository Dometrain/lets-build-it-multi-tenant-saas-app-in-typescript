
const allowedOrigins = [`https://${process.env.DOMAIN_NAME}`, "http://localhost:5173"]

function corsHeaders(origin: string) {
    return {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Credentials": true
    };
}

export function okResponse<T>(body: T, httpEvent: {
    headers: {
        [name: string]: string | undefined
    }
}) {
    const origin = httpEvent.headers['origin'];
    const corsValue = (origin && allowedOrigins.includes(origin)) ? origin : allowedOrigins[0];
    return {
        statusCode: 200,
        headers: corsHeaders(corsValue),
        body: JSON.stringify(body)
    };
}


export function statusCodeResponse(statusCode: number, httpEvent: {
    headers: {
        [name: string]: string | undefined
    }
}) {
    const origin = httpEvent.headers['origin'];
    const corsValue = (origin && allowedOrigins.includes(origin)) ? origin : allowedOrigins[0];
    return {
        statusCode: statusCode,
        headers: corsHeaders(corsValue),
    };
}
