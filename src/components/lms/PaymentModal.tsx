import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useFlutterwave, closePaymentModal } from 'flutterwave-react-v3';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { enrollUserPaid, enrollUserPending } from '@/services/lmsService';
import type { Course } from '@/types/lms';
import type { User } from 'firebase/auth';

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course: Course;
  currentUser: User;
}

// ── Flutterwave card tab ──────────────────────────────────────────────────────

interface CardPaymentProps {
  course: Course;
  currentUser: User;
  onSuccess: () => void;
}

function CardPayment({ course, currentUser, onSuccess }: CardPaymentProps) {
  const config = {
    public_key: import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY ?? 'FLWPUBK_TEST-XXXX',
    tx_ref: `SCA-${Date.now()}`,
    amount: course.price,
    currency: course.currency ?? 'RWF',
    payment_options: 'card',
    customer: {
      email: currentUser.email ?? '',
      name: currentUser.displayName ?? '',
      phone_number: '',
    },
    customizations: {
      title: 'Student Companion AI',
      description: `Enroll in: ${course.title}`,
      logo: '/logo.png',
    },
  };

  const handleFlutterPayment = useFlutterwave(config);

  const pay = () => {
    handleFlutterPayment({
      callback: async (response) => {
        closePaymentModal();
        if (response.status === 'successful' || response.status === 'completed') {
          await enrollUserPaid(
            currentUser.uid,
            course.id,
            response.transaction_id.toString(),
          );
          onSuccess();
        } else {
          toast.error('Payment was not completed. Please try again.');
        }
      },
      onClose: () => {
        toast.info('Payment cancelled');
      },
    });
  };

  return (
    <div className="space-y-4 pt-2">
      <p className="text-sm text-muted-foreground">
        Pay securely by card via Flutterwave. You will be redirected to a secure
        payment page.
      </p>
      <Button
        className="w-full bg-[#D4AF37] hover:bg-[#B8941F] text-[#1A1A1A] font-semibold"
        onClick={pay}
      >
        Pay {course.currency} {course.price.toLocaleString()} by Card
      </Button>
    </div>
  );
}

// ── MTN MoMo tab ─────────────────────────────────────────────────────────────

interface MoMoPaymentProps {
  course: Course;
  currentUser: User;
  onSuccess: () => void;
}

function MoMoPayment({ course, currentUser, onSuccess }: MoMoPaymentProps) {
  const [momoRef, setMomoRef] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (momoRef.trim().length < 6) {
      toast.error('Please enter a valid MoMo transaction reference (min 6 characters).');
      return;
    }
    setSubmitting(true);
    try {
      const timestamp = Date.now();
      const docId = `${currentUser.uid}_${course.id}_${timestamp}`;
      await setDoc(doc(collection(db, 'paymentRequests'), docId), {
        userId: currentUser.uid,
        courseId: course.id,
        amount: course.price,
        currency: course.currency ?? 'RWF',
        method: 'momo',
        momoRef: momoRef.trim(),
        status: 'pending',
        studentEmail: currentUser.email ?? '',
        studentName: currentUser.displayName ?? '',
        courseTitle: course.title,
        submittedAt: serverTimestamp(),
      });
      await enrollUserPending(currentUser.uid, course.id, momoRef.trim());
      toast.success(
        'Payment submitted! An admin will approve your access within 24 hours.',
      );
      onSuccess();
    } catch (err) {
      console.error('MoMo submit error:', err);
      toast.error('Failed to submit payment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 pt-2">
      <div className="rounded-lg bg-[#FBF7E9] border border-[#E8DDB0] p-4 space-y-3">
        <h4 className="text-sm font-semibold text-[#1A1A1A]">
          Pay via MTN Mobile Money
        </h4>
        <ol className="space-y-2 text-sm text-[#1A1A1A]/70">
          <li className="flex gap-2">
            <span className="text-[#B8941F] font-bold flex-shrink-0">1.</span>
            Dial <span className="font-mono font-semibold">*182*1*1#</span> or open MoMo app
          </li>
          <li className="flex gap-2">
            <span className="text-[#B8941F] font-bold flex-shrink-0">2.</span>
            <span>
              Send{' '}
              <span className="font-semibold">
                {course.price.toLocaleString()} RWF
              </span>{' '}
              to:{' '}
              <span className="font-bold">0791920747</span>{' '}
              <span className="text-[#1A1A1A]/50">(Student Companion AI)</span>
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-[#B8941F] font-bold flex-shrink-0">3.</span>
            Enter your MoMo transaction reference below
          </li>
        </ol>
      </div>

      <div className="space-y-2">
        <Label htmlFor="momoRef">MoMo Transaction Reference</Label>
        <Input
          id="momoRef"
          value={momoRef}
          onChange={(e) => setMomoRef(e.target.value)}
          placeholder="e.g. 1234567890"
          minLength={6}
          required
          aria-describedby="momoRef-hint"
        />
        <p id="momoRef-hint" className="text-xs text-muted-foreground">
          Found in your MoMo SMS confirmation (min 6 characters)
        </p>
      </div>

      <Button
        type="submit"
        disabled={submitting}
        className="w-full bg-[#D4AF37] hover:bg-[#B8941F] text-[#1A1A1A] font-semibold"
      >
        {submitting ? 'Submitting…' : 'Submit for Approval'}
      </Button>
    </form>
  );
}

// ── Main modal ────────────────────────────────────────────────────────────────

export function PaymentModal({
  open,
  onOpenChange,
  course,
  currentUser,
}: PaymentModalProps) {
  const navigate = useNavigate();

  const handleSuccess = () => {
    onOpenChange(false);
    navigate(`/courses/${course.id}/learn`);
  };

  const handleMoMoSuccess = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold leading-snug">
            {course.title}
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {course.price === 0
              ? 'Free'
              : `${course.currency} ${course.price.toLocaleString()}`}
          </p>
        </DialogHeader>

        <Tabs defaultValue="card" className="mt-2">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger
              value="card"
              className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-[#1A1A1A]"
            >
              Card / Online
            </TabsTrigger>
            <TabsTrigger
              value="momo"
              className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-[#1A1A1A]"
            >
              Mobile Money
            </TabsTrigger>
          </TabsList>

          <TabsContent value="card">
            <CardPayment
              course={course}
              currentUser={currentUser}
              onSuccess={handleSuccess}
            />
          </TabsContent>

          <TabsContent value="momo">
            <MoMoPayment
              course={course}
              currentUser={currentUser}
              onSuccess={handleMoMoSuccess}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
