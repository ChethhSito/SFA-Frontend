/**
 * Institutional email dispatcher through the local backend.
 */

export interface BrevoParams {
  email: string;
  password?: string;
  applicantCode: string;
  url: string;
  programName?: string;
  dni?: string;
}

/**
 * Sends a welcome email through the NestJS mail service.
 */
export async function sendWelcomeEmailBrevo(
  recipientEmail: string,
  recipientName: string,
  params: BrevoParams
): Promise<boolean> {
  try {
    const backendUrl = (import.meta.env.VITE_API_URL as string) || "http://127.0.0.1:3001";
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
      const result = await backendResponse.json() as { success?: boolean };
      if (result.success) {
        console.info("[MailService] Welcome email sent via SFA-Backend NestJS MailService!");
        return true;
      }
    }
    console.error("Backend mail service rejected the request:", backendResponse.status);
    return false;
  } catch (backendErr) {
    console.error("NestJS Backend mail service unreachable:", backendErr);
    return false;
  }
}
