import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs';

export async function POST(req: Request) {
  // Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your webhook secret
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || '');

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occured', {
      status: 400
    });
  }

  // Handle the webhook
  const eventType = evt.type;

  if (eventType === 'user.created' || eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name, public_metadata } = evt.data;
    
    // Check subscription status
    if (public_metadata.subscription_end && typeof public_metadata.subscription_end === 'string') {
      const endDate = new Date(public_metadata.subscription_end);
      const today = new Date();
      
      if (endDate < today) {
        // Lock the user if subscription has expired
        await clerkClient.users.updateUser(id, {
          privateMetadata: {
            ...evt.data.private_metadata,
            locked: true
          }
        });

        // Revoke all sessions
        const sessions = await clerkClient.sessions.getSessionList({ userId: id });
        for (const session of sessions) {
          await clerkClient.sessions.revokeSession(session.id);
        }
      }
    }
  }

  return NextResponse.json({ success: true });
} 