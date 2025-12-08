// app/api/send-contact-email/route.js
import { NextResponse } from "next/server";
import { Resend } from "resend";
const resend = new Resend(process.env.RESEND_API_KEY);

const ADMIN_EMAILS = ["raniem57@gmail.com", "ajemigbitsejennifer@gmail.com"];

export async function POST(request) {
  const { name, email, message } = await request.json();

  try {
    await resend.emails.send({
      from: "Bemigo Contact <info@higher.com.ng>",
      to: ADMIN_EMAILS,
      subject: `New Contact Message from ${name}`,
      reply_to: email,
      html: `
        <h2>New Message from Bemigo Website</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <blockquote>${message.replace(/\n/g, "<br>")}</blockquote>
        <hr>
        <small>Sent from Bemigo Enterprises contact form</small>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Resend error:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}
