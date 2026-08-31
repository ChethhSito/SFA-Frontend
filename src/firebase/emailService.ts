/**
 * Institutional Email Dispatcher using Brevo (Sendinblue) Transactional API.
 */

// Use client-side env variables with elegant fallback to user credentials
const BREVO_API_KEY = (process.env.NEXT_PUBLIC_BREVO_API_KEY as string) || "";
const BREVO_SENDER_EMAIL = (process.env.NEXT_PUBLIC_BREVO_SENDER_EMAIL as string) || "";
const BREVO_SENDER_NAME = (process.env.NEXT_PUBLIC_BREVO_SENDER_NAME as string) || "IESTP-API";
const BREVO_TEMPLATE_ID = 5;

export interface BrevoParams {
  email: string;
  password?: string;
  applicantCode: string;
  url: string;
}

/**
 * Sends a pre-registered welcome email to an applicant using Brevo's v3 Transactional HTTP Service.
 */
export async function sendWelcomeEmailBrevo(
  recipientEmail: string,
  recipientName: string,
  params: BrevoParams
): Promise<boolean> {
  if (!BREVO_API_KEY) {
    console.warn("Brevo API Key is missing. Email dispatch skipped.");
    return false;
  }

  try {
    const payload = {
      sender: {
        name: BREVO_SENDER_NAME,
        email: BREVO_SENDER_EMAIL
      },
      to: [
        {
          email: recipientEmail,
          name: recipientName
        }
      ],
      templateId: BREVO_TEMPLATE_ID,
      params: {
        email: params.email,
        password: params.password || "clave123",
        applicantCode: params.applicantCode,
        url: params.url
      }
    };

    console.info("Dispatching registration welcome email via Brevo... ID: #", BREVO_TEMPLATE_ID);

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": BREVO_API_KEY,
        "content-type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      const resData = await response.json();
      console.info("Welcome email successfully sent through Brevo!", resData);
      return true;
    } else {
      const errText = await response.text();
      console.error("Brevo API rejection status:", response.status, errText);
      return false;
    }
  } catch (error) {
    console.error("Failed to send welcome email via Brevo API:", error);
    return false;
  }
}
