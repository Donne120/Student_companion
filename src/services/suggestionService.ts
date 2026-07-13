import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  query,
  where,
  orderBy,
  serverTimestamp,
  getCountFromServer,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export type SuggestionStatus = "pending" | "approved" | "rejected";

export interface AnswerSuggestion {
  id: string;
  questionText: string;
  suggestedAnswer: string;
  submittedBy: string;
  submittedAt: number;
  status: SuggestionStatus;
  reviewedBy?: string;
  reviewedAt?: number;
  rejectionNote?: string;
}

const COL = "answer_suggestions";

/** Submit a student suggestion. Returns the new document id. */
export const submitSuggestion = async (
  uid: string,
  questionText: string,
  suggestedAnswer: string
): Promise<string> => {
  if (suggestedAnswer.trim().length < 10) {
    throw new Error("Answer must be at least 10 characters.");
  }
  if (suggestedAnswer.trim().length > 2000) {
    throw new Error("Answer must be 2,000 characters or fewer.");
  }
  const ref = await addDoc(collection(db, COL), {
    questionText,
    suggestedAnswer: suggestedAnswer.trim(),
    submittedBy: uid,
    submittedAt: serverTimestamp(),
    status: "pending",
  });
  return ref.id;
};

/** Admin: fetch all pending suggestions (oldest first). */
export const getPendingSuggestions = async (): Promise<AnswerSuggestion[]> => {
  const snap = await getDocs(
    query(
      collection(db, COL),
      where("status", "==", "pending"),
      orderBy("submittedAt", "asc")
    )
  );
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      questionText: data.questionText ?? "",
      suggestedAnswer: data.suggestedAnswer ?? "",
      submittedBy: data.submittedBy ?? "",
      submittedAt: data.submittedAt?.toMillis?.() ?? 0,
      status: data.status ?? "pending",
    };
  });
};

/** Admin: approve a suggestion. */
export const approveSuggestion = async (
  suggestionId: string,
  adminUid: string
): Promise<void> => {
  await updateDoc(doc(db, COL, suggestionId), {
    status: "approved",
    reviewedBy: adminUid,
    reviewedAt: serverTimestamp(),
  });
};

/** Admin: reject a suggestion with an optional note. */
export const rejectSuggestion = async (
  suggestionId: string,
  adminUid: string,
  rejectionNote?: string
): Promise<void> => {
  await updateDoc(doc(db, COL, suggestionId), {
    status: "rejected",
    reviewedBy: adminUid,
    reviewedAt: serverTimestamp(),
    ...(rejectionNote ? { rejectionNote } : {}),
  });
};

/** Returns the count of pending suggestions (for badge display). */
export const getPendingCount = async (): Promise<number> => {
  const snap = await getCountFromServer(
    query(collection(db, COL), where("status", "==", "pending"))
  );
  return snap.data().count;
};

export const suggestionService = {
  submitSuggestion,
  getPendingSuggestions,
  approveSuggestion,
  rejectSuggestion,
  getPendingCount,
};
