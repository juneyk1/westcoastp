export async function checkSubscription(userId) {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/check-subscription`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  });
  if (!res.ok) throw new Error('Subscription check failed');
  return res.json();
}

export async function createSetupIntent(priceId) {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/create-subscription-intent`, {
    method: 'POST',
    headers:{ 'Content-Type':'application/json' },
    body: JSON.stringify({ priceId })
  });
  if (!res.ok) throw new Error('Failed to init payment');
  return res.json(); 
}

export async function createSubscription({ paymentMethodId, priceId, customerInfo }) {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/create-subscription`, {
    method:'POST',
    headers:{ 'Content-Type':'application/json' },
    body: JSON.stringify({ paymentMethodId, priceId, customerInfo })
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error || 'Subscription failed');
  return body;
}