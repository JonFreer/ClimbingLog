export class APIError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "APIError";
  }
}

export async function API(method: string, url: string, data = undefined) {
  const token = localStorage.getItem("token");
  const resp = await fetch(`${url}`, {
    method,
    credentials: "include",
    headers: Object.assign(
      { Authorization: `Bearer ${token}` },
      data ? { "Content-Type": "application/json" } : null
    ),
    body: data ? JSON.stringify(data) : undefined,
  });
  const body = await resp.json();
  if (!resp.ok) {
    if (body.details) {
      throw new APIError(resp.status, body.details || "An error occurred");
    } else {
      throw new APIError(resp.status, resp.statusText);
    }
  }

  return { resp, data: body };
}
