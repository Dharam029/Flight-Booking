const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const getHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` } : { "Content-Type": "application/json" };
};

const handleResponse = async (response) => {
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "An error occurred");
    return data;
};

export const api = {
    register: async (data) => {
        const res = await fetch(`${API_URL}/auth/register`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
        return handleResponse(res);
    },

    login: async (data) => {
        const res = await fetch(`${API_URL}/auth/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
        return handleResponse(res);
    },

    getProfile: async () => {
        const res = await fetch(`${API_URL}/auth/profile`, { headers: getHeaders() });
        return handleResponse(res);
    },

    getFlights: async () => {
        const res = await fetch(`${API_URL}/flights`, { headers: getHeaders() });
        return handleResponse(res);
    },

    searchFlights: async (params) => {
        const query = new URLSearchParams(params).toString();
        const res = await fetch(`${API_URL}/flights/search?${query}`, { headers: getHeaders() });
        return handleResponse(res);
    },

    getFlight: async (id) => {
        const res = await fetch(`${API_URL}/flights/${id}`, { headers: getHeaders() });
        return handleResponse(res);
    },

    addFlight: async (data) => {
        const res = await fetch(`${API_URL}/flights`, { method: "POST", headers: getHeaders(), body: JSON.stringify(data) });
        return handleResponse(res);
    },

    updateFlight: async (id, data) => {
        const res = await fetch(`${API_URL}/flights/${id}`, { method: "PUT", headers: getHeaders(), body: JSON.stringify(data) });
        return handleResponse(res);
    },

    cancelFlight: async (id, message) => {
        const res = await fetch(`${API_URL}/flights/${id}/cancel`, { method: "POST", headers: getHeaders(), body: JSON.stringify({ message }) });
        return handleResponse(res);
    },

    deleteFlight: async (id) => {
        const res = await fetch(`${API_URL}/flights/${id}`, { method: "DELETE", headers: getHeaders() });
        return handleResponse(res);
    },

    bookFlight: async (data) => {
        const res = await fetch(`${API_URL}/bookings`, { method: "POST", headers: getHeaders(), body: JSON.stringify(data) });
        return handleResponse(res);
    },

    getMyBookings: async () => {
        const res = await fetch(`${API_URL}/bookings/my`, { headers: getHeaders() });
        return handleResponse(res);
    },

    requestCancel: async (id, reason) => {
        const res = await fetch(`${API_URL}/bookings/${id}/cancel`, { method: "POST", headers: getHeaders(), body: JSON.stringify({ reason }) });
        return handleResponse(res);
    },

    getAllBookings: async () => {
        const res = await fetch(`${API_URL}/admin/bookings`, { headers: getHeaders() });
        return handleResponse(res);
    },

    getCancelRequests: async () => {
        const res = await fetch(`${API_URL}/admin/cancellations`, { headers: getHeaders() });
        return handleResponse(res);
    },

    approveCancel: async (bookingId) => {
        const res = await fetch(`${API_URL}/admin/cancellations/${bookingId}/approve`, { method: "POST", headers: getHeaders() });
        return handleResponse(res);
    },

    rejectCancel: async (bookingId) => {
        const res = await fetch(`${API_URL}/admin/cancellations/${bookingId}/reject`, { method: "POST", headers: getHeaders() });
        return handleResponse(res);
    },
};
