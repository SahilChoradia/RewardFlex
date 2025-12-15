import API_BASE from "./api";

interface FetchOptions extends RequestInit {
    credentials?: RequestCredentials;
}

export const adminFetch = async (url: string, options: FetchOptions = {}) => {
    const fullUrl = `${API_BASE}${url.startsWith("/") ? url : `/${url}`}`;

    const defaultHeaders = {
        "Content-Type": "application/json",
    };

    const config = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
        credentials: "include" as RequestCredentials, // FORCE credentials
    };

    const response = await fetch(fullUrl, config);

    if (response.status === 401) {
        // Handle unauthorized (e.g., redirect to login if not handled by page)
        // But we let the page handle it usually
        console.warn("Unauthorized access to admin API");
    }

    return response;
};
