// lib/services/email-service.ts
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailParams {
  to: string[];
  subject: string;
  html: string;
  from?: string;
}

export async function sendEmail({ to, subject, html, from }: SendEmailParams) {
    console.log("🔑 Chave carregada:", process.env.RESEND_API_KEY ? "✅ Sim" : "❌ Não");
  try {
    const { data, error } = await resend.emails.send({
      from: from || "Travel Planner <noreply@travelplanner.com>",
      to: to,
      subject: subject,
      html: html,
    });

    if (error) {
      console.error("❌ Erro ao enviar email:", error);
      throw new Error(error.message);
    }

    console.log("✅ Email enviado com sucesso:", data);
    return { success: true, data };
  } catch (error) {
    console.error("❌ Erro no envio de email:", error);
    throw error;
  }
}