"use node";

import { v } from "convex/values";
import { internalAction } from "./_generated/server";

// Define the return type for email/SMS results
type NotificationResult = { success: boolean; error?: string; messageId?: string; messageSid?: string };

/**
 * Send an email via Resend API
 */
export const sendEmail = internalAction({
  args: {
    to: v.string(),
    subject: v.string(),
    body: v.string(),
    from: v.optional(v.string()),
  },
  handler: async (_ctx, args): Promise<NotificationResult> => {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn("RESEND_API_KEY not configured - email not sent");
      return { success: false, error: "Email not configured" };
    }

    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: args.from || "Kept <noreply@kept.app>",
          to: [args.to],
          subject: args.subject,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #0D9488, #0F766E); padding: 20px; border-radius: 12px 12px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 24px;">Kept</h1>
              </div>
              <div style="background: #fff; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
                ${args.body}
              </div>
              <p style="color: #6b7280; font-size: 12px; margin-top: 16px; text-align: center;">
                This email was sent by Kept. If you didn't expect this, please ignore it.
              </p>
            </div>
          `,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error("Resend API error:", error);
        return { success: false, error };
      }

      const data = await response.json();
      return { success: true, messageId: data.id };
    } catch (error: any) {
      console.error("Email send error:", error);
      return { success: false, error: error.message };
    }
  },
});

/**
 * Send an SMS via Twilio API
 */
export const sendSMS = internalAction({
  args: {
    to: v.string(),
    body: v.string(),
  },
  handler: async (_ctx, args): Promise<NotificationResult> => {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !fromNumber) {
      console.warn("Twilio not configured - SMS not sent");
      return { success: false, error: "SMS not configured" };
    }

    try {
      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            From: fromNumber,
            To: args.to,
            Body: args.body,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        console.error("Twilio API error:", error);
        return { success: false, error };
      }

      const data = await response.json();
      return { success: true, messageSid: data.sid };
    } catch (error: any) {
      console.error("SMS send error:", error);
      return { success: false, error: error.message };
    }
  },
});

// Helper function for sending emails (avoids circular reference in internalActions)
async function callResendApi(
  to: string,
  subject: string,
  body: string,
  from?: string
): Promise<NotificationResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("RESEND_API_KEY not configured - email not sent");
    return { success: false, error: "Email not configured" };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: from || "Kept <noreply@kept.app>",
        to: [to],
        subject,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #0D9488, #0F766E); padding: 20px; border-radius: 12px 12px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 24px;">Kept</h1>
            </div>
            <div style="background: #fff; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
              ${body}
            </div>
            <p style="color: #6b7280; font-size: 12px; margin-top: 16px; text-align: center;">
              This email was sent by Kept. If you didn't expect this, please ignore it.
            </p>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Resend API error:", error);
      return { success: false, error };
    }

    const data = await response.json();
    return { success: true, messageId: data.id };
  } catch (error: any) {
    console.error("Email send error:", error);
    return { success: false, error: error.message };
  }
}

// Helper function for sending SMS (avoids circular reference in internalActions)
async function callTwilioApi(to: string, body: string): Promise<NotificationResult> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    console.warn("Twilio not configured - SMS not sent");
    return { success: false, error: "SMS not configured" };
  }

  try {
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          From: fromNumber,
          To: to,
          Body: body,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("Twilio API error:", error);
      return { success: false, error };
    }

    const data = await response.json();
    return { success: true, messageSid: data.sid };
  } catch (error: any) {
    console.error("SMS send error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Send invite email to a new resident
 */
export const sendInviteEmail = internalAction({
  args: {
    email: v.string(),
    managerName: v.string(),
    propertyAddress: v.string(),
    role: v.string(),
    inviteToken: v.string(),
  },
  handler: async (_ctx, args): Promise<NotificationResult> => {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://kept.app";
    const inviteLink = `${baseUrl}/invite/${args.inviteToken}`;

    const subject = `You've been invited to Kept by ${args.managerName}`;
    const body = `
      <h2 style="color: #111827; margin: 0 0 16px 0;">You're Invited!</h2>
      <p style="color: #4b5563; line-height: 1.6;">
        <strong>${args.managerName}</strong> has invited you to access 
        <strong>${args.propertyAddress}</strong> on Kept as a 
        <strong>${args.role === "homeowner" ? "Homeowner" : "Tenant"}</strong>.
      </p>
      <p style="color: #4b5563; line-height: 1.6;">
        ${args.role === "homeowner" 
          ? "You'll get full access to maintenance forecasts, DIY guides, and can submit service requests."
          : "You'll be able to submit service requests and receive important notices from your property manager."}
      </p>
      <div style="margin: 24px 0;">
        <a href="${inviteLink}" style="
          display: inline-block;
          background: #0D9488;
          color: white;
          padding: 12px 24px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
        ">Accept Invitation</a>
      </div>
      <p style="color: #9ca3af; font-size: 14px;">
        This invitation expires in 7 days. If you didn't expect this invitation, you can safely ignore this email.
      </p>
    `;

    return callResendApi(args.email, subject, body);
  },
});

