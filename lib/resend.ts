import { Resend } from "resend";
import { guitarTitle } from "./format";

let client: Resend | null = null;

function getClient(): Resend {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not set");
  }
  if (!client) {
    client = new Resend(process.env.RESEND_API_KEY);
  }
  return client;
}

const FROM = "fret. <hello@fret.market>";

export async function sendMatchEmail(
  to: string,
  listing: {
    brand: string;
    model: string;
    year?: number | null;
    price: number;
    id: string;
  },
) {
  const guitarName = guitarTitle(listing);
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/listing/${listing.id}`;

  await getClient().emails.send({
    from: FROM,
    to,
    subject: `fret. match: ${guitarName}`,
    html: `
      <div style="font-family: -apple-system, Inter, sans-serif; color:#111110;">
        <p style="font-size:18px;">A new guitar matched your profile.</p>
        <p style="font-size:22px; font-weight:600;">${guitarName}</p>
        <p style="font-size:18px;">$${listing.price.toLocaleString()}</p>
        <p><a href="${url}" style="background:#111110;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none;">View listing</a></p>
      </div>
    `,
  });
}

export async function sendContactEmail(
  to: string,
  from: string,
  message: string,
  listing: { brand: string; model: string; id: string },
) {
  const guitarName = `${listing.brand} ${listing.model}`;
  await getClient().emails.send({
    from: FROM,
    replyTo: from,
    to,
    subject: `fret. inquiry: ${guitarName}`,
    html: `
      <div style="font-family: -apple-system, Inter, sans-serif; color:#111110;">
        <p>You have a new inquiry on your <strong>${guitarName}</strong> listing.</p>
        <p style="white-space:pre-wrap;border-left:3px solid #C17A2A;padding-left:12px;">${message}</p>
        <p>Reply to: ${from}</p>
      </div>
    `,
  });
}
