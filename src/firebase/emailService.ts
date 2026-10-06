/**
 * Institutional Email Dispatcher using Brevo (Sendinblue) Transactional API.
 */

// Use client-side env variables with elegant fallback to user credentials
const BREVO_API_KEY = (import.meta.env.VITE_BREVO_API_KEY as string) || "";
const BREVO_SENDER_EMAIL = (import.meta.env.VITE_BREVO_SENDER_EMAIL as string) || "raulquintanazinc@gmail.com";
const BREVO_SENDER_NAME = (import.meta.env.VITE_BREVO_SENDER_NAME as string) || "IESTP San Francisco de Asís";
const BREVO_TEMPLATE_ID = 5;

export interface BrevoParams {
  email: string;
  password?: string;
  applicantCode: string;
  url: string;
  programName?: string;
  dni?: string;
}

/**
 * Sends a pre-registered welcome email to an applicant using Brevo's v3 Transactional HTTP Service.
 */
export async function sendWelcomeEmailBrevo(
  recipientEmail: string,
  recipientName: string,
  params: BrevoParams
): Promise<boolean> {
  // 1. Try sending via SFA-Backend NestJS Mail Service
  try {
    const backendUrl = (import.meta.env.VITE_API_URL as string) || "http://localhost:3001";
    console.info("Dispatching welcome email via NestJS SFA-Backend:", `${backendUrl}/mail/send-welcome`);
    
    const backendResponse = await fetch(`${backendUrl}/mail/send-welcome`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: recipientEmail,
        applicantCode: params.applicantCode,
        password: params.password || "clave123",
        temporaryPassword: params.password || "clave123",
        url: params.url,
        name: recipientName,
        programName: params.programName,
        dni: params.dni
      })
    });

    if (backendResponse.ok) {
      console.info("✅ Welcome email sent via SFA-Backend NestJS MailService!");
      return true;
    }
  } catch (backendErr) {
    console.warn("NestJS Backend mail service unreachable, using direct Brevo API fallback...", backendErr);
  }

  // 2. Direct Fallback to Brevo API v3
  const apiKey = (import.meta.env.VITE_BREVO_API_KEY as string) || "";
  const senderEmail = (import.meta.env.VITE_BREVO_SENDER_EMAIL as string) || "raulquintanazinc@gmail.com";
  const senderName = (import.meta.env.VITE_BREVO_SENDER_NAME as string) || "IESTP San Francisco de Asís";

  try {
    const payload = {
      sender: {
        name: senderName,
        email: senderEmail
      },
      to: [
        {
          email: recipientEmail,
          name: recipientName || "Postulante"
        }
      ],
      templateId: BREVO_TEMPLATE_ID,
      params: {
        email: recipientEmail,
        password: params.password || "clave123",
        applicantCode: params.applicantCode,
        url: params.url,
        NOMBRE: recipientName || "Postulante",
        CODIGO: params.applicantCode
      }
    };

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": apiKey,
        "content-type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      const resData = await response.json();
      console.info("✅ Welcome email sent via direct Brevo API fallback!", resData);
      return true;
    } else {
      const errText = await response.text();
      console.error("Brevo API rejection:", response.status, errText);
      return false;
    }
  } catch (error) {
    console.error("Failed to send welcome email via Brevo API:", error);
    return false;
  }
}
