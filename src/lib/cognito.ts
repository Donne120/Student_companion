/**
 * Email + password accounts in AWS Cognito (the user pool in the backend's
 * StudentCompanionFoundation stack). Only the public, unauthenticated
 * Cognito calls are used, so no SDK is needed.
 *
 * After Cognito checks the password, the backend trades the Cognito ID token
 * for a Firebase custom token (POST /api/auth/cognito/exchange), and the
 * site signs in to Firebase with it: saved chats, profiles and every backend
 * call keep working exactly as for Google sign-in.
 */
import { API_URL } from "@/config/api";

const POOL_ID = (import.meta.env.VITE_COGNITO_USER_POOL_ID as string | undefined)?.trim() || "";
const CLIENT_ID = (import.meta.env.VITE_COGNITO_APP_CLIENT_ID as string | undefined)?.trim() || "";
const REGION = POOL_ID.split("_")[0] || "us-east-1";
const ENDPOINT = `https://cognito-idp.${REGION}.amazonaws.com/`;

/** True when this build is configured to use Cognito for email/password. */
export const cognitoEnabled = Boolean(POOL_ID && CLIENT_ID);

export class CognitoError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

const FRIENDLY: Record<string, string> = {
  NotAuthorizedException: "Wrong email or password. If you signed up with Google, use the Google button instead.",
  UserNotFoundException: "Wrong email or password. If you signed up with Google, use the Google button instead.",
  UsernameExistsException: "An account already exists for this email. Try signing in instead.",
  InvalidPasswordException: "Password is too weak. Use at least 8 characters.",
  CodeMismatchException: "That code isn't right. Check the email and try again.",
  ExpiredCodeException: "That code has expired. Request a new one.",
  LimitExceededException: "Too many attempts. Please wait a few minutes and try again.",
  TooManyRequestsException: "Too many attempts. Please wait a moment and try again.",
  TooManyFailedAttemptsException: "Too many attempts. Please wait a few minutes and try again.",
  InvalidParameterException: "Please check the details you entered.",
  CodeDeliveryFailureException: "We couldn't send the email. Please try again shortly.",
};

async function call<T>(action: string, body: Record<string, unknown>): Promise<T> {
  if (!cognitoEnabled) throw new CognitoError("NotConfigured", "Email sign-in is not available right now.");
  let res: Response;
  try {
    res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-amz-json-1.1",
        "X-Amz-Target": `AWSCognitoIdentityProviderService.${action}`,
      },
      body: JSON.stringify({ ClientId: CLIENT_ID, ...body }),
    });
  } catch {
    throw new CognitoError("NetworkError", "Network error. Check your connection and try again.");
  }
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    const type = String(data.__type || "").split("#").pop() || "Error";
    const raw = String(data.message || data.Message || "");
    const message =
      FRIENDLY[type] ??
      (type === "UserNotConfirmedException" ? "Please confirm your email first." : raw || "Something went wrong. Please try again.");
    throw new CognitoError(type, message);
  }
  return data as T;
}

const norm = (email: string) => email.trim().toLowerCase();

export async function signUp(email: string, password: string, name: string): Promise<void> {
  const attrs = [{ Name: "email", Value: norm(email) }];
  if (name.trim()) attrs.push({ Name: "name", Value: name.trim() });
  await call("SignUp", { Username: norm(email), Password: password, UserAttributes: attrs });
}

export async function confirmSignUp(email: string, code: string): Promise<void> {
  await call("ConfirmSignUp", { Username: norm(email), ConfirmationCode: code.trim() });
}

export async function resendCode(email: string): Promise<void> {
  await call("ResendConfirmationCode", { Username: norm(email) });
}

/** Cognito ID token for this email and password. */
export async function signIn(email: string, password: string): Promise<string> {
  const out = await call<{ AuthenticationResult?: { IdToken?: string }; ChallengeName?: string }>("InitiateAuth", {
    AuthFlow: "USER_PASSWORD_AUTH",
    AuthParameters: { USERNAME: norm(email), PASSWORD: password },
  });
  const token = out.AuthenticationResult?.IdToken;
  if (!token) throw new CognitoError(out.ChallengeName || "Challenge", "Sign-in needs another step that isn't supported yet.");
  return token;
}

export async function forgotPassword(email: string): Promise<void> {
  await call("ForgotPassword", { Username: norm(email) });
}

export async function confirmForgotPassword(email: string, code: string, newPassword: string): Promise<void> {
  await call("ConfirmForgotPassword", { Username: norm(email), ConfirmationCode: code.trim(), Password: newPassword });
}

/** Trade a Cognito ID token for a Firebase custom token at our backend. */
export async function exchangeForFirebase(idToken: string): Promise<{ customToken: string; isNew: boolean }> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}/api/auth/cognito/exchange`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });
  } catch {
    throw new CognitoError("NetworkError", "Network error. Check your connection and try again.");
  }
  const data = (await res.json().catch(() => ({}))) as { customToken?: string; isNew?: boolean; detail?: string };
  if (!res.ok || !data.customToken) {
    throw new CognitoError(`Exchange${res.status}`, data.detail || "Could not complete sign-in. Please try again.");
  }
  return { customToken: data.customToken, isNew: Boolean(data.isNew) };
}