/**
 * Send a service notice via email
 */
export const sendNoticeEmail = internalAction({
  args: {
    email: v.string(),
    title: v.string(),
    body: v.string(),
    noticeType: v.string(),
    managerName: v.string(),
    propertyName: v.string(),
  },
  handler: async (_ctx, args): Promise<NotificationResult> => {
    const typeLabels: Record<string, string> = {
      general: "General Notice",
      maintenance: "Maintenance Notice",
      emergency: "Emergency Notice",
      billing: "Billing Notice",
    };

    const typeColors: Record<string, string> = {
      general: "#3B82F6",
      maintenance: "#F59E0B",
      emergency: "#EF4444",
      billing: "#8B5CF6",
    };

    const subject = `${typeLabels[args.noticeType] || "Notice"}: ${args.title}`;
    const htmlBody = `
      <div style="
        background: ${typeColors[args.noticeType] || "#6B7280"};
        color: white;
        padding: 8px 12px;
        border-radius: 6px;
        display: inline-block;
        font-size: 12px;
        font-weight: 600;
        margin-bottom: 16px;
      ">
        ${typeLabels[args.noticeType] || "Notice"}
      </div>
      <h2 style="color: #111827; margin: 0 0 16px 0;">${args.title}</h2>
      <p style="color: #4b5563; line-height: 1.6; white-space: pre-wrap;">${args.body}</p>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
      <p style="color: #9ca3af; font-size: 14px;">
        This notice was sent by ${args.managerName} regarding ${args.propertyName}.
      </p>
    `;

    return callResendApi(args.email, subject, htmlBody);
  },
});

/**
 * Send a service notice via SMS
 */
export const sendNoticeSMS = internalAction({
  args: {
    phone: v.string(),
    title: v.string(),
    noticeType: v.string(),
    managerName: v.string(),
  },
  handler: async (_ctx, args): Promise<NotificationResult> => {
    const typeLabels: Record<string, string> = {
      general: "",
      maintenance: "Maintenance: ",
      emergency: "URGENT: ",
      billing: "Billing: ",
    };

    const body = `${typeLabels[args.noticeType] || ""}${args.title} - from ${args.managerName} via Kept`;

    return callTwilioApi(args.phone, body);
  },
});

/**
 * Send request status update notification to resident
 */
export const sendRequestUpdateEmail = internalAction({
  args: {
    email: v.string(),
    requestTitle: v.string(),
    newStatus: v.string(),
    resolutionSummary: v.optional(v.string()),
    propertyName: v.string(),
  },
  handler: async (_ctx, args): Promise<NotificationResult> => {
    const statusLabels: Record<string, string> = {
      acknowledged: "Acknowledged",
      in_progress: "In Progress",
      scheduled: "Scheduled",
      resolved: "Resolved",
      closed: "Closed",
    };

    const subject = `Request Update: ${args.requestTitle}`;
    const body = `
      <h2 style="color: #111827; margin: 0 0 16px 0;">Request Status Updated</h2>
      <p style="color: #4b5563; line-height: 1.6;">
        Your service request "<strong>${args.requestTitle}</strong>" at 
        <strong>${args.propertyName}</strong> has been updated.
      </p>
      <div style="
        background: #F3F4F6;
        padding: 16px;
        border-radius: 8px;
        margin: 16px 0;
      ">
        <p style="margin: 0; color: #374151;">
          <strong>New Status:</strong> ${statusLabels[args.newStatus] || args.newStatus}
        </p>
        ${args.resolutionSummary ? `
          <p style="margin: 12px 0 0 0; color: #374151;">
            <strong>Resolution:</strong> ${args.resolutionSummary}
          </p>
        ` : ""}
      </div>
      <p style="color: #9ca3af; font-size: 14px;">
        Log in to Kept to view more details.
      </p>
    `;

    return callResendApi(args.email, subject, body);
  },
});
