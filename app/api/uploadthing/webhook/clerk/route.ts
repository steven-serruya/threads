/* eslint-disable camelcase */
// Resource: https://clerk.com/docs/users/sync-data-to-your-backend
// Above article shows why we need webhooks i.e., to sync data to our backend

// Resource: https://docs.svix.com/receiving/verifying-payloads/why
// It's a good practice to verify webhooks. Above article shows why we should do it
import { Webhook, WebhookRequiredHeaders } from "svix";
import { headers } from "next/headers";

import { IncomingHttpHeaders } from "http";

import { NextResponse } from "next/server";
import {
  addMemberToCommunity,
  createCommunity,
  deleteCommunity,
  removeUserFromCommunity,
  updateCommunityInfo,
} from "@/lib/actions/community.actions";

// Resource: https://clerk.com/docs/integration/webhooks#supported-events
// Above document lists the supported events
type EventType =
  | "organization.created"
  | "organizationInvitation.created"
  | "organizationMembership.created"
  | "organizationMembership.deleted"
  | "organization.updated"
  | "organization.deleted";

type Event = {
  data: Record<string, string | number | Record<string, string>[]>;
  object: "event";
  type: EventType;
};

export const POST = async (request: Request) => {
  const payload = await request.json();
  
  // Await the headers to properly retrieve them
  const header = await headers();

  const heads = {
    "svix-id": header.get("svix-id"),
    "svix-timestamp": header.get("svix-timestamp"),
    "svix-signature": header.get("svix-signature"),
  };

  // Check if the necessary headers exist
  if (!heads["svix-id"] || !heads["svix-timestamp"] || !heads["svix-signature"]) {
    return NextResponse.json(
      { message: "Missing necessary headers" },
      { status: 400 }
    );
  }

  const wh = new Webhook(process.env.NEXT_CLERK_WEBHOOK_SECRET || "");

  let evnt: Event | null = null;

  try {
    evnt = wh.verify(
      JSON.stringify(payload),
      heads as IncomingHttpHeaders & WebhookRequiredHeaders
    ) as Event;
  } catch (err) {
    return NextResponse.json({ message: "Invalid webhook signature" }, { status: 400 });
  }

  const eventType: EventType = evnt?.type!;

  // Handle the webhook events as before
  if (eventType === "organization.created") {
    const { id, name, slug, logo_url, image_url, created_by } = evnt?.data ?? {};

    try {
      await createCommunity(
        id as string,
        name as string,
        slug as string,
        (logo_url || image_url) as string,
        "org bio",
        created_by as string
      );

      return NextResponse.json({ message: "User created" }, { status: 201 });
    } catch (err) {
      console.error(err);
      return NextResponse.json(
        { message: "Internal Server Error" },
        { status: 500 }
      );
    }
  }

  // Continue handling other event types...

  return NextResponse.json({ message: "Event not handled" }, { status: 400 });
};
