const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function apiGet(endpoint) {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function apiPost(endpoint, data) {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
}