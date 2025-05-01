export async function checkSubscription(userId) {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/check-subscription`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  });
  return res.json();
}

export async function createCheckoutSession(userId, priceId, email) {
  const res = await fetch(
    `${import.meta.env.VITE_API_URL}/create-checkout-session`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, priceId, email }),
    }
  );
  return res.json();
}