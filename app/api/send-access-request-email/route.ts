import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { adminEmail, requestData, requestId } = body;

    // Validate required fields
    if (!adminEmail || !requestData || !requestId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Use EmailJS to send the email
    const emailResponse = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
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
          submission_date: new Date().toLocaleDateString(),
          submission_time: new Date().toLocaleTimeString()
        }
      })
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.json();
      console.error("EmailJS error:", errorData);
      return NextResponse.json(
        { error: "Failed to send email", details: errorData },
        { status: emailResponse.status }
      );
    }

    return NextResponse.json(
      { success: true, message: "Email sent successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in email API route:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
