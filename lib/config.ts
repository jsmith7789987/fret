/**
 * Which integrations this deployment has credentials for.
 *
 * Every surface that needs to know whether a service is set up reads it from
 * here, so the checks cannot drift apart. Server-side only, except
 * isAuthConfigured, which the header also needs.
 */

export function isAuthConfigured(): boolean {
  return Boolean(
    process.env.CLERK_SECRET_KEY &&
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  );
}

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

export function isAnthropicConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function isStreamConfigured(): boolean {
  return Boolean(
    process.env.CLOUDFLARE_ACCOUNT_ID &&
    process.env.CLOUDFLARE_STREAM_API_TOKEN,
  );
}

export function isR2Configured(): boolean {
  return Boolean(
    process.env.CLOUDFLARE_R2_ACCESS_KEY_ID &&
    process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
  );
}

export function isTwilioConfigured(): boolean {
  return Boolean(process.env.TWILIO_ACCOUNT_SID);
}

export function isResendConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

export function isTypesenseConfigured(): boolean {
  return Boolean(process.env.TYPESENSE_HOST);
}

/** The full picture, for the health check. */
export function configuredServices() {
  return {
    database: isDatabaseConfigured(),
    clerk: isAuthConfigured(),
    anthropic: isAnthropicConfigured(),
    stripe: isStripeConfigured(),
    cloudflareStream: isStreamConfigured(),
    cloudflareR2: isR2Configured(),
    twilio: isTwilioConfigured(),
    resend: isResendConfigured(),
    typesense: isTypesenseConfigured(),
  };
}
