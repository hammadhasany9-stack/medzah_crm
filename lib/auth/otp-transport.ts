/** Pluggable OTP — swap for Resend/SendGrid later. */
export async function sendLoginOtp(email: string, _code: string): Promise<void> {
  if (process.env.NODE_ENV === "development") {
    console.info("[auth] OTP request for:", email, "(prototype — not sent)");
  }
}
