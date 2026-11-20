import { NextRequest, NextResponse } from "next/server";
import { formatUSDate, formatUSTime } from "@/lib/timezone";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type = "request", adminEmail, requestData, requestId, email, fullName, password, databases, startDate, endDate, loginLink, reason } = body;

    // Handle different email types
    if (type === "request") {
      // Admin notification of new access request
      if (!adminEmail || !requestData || !requestId) {
        return NextResponse.json(
          { error: "Missing required fields for request email" },
          { status: 400 }
        );
      }

      const emailResponse = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_id: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
          template_id: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
          user_id: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY,
          template_params: {
            to_email: adminEmail,
            admin_email: adminEmail,
            user_name: requestData.full_name,
            user_email: requestData.email,
            company_name: requestData.company_name,
            request_id: requestId,
            submission_date: formatUSDate(new Date().toISOString()),
            submission_time: formatUSTime(new Date().toISOString())
          }
        })
      });

      if (!emailResponse.ok) {
        const errorData = await emailResponse.json();
        console.error("EmailJS error:", errorData);
        return NextResponse.json(
          { error: "Failed to send admin notification email", details: errorData },
          { status: emailResponse.status }
        );
      }

      return NextResponse.json(
        { success: true, message: "Admin notification email sent successfully" },
        { status: 200 }
      );

    } else if (type === "approval") {
      // User approval with credentials
      if (!email || !fullName || !password || !databases || !startDate || !endDate || !loginLink) {
        return NextResponse.json(
          { error: "Missing required fields for approval email" },
          { status: 400 }
        );
      }

      const start = new Date(startDate);
      const end = new Date(endDate);
      const duration = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

      const emailResponse = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_id: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
          template_id: "access_approval_template", // New template ID for approval
          user_id: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY,
          template_params: {
            to_email: email,
            user_name: fullName,
            databases: databases === "both" ? "DB1 and DB2" : databases,
            password: password,
            login_link: loginLink,
            start_date: formatUSDate(startDate),
            end_date: formatUSDate(endDate),
            duration_days: duration,
            admin_email: process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@chesapeakepharma.com"
          }
        })
      });

      if (!emailResponse.ok) {
        const errorData = await emailResponse.json();
        console.error("EmailJS approval email error:", errorData);
        return NextResponse.json(
          { error: "Failed to send approval email", details: errorData },
          { status: emailResponse.status }
        );
      }

      return NextResponse.json(
        { success: true, message: "Approval email with credentials sent successfully" },
        { status: 200 }
      );

    } else if (type === "rejection") {
      // User rejection notification
      if (!email || !fullName || !reason) {
        return NextResponse.json(
          { error: "Missing required fields for rejection email" },
          { status: 400 }
        );
      }

      const emailResponse = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_id: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
          template_id: "access_rejection_template", // New template ID for rejection
          user_id: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY,
          template_params: {
            to_email: email,
            user_name: fullName,
            reason: reason,
            admin_email: process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@chesapeakepharma.com"
          }
        })
      });

      if (!emailResponse.ok) {
        const errorData = await emailResponse.json();
        console.error("EmailJS rejection email error:", errorData);
        return NextResponse.json(
          { error: "Failed to send rejection email", details: errorData },
          { status: emailResponse.status }
        );
      }

      return NextResponse.json(
        { success: true, message: "Rejection email sent successfully" },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { error: "Invalid email type" },
      { status: 400 }
    );

  } catch (error) {
    console.error("Error in email API route:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
