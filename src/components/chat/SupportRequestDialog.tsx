import { useEffect, useState } from "react";
import { LifeBuoy, Loader2, CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import {
  getSupportContact,
  sendSupportRequest,
  SUPPORT_TOPICS,
  type SupportContact,
  type SupportResult,
  type SupportTurn,
} from "@/lib/support";

interface Props {
  /** The conversation so far, offered as context for the team. */
  conversation: Array<{ text: string; isAi: boolean }>;
  /** Shown more prominently when the last answer couldn't help. */
  emphasize?: boolean;
}

/**
 * "Talk to a person": a line under the latest answer that opens a short
 * form. Only shown when the student's university has a team set up.
 */
export function TalkToAPerson({ conversation, emphasize = false }: Props) {
  const [contact, setContact] = useState<SupportContact | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let alive = true;
    getSupportContact().then((c) => alive && setContact(c));
    return () => {
      alive = false;
    };
  }, []);

  if (!contact?.enabled) return null;

  return (
    <div className="px-4 md:px-8 pb-4">
      <div className="max-w-[44rem] mx-auto">
        <button
          onClick={() => setOpen(true)}
          className={
            emphasize
              ? "inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-[#D4AF37] bg-[#FBF7E9] text-[13px] font-medium text-[#1C1B19] hover:bg-[#F5EDD0] transition-colors"
              : "inline-flex items-center gap-1.5 text-[13px] text-[#6B6862] hover:text-[#1C1B19] underline-offset-4 hover:underline"
          }
        >
          <LifeBuoy className="h-3.5 w-3.5" />
          {emphasize ? `Talk to the ${contact.team_name} team` : `Still need help? Talk to the ${contact.team_name} team`}
        </button>
      </div>
      <SupportRequestDialog open={open} onOpenChange={setOpen} contact={contact} conversation={conversation} />
    </div>
  );
}

function SupportRequestDialog({
  open,
  onOpenChange,
  contact,
  conversation,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact: SupportContact;
  conversation: Props["conversation"];
}) {
  const { currentUser } = useAuth();
  const [topic, setTopic] = useState("");
  const [message, setMessage] = useState("");
  const [includeChat, setIncludeChat] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<SupportResult | null>(null);

  const reset = () => {
    setTopic("");
    setMessage("");
    setIncludeChat(true);
    setError("");
    setDone(null);
  };

  const submit = async () => {
    setError("");
    if (!topic) return setError("Choose what your request is about.");
    if (message.trim().length < 10) return setError("Please describe what you need in a sentence or two.");
    setSending(true);
    try {
      const transcript: SupportTurn[] = includeChat
        ? conversation
            .filter((m) => m.text.trim())
            .slice(-20)
            .map((m) => ({ role: m.isAi ? "assistant" : "user", text: m.text.slice(0, 2000) }))
        : [];
      setDone(await sendSupportRequest({ topic, message: message.trim(), transcript }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Your request couldn't be sent. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) setTimeout(reset, 200);
      }}
    >
      <DialogContent className="sm:max-w-lg">
        {done ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 font-serif">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" /> Request sent
              </DialogTitle>
              <DialogDescription>
                The {done.team_name} team has your request <strong>{done.reference}</strong>. They will reply by
                email to {currentUser?.email}. Quote the reference if you write to them at {done.to_email}.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <button
                onClick={() => onOpenChange(false)}
                className="px-4 py-2 rounded-lg bg-[#1C1B19] text-white text-sm hover:bg-black"
              >
                Done
              </button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="font-serif">Talk to the {contact.team_name} team</DialogTitle>
              <DialogDescription>
                Your request goes to {contact.email}, and they will reply by email to {currentUser?.email}.
                {contact.phone ? ` You can also call or message ${contact.phone}.` : ""}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="support-topic">What is it about?</Label>
                <Select value={topic} onValueChange={setTopic}>
                  <SelectTrigger id="support-topic">
                    <SelectValue placeholder="Choose a topic" />
                  </SelectTrigger>
                  <SelectContent>
                    {SUPPORT_TOPICS.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="support-message">What do you need?</Label>
                <Textarea
                  id="support-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  maxLength={3000}
                  rows={5}
                  placeholder="For example: I requested my transcript 3 days ago and haven't heard back."
                />
              </div>
              {conversation.length > 0 && (
                <label className="flex items-start gap-2 text-sm text-[#4A4843] cursor-pointer">
                  <Checkbox checked={includeChat} onCheckedChange={(v) => setIncludeChat(v === true)} className="mt-0.5" />
                  <span>Include this conversation, so the team sees what you've already asked.</span>
                </label>
              )}
              {error && <p className="text-sm text-red-600">{error}</p>}
            </div>

            <DialogFooter>
              <button
                onClick={() => onOpenChange(false)}
                className="px-4 py-2 rounded-lg border border-[#E5E3DE] text-sm hover:bg-[#F4F3F0]"
                disabled={sending}
              >
                Cancel
              </button>
              <button
                onClick={submit}
                disabled={sending}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1C1B19] text-white text-sm hover:bg-black disabled:opacity-60"
              >
                {sending && <Loader2 className="h-4 w-4 animate-spin" />}
                Send request
              </button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
