import twilio from "twilio";

let client: twilio.Twilio | null = null;

function getClient(): twilio.Twilio {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    throw new Error("Twilio credentials are not set");
  }
  if (!client) {
    client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN,
    );
  }
  return client;
}

export async function sendMatchAlert(
  to: string,
  listing: {
    brand: string;
    model: string;
    year?: number | null;
    price: number;
    id: string;
  },
) {
  const guitarName = [listing.year, listing.brand, listing.model]
    .filter(Boolean)
    .join(" ");
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/listing/${listing.id}`;

  await getClient().messages.create({
    body: `fret. match: ${guitarName} just listed at $${listing.price.toLocaleString()}. View it: ${url}`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to,
  });
}
