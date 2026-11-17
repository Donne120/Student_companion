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

/** The password was right and the account has two-step sign-in: the code
 * from the authenticator app is needed next (respondToTwoStep). */
export class TwoStepRequired extends CognitoError {
  session: string;
  username: string;
  constructor(session: string, username: string) {
    super("TwoStepRequired", "Enter the 6-digit code from your authenticator app.");
    this.session = session;
    this.username = username;
  }
}

export interface CognitoTokens {
  idToken: string;
  accessToken: string;
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
  EnableSoftwareTokenMFAException: "That code isn't right. Check the time on your phone and try again.",
  SoftwareTokenMFANotFoundException: "Two-step sign-in isn't set up on this account.",
};

async function call<T>(action: string, body: Record<string, unknown>, withClient = true): Promise<T> {
  if (!cognitoEnabled) throw new CognitoError("NotConfigured", "Email sign-in is not available right now.");
  let res: Response;
  try {
    res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-amz-json-1.1",
        "X-Amz-Target": `AWSCognitoIdentityProviderService.${action}`,
      },
      // Calls made with the user's own access token take no app client id.
      body: JSON.stringify(withClient ? { ClientId: CLIENT_ID, ...body } : body),
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

type AuthResult = {
  AuthenticationResult?: { IdToken?: string; AccessToken?: string };
  ChallengeName?: string;
  Session?: string;
  ChallengeParameters?: Record<string, string>;
};

function tokensFrom(out: AuthResult): CognitoTokens {
  const r = out.AuthenticationResult;
  if (r?.IdToken && r.AccessToken) return { idToken: r.IdToken, accessToken: r.AccessToken };
  throw new CognitoError(out.ChallengeName || "Challenge", "Sign-in needs another step that isn't supported yet.");
}

/** Cognito tokens for this email and password. Throws TwoStepRequired when
 * the account uses an authenticator app. */
export async function signIn(email: string, password: string): Promise<CognitoTokens> {
  const out = await call<AuthResult>("InitiateAuth", {
    AuthFlow: "USER_PASSWORD_AUTH",
    AuthParameters: { USERNAME: norm(email), PASSWORD: password },
  });
  if (out.ChallengeName === "SOFTWARE_TOKEN_MFA" && out.Session) {
    throw new TwoStepRequired(out.Session, out.ChallengeParameters?.USER_ID_FOR_SRP || norm(email));
  }
  return tokensFrom(out);
}

/** Finish a sign-in with the authenticator app's code. */
export async function respondToTwoStep(challenge: TwoStepRequired, code: string): Promise<CognitoTokens> {
  try {
    const out = await call<AuthResult>("RespondToAuthChallenge", {
      ChallengeName: "SOFTWARE_TOKEN_MFA",
      Session: challenge.session,
      ChallengeResponses: { USERNAME: challenge.username, SOFTWARE_TOKEN_MFA_CODE: code.trim() },
    });
    return tokensFrom(out);
  } catch (e) {
    if (e instanceof CognitoError && e.code === "CodeMismatchException") {
      throw new CognitoError(e.code, "That code isn't right. Use the current code from your authenticator app.");
    }
    if (e instanceof CognitoError && e.code === "NotAuthorizedException") {
      throw new CognitoError(e.code, "That took too long. Go back and sign in again.");
    }
    throw e;
  }
}

// --- Two-step sign-in setup (with the signed-in user's access token) ------

/** Whether this account has an authenticator app turned on. */
export async function twoStepEnabled(accessToken: string): Promise<boolean> {
  const out = await call<{ UserMFASettingList?: string[] }>("GetUser", { AccessToken: accessToken }, false);
  return (out.UserMFASettingList || []).includes("SOFTWARE_TOKEN_MFA");
}

/** Start adding an authenticator app: the secret to put in the app. */
export async function startTwoStepSetup(accessToken: string): Promise<string> {
  const out = await call<{ SecretCode?: string }>("AssociateSoftwareToken", { AccessToken: accessToken }, false);
  if (!out.SecretCode) throw new CognitoError("Setup", "Could not start the setup. Please try again.");
  return out.SecretCode;
}

/** Check the first code from the app, then require it at every sign-in. */
export async function finishTwoStepSetup(accessToken: string, code: string): Promise<void> {
  const out = await call<{ Status?: string }>(
    "VerifySoftwareToken",
    { AccessToken: accessToken, UserCode: code.trim(), FriendlyDeviceName: "Authenticator app" },
    false,
  );
  if (out.Status !== "SUCCESS") throw new CognitoError("CodeMismatchException", "That code isn't right. Try the next one.");
  await setTwoStep(accessToken, true);
}

export async function setTwoStep(accessToken: string, on: boolean): Promise<void> {
  await call(
    "SetUserMFAPreference",
    { AccessToken: accessToken, SoftwareTokenMfaSettings: { Enabled: on, PreferredMfa: on } },
    false,
  );
}

/** The address to show as a QR code for authenticator apps. */
export function authenticatorLink(secret: string, email: string): string {
  const label = encodeURIComponent(`Student Companion AI:${norm(email)}`);
  // `image`: the logo, for apps that show one (2FAS, FreeOTP, Aegis...);
  // Google and Microsoft Authenticator ignore it.
  const logo = encodeURIComponent(`${window.location.origin}/icon-192.png`);
  return `otpauth://totp/${label}?secret=${secret}&issuer=${encodeURIComponent("Student Companion AI")}&image=${logo}`;
}

export async function forgotPassword(email: string): Promise<void> {
  await call("ForgotPassword", { Username: norm(email) });
}

export async function confirmForgotPassword(email: string, code: string, newPassword: string): Promise<void> {
  await call("ConfirmForgotPassword", { Username: norm(email), ConfirmationCode: code.trim(), Password: newPassword });
}

/** Trade Cognito tokens for a Firebase custom token at our backend. The
 * access token lets the backend see whether two-step sign-in was used. */
export async function exchangeForFirebase(tokens: CognitoTokens): Promise<{ customToken: string; isNew: boolean }> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}/api/auth/cognito/exchange`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: tokens.idToken, accessToken: tokens.accessToken }),
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
