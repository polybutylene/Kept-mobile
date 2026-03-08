import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { auth } from "./auth";
import { Id } from "./_generated/dataModel";

const http = httpRouter();

auth.addHttpRoutes(http);

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// Stripe webhook endpoint — thin handler that forwards to Node.js internal action
http.route({
  path: "/stripe-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return new Response("Missing stripe-signature header", { status: 400 });
    }

    try {
      await ctx.runAction(internal.stripeWebhook.processWebhookEvent, {
        body,
        signature,
      });
      return new Response("OK", { status: 200 });
    } catch (err) {
      console.error("[stripe webhook] Processing error:", err);
      return new Response("OK", { status: 200 });
    }
  }),
});

// ============================================================
// Renter Service Request Portal — Public Endpoints
// ============================================================

// CORS preflight for all /service-portal endpoints
http.route({
  path: "/service-portal/validate",
  method: "OPTIONS",
  handler: httpAction(async () => new Response(null, { status: 204, headers: CORS_HEADERS })),
});

http.route({
  path: "/service-portal/submit",
  method: "OPTIONS",
  handler: httpAction(async () => new Response(null, { status: 204, headers: CORS_HEADERS })),
});

http.route({
  path: "/service-portal/upload",
  method: "OPTIONS",
  handler: httpAction(async () => new Response(null, { status: 204, headers: CORS_HEADERS })),
});

/**
 * Validate a service link and return property info.
 * GET /service-portal/validate?linkId=abc123
 */
http.route({
  path: "/service-portal/validate",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const linkId = url.searchParams.get("linkId");

    if (!linkId) {
      return new Response(
        JSON.stringify({ valid: false, reason: "missing_link_id" }),
        { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    const result = await ctx.runQuery(internal.serviceLinks.validateLinkInternal, { linkId });

    if (result.valid) {
      await ctx.runMutation(internal.serviceLinks.recordLinkAccess, { linkId });
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }),
});

/**
 * Submit a service request through the renter portal.
 * POST /service-portal/submit
 */
http.route({
  path: "/service-portal/submit",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();

      if (!body.linkId || !body.category || !body.title || !body.description || !body.renterName) {
        return new Response(
          JSON.stringify({ error: "Missing required fields" }),
          { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
        );
      }

      // Validate link
      const linkResult = await ctx.runQuery(internal.serviceLinks.validateLinkInternal, {
        linkId: body.linkId,
      });

      if (!linkResult.valid) {
        return new Response(
          JSON.stringify({ error: "Invalid or expired link", reason: linkResult.reason }),
          { status: 403, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
        );
      }

      // Check rate limit
      const rateLimit = await ctx.runQuery(internal.serviceRequests.checkPortalRateLimit, {
        linkId: body.linkId,
      });

      if (!rateLimit.allowed) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Max 5 requests per 24 hours." }),
          { status: 429, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
        );
      }

      // Create the request
      const { requestId } = await ctx.runMutation(
        internal.serviceRequests.submitPortalRequest,
        {
          homeId: linkResult.link!.propertyId,
          managerId: linkResult.link!.managerId,
          linkId: body.linkId,
          category: body.category,
          area: body.area || "other",
          title: body.title,
          description: body.description,
          urgency: body.urgency || "not_urgent",
          photoStorageIds: body.photoStorageIds,
          renterName: body.renterName,
          renterEmail: body.renterEmail,
          renterPhone: body.renterPhone,
          unitLabel: body.unitLabel,
          availableTimes: body.availableTimes,
          permissionToEnter: body.permissionToEnter ?? false,
        }
      );

      // Mark one-time links as used
      if (linkResult.link!.type === "one_time") {
        await ctx.runMutation(internal.serviceLinks.markLinkUsed, { linkId: body.linkId });
      }

      // Trigger AI triage asynchronously
      await ctx.scheduler.runAfter(0, internal.serviceRequestTriage.triageRequest, {
        requestId: requestId as Id<"serviceRequests">,
        homeId: linkResult.link!.propertyId,
        category: body.category,
        area: body.area || "other",
        title: body.title,
        description: body.description,
        urgency: body.urgency || "not_urgent",
      });

      return new Response(
        JSON.stringify({ success: true, requestId }),
        { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    } catch (err) {
      console.error("[service-portal] Submit error:", err);
      return new Response(
        JSON.stringify({ error: "Internal server error" }),
        { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }
  }),
});

/**
 * Upload a photo for a service request (public).
 * POST /service-portal/upload — multipart/form-data with "file" field
 */
http.route({
  path: "/service-portal/upload",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const blob = await request.blob();

      if (blob.size > 10 * 1024 * 1024) {
        return new Response(
          JSON.stringify({ error: "File too large. Maximum 10MB." }),
          { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
        );
      }

      const storageId = await ctx.storage.store(blob);

      return new Response(
        JSON.stringify({ storageId }),
        { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    } catch (err) {
      console.error("[service-portal] Upload error:", err);
      return new Response(
        JSON.stringify({ error: "Upload failed" }),
        { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }
  }),
});

export default http;
