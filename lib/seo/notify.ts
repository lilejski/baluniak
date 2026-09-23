import { Resend } from "resend";

/**
 * A line to the owner about what the weekly run did.
 *
 * The pipeline used to be silent in both directions: a successful run relied
 * on GitHub's own pull-request notification, and a failed one left nothing
 * but a log entry nobody reads. A scheduled job that can fail quietly is a
 * job you find out about weeks later, by noticing the blog has not grown.
 *
 * Sending is best effort — a mail that cannot go out must never turn a
 * successful run into a failed one.
 */

const FROM = "Łukasz Bałuniak <lukasz@baluniak.com>";
const OWNER_EMAIL = "lukasz@baluniak.com";

export async function notifyOwner(subject: string, body: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[seo/notify] RESEND_API_KEY is not set — skipping", subject);
    return;
  }

  try {
    const { error } = await new Resend(apiKey).emails.send({
      from: FROM,
      to: OWNER_EMAIL,
      subject,
      text: body,
    });
    if (error) console.error("[seo/notify]", error);
  } catch (err) {
    console.error("[seo/notify]", err);
  }
}
