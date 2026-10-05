import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  collection,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { requireAdmin } from '@/utils/adminAuth';
import {
  seedFirstCourse,
  approvePayment,
  rejectPayment,
  getPendingPayments,
  getAllProgress,
  getAllEnrollments,
} from '@/services/lmsService';
import type { Course, PaymentRequest, CourseProgress, Enrollment } from '@/types/lms';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { ArrowLeft, Download, Plus, Sprout } from 'lucide-react';
import { Link } from 'react-router-dom';

// ── Firestore helpers ─────────────────────────────────────────────────────────

async function getAllCourses(): Promise<Course[]> {
  const snap = await getDocs(collection(db, 'courses'));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Course));
}

// ── Empty course form state ────────────────────────────────────────────────────

const EMPTY_COURSE: Omit<Course, 'id' | 'createdAt' | 'updatedAt'> = {
  title: '',
  subtitle: '',
  description: '',
  thumbnailUrl: '',
  category: '',
  level: 'Beginner',
  price: 0,
  currency: 'RWF',
  duration: '',
  lessonsCount: 0,
  instructor: '',
  tags: [],
  isPublished: false,
  isFeatured: false,
  trialModuleId: '',
  scormUrl: '',
};

// ── Course Form ───────────────────────────────────────────────────────────────

interface CourseFormProps {
  initial: Omit<Course, 'id' | 'createdAt' | 'updatedAt'>;
  onSave: (data: Omit<Course, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onClose: () => void;
}

function CourseForm({ initial, onSave, onClose }: CourseFormProps) {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(form);
      toast.success('Course saved');
      onClose();
    } catch (err) {
      toast.error('Failed to save course', {
        description: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
      {/* Title */}
      <div>
        <Label htmlFor="cf-title">Title *</Label>
        <Input
          id="cf-title"
          value={form.title}
          onChange={(e) => set('title', e.target.value)}
          required
          className="mt-1"
        />
      </div>

      {/* Subtitle */}
      <div>
        <Label htmlFor="cf-subtitle">Subtitle</Label>
        <Input
          id="cf-subtitle"
          value={form.subtitle}
          onChange={(e) => set('subtitle', e.target.value)}
          className="mt-1"
        />
      </div>

      {/* Description */}
      <div>
        <Label htmlFor="cf-desc">Description</Label>
        <textarea
          id="cf-desc"
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          rows={3}
          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      {/* Thumbnail */}
      <div>
        <Label htmlFor="cf-thumb">Thumbnail URL</Label>
        <Input
          id="cf-thumb"
          value={form.thumbnailUrl}
          onChange={(e) => set('thumbnailUrl', e.target.value)}
          className="mt-1"
        />
      </div>

      {/* Category / Level */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="cf-cat">Category</Label>
          <Input
            id="cf-cat"
            value={form.category}
            onChange={(e) => set('category', e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="cf-level">Level</Label>
          <Select value={form.level} onValueChange={(v) => set('level', v)}>
            <SelectTrigger id="cf-level" className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Beginner">Beginner</SelectItem>
              <SelectItem value="Intermediate">Intermediate</SelectItem>
              <SelectItem value="Advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Price / Currency */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="cf-price">Price</Label>
          <Input
            id="cf-price"
            type="number"
            min={0}
            value={form.price}
            onChange={(e) => set('price', Number(e.target.value))}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="cf-currency">Currency</Label>
          <Select value={form.currency} onValueChange={(v) => set('currency', v as 'RWF' | 'USD')}>
            <SelectTrigger id="cf-currency" className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="RWF">RWF</SelectItem>
              <SelectItem value="USD">USD</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Duration / Lessons */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="cf-duration">Duration</Label>
          <Input
            id="cf-duration"
            value={form.duration}
            onChange={(e) => set('duration', e.target.value)}
            placeholder="e.g. 4 hours"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="cf-lessons">Lessons Count</Label>
          <Input
            id="cf-lessons"
            type="number"
            min={0}
            value={form.lessonsCount}
            onChange={(e) => set('lessonsCount', Number(e.target.value))}
            className="mt-1"
          />
        </div>
      </div>

      {/* Instructor */}
      <div>
        <Label htmlFor="cf-instructor">Instructor</Label>
        <Input
          id="cf-instructor"
          value={form.instructor}
          onChange={(e) => set('instructor', e.target.value)}
          className="mt-1"
        />
      </div>

      {/* Tags */}
      <div>
        <Label htmlFor="cf-tags">Tags (comma-separated)</Label>
        <Input
          id="cf-tags"
          value={form.tags.join(', ')}
          onChange={(e) =>
            set(
              'tags',
              e.target.value.split(',').map((t) => t.trim()).filter(Boolean),
            )
          }
          className="mt-1"
        />
      </div>

      {/* SCORM URL */}
      <div>
        <Label htmlFor="cf-scorm">SCORM URL</Label>
        <Input
          id="cf-scorm"
          value={form.scormUrl}
          onChange={(e) => set('scormUrl', e.target.value)}
          className="mt-1"
        />
      </div>

      {/* Trial Module */}
      <div>
        <Label htmlFor="cf-trial">Trial Module ID</Label>
        <Input
          id="cf-trial"
          value={form.trialModuleId ?? ''}
          onChange={(e) => set('trialModuleId', e.target.value)}
          className="mt-1"
        />
      </div>

      {/* Flags */}
      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={form.isPublished}
            onChange={(e) => set('isPublished', e.target.checked)}
            className="h-4 w-4 rounded border-gray-300"
          />
          Published
        </label>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={form.isFeatured}
            onChange={(e) => set('isFeatured', e.target.checked)}
            className="h-4 w-4 rounded border-gray-300"
          />
          Featured
        </label>
      </div>

      <DialogFooter className="pt-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving} className="bg-[#D4AF37] hover:bg-[#B8941F] text-[#1A1A1A]">
          {saving ? 'Saving…' : 'Save course'}
        </Button>
      </DialogFooter>
    </form>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

function CourseManager() {
  const qc = useQueryClient();

  // ── Courses query ──────────────────────────────────────────────────────────
  const { data: courses = [], isLoading: loadingCourses } = useQuery({
    queryKey: ['admin-courses'],
    queryFn: getAllCourses,
  });

  // ── Pending payments query ─────────────────────────────────────────────────
  const { data: pendingPayments = [], isLoading: loadingPayments } = useQuery({
    queryKey: ['admin-pending-payments'],
    queryFn: getPendingPayments,
  });

  // ── Progress + enrollments queries ────────────────────────────────────────
  const { data: progressRows = [], isLoading: loadingProgress } = useQuery({
    queryKey: ['admin-all-progress'],
    queryFn: getAllProgress,
  });
  const { data: allEnrollments = [] } = useQuery<Enrollment[]>({
    queryKey: ['admin-all-enrollments'],
    queryFn: getAllEnrollments,
  });

  // ── Dialog state ───────────────────────────────────────────────────────────
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  // ── Progress filter state ─────────────────────────────────────────────────
  const [progressCourseFilter, setProgressCourseFilter] = useState<string>('all');

  // ── Helper: enrollment status for a progress row ──────────────────────────
  const enrollmentStatus = (uid: string, courseId: string) => {
    const e = allEnrollments.find((en) => en.userId === uid && en.courseId === courseId);
    return e?.status ?? 'trial';
  };

  // ── Save course (create or update) ────────────────────────────────────────
  const handleSaveCourse = async (
    data: Omit<Course, 'id' | 'createdAt' | 'updatedAt'>,
  ) => {
    if (editingCourse) {
      const ref = doc(db, 'courses', editingCourse.id);
      await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
    } else {
      const id = data.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      const ref = doc(db, 'courses', id);
      await setDoc(ref, { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
    }
    qc.invalidateQueries({ queryKey: ['admin-courses'] });
  };

  // ── Toggle publish ────────────────────────────────────────────────────────
  const togglePublish = async (course: Course) => {
    const ref = doc(db, 'courses', course.id);
    await updateDoc(ref, { isPublished: !course.isPublished, updatedAt: serverTimestamp() });
    toast.success(course.isPublished ? 'Course unpublished' : 'Course published');
    qc.invalidateQueries({ queryKey: ['admin-courses'] });
  };

  // ── Delete course ─────────────────────────────────────────────────────────
  const deleteCourse = async (course: Course) => {
    if (!confirm(`Delete "${course.title}"? This cannot be undone.`)) return;
    await deleteDoc(doc(db, 'courses', course.id));
    toast.success('Course deleted');
    qc.invalidateQueries({ queryKey: ['admin-courses'] });
  };

  // ── Approve / reject payment ──────────────────────────────────────────────
  const handleApprove = async (p: PaymentRequest) => {
    try {
      await approvePayment(p.id, p.userId, p.courseId, p.momoRef ?? '');
      toast.success(`Payment approved for ${p.studentName}`);
      qc.invalidateQueries({ queryKey: ['admin-pending-payments'] });
    } catch (err) {
      toast.error('Approval failed', { description: err instanceof Error ? err.message : String(err) });
    }
  };

  const handleReject = async (p: PaymentRequest) => {
    if (!confirm(`Reject payment from ${p.studentName}?`)) return;
    try {
      await rejectPayment(p.id, p.userId, p.courseId);
      toast.success(`Payment rejected for ${p.studentName}`);
      qc.invalidateQueries({ queryKey: ['admin-pending-payments'] });
    } catch (err) {
      toast.error('Rejection failed', { description: err instanceof Error ? err.message : String(err) });
    }
  };

  // ── Seed first course ─────────────────────────────────────────────────────
  const handleSeed = async () => {
    if (!confirm('Seed "Career Readiness 101" into Firestore? This will overwrite any existing document with that ID.')) return;
    try {
      await seedFirstCourse();
      toast.success('Career Readiness 101 seeded successfully');
      qc.invalidateQueries({ queryKey: ['admin-courses'] });
    } catch (err) {
      toast.error('Seed failed', { description: err instanceof Error ? err.message : String(err) });
    }
  };

  // ── Export progress CSV ───────────────────────────────────────────────────
  const exportProgressCsv = () => {
    const rows = filteredProgress.map((p) => [
      p.userId,
      p.courseId,
      p.percentComplete,
      p.lastAccessedAt ? String(p.lastAccessedAt) : '',
      enrollmentStatus(p.userId, p.courseId),
    ]);
    const header = ['Student UID', 'Course ID', '% Complete', 'Last Accessed', 'Status'];
    const csv = [header, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student-progress.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Filtered progress ─────────────────────────────────────────────────────
  const filteredProgress =
    progressCourseFilter === 'all'
      ? progressRows
      : progressRows.filter((p) => p.courseId === progressCourseFilter);

  const uniqueCourseIds = [...new Set(progressRows.map((p) => p.courseId))];

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <Link
            to="/settings"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft size={20} />
            <span>Back to Settings</span>
          </Link>
          <h1 className="text-3xl font-bold text-[#D4AF37]">Course Manager</h1>
        </div>
      </div>

      <Tabs defaultValue="courses" className="w-full">
        <TabsList className="bg-[#D4AF37]/10 mb-6">
          <TabsTrigger
            value="courses"
            className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-[#1A1A1A]"
          >
            Courses
          </TabsTrigger>
          <TabsTrigger
            value="payments"
            className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-[#1A1A1A]"
          >
            Payment Approvals
            {pendingPayments.length > 0 && (
              <Badge className="ml-2 bg-red-500 text-white text-xs px-1.5 py-0">
                {pendingPayments.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="progress"
            className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-[#1A1A1A]"
          >
            Student Progress
          </TabsTrigger>
        </TabsList>

        {/* ── Tab 1: Courses ────────────────────────────────────────────────── */}
        <TabsContent value="courses">
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>All Courses</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSeed}
                  className="gap-2"
                >
                  <Sprout className="h-4 w-4" />
                  Seed First Course
                </Button>

                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      className="gap-2 bg-[#D4AF37] hover:bg-[#B8941F] text-[#1A1A1A]"
                      onClick={() => setEditingCourse(null)}
                    >
                      <Plus className="h-4 w-4" />
                      Add Course
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>{editingCourse ? 'Edit Course' : 'Add Course'}</DialogTitle>
                      <DialogDescription>
                        {editingCourse
                          ? 'Update the course details below.'
                          : 'Fill in the details for the new course.'}
                      </DialogDescription>
                    </DialogHeader>
                    <CourseForm
                      initial={editingCourse ?? EMPTY_COURSE}
                      onSave={handleSaveCourse}
                      onClose={() => setDialogOpen(false)}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {loadingCourses ? (
                <p className="text-center py-8 text-muted-foreground">Loading courses…</p>
              ) : courses.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">
                  No courses yet. Use "Seed First Course" to get started.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 pr-4 font-medium">Title</th>
                        <th className="text-left py-2 pr-4 font-medium">Category</th>
                        <th className="text-left py-2 pr-4 font-medium">Level</th>
                        <th className="text-left py-2 pr-4 font-medium">Price</th>
                        <th className="text-left py-2 pr-4 font-medium">Status</th>
                        <th className="text-left py-2 pr-4 font-medium">Featured</th>
                        <th className="text-left py-2 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {courses.map((course) => (
                        <tr key={course.id} className="border-b last:border-0 hover:bg-muted/30">
                          <td className="py-3 pr-4 font-medium max-w-[200px] truncate">
                            {course.title}
                          </td>
                          <td className="py-3 pr-4 text-muted-foreground">{course.category}</td>
                          <td className="py-3 pr-4">
                            <Badge variant="outline">{course.level}</Badge>
                          </td>
                          <td className="py-3 pr-4">
                            {course.price === 0 ? (
                              <Badge className="bg-green-100 text-green-800">Free</Badge>
                            ) : (
                              <span>
                                {course.currency} {course.price.toLocaleString()}
                              </span>
                            )}
                          </td>
                          <td className="py-3 pr-4">
                            <Badge
                              className={
                                course.isPublished
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-600'
                              }
                            >
                              {course.isPublished ? 'Published' : 'Draft'}
                            </Badge>
                          </td>
                          <td className="py-3 pr-4">
                            {course.isFeatured ? (
                              <Badge className="bg-[#D4AF37]/20 text-[#8a6d0b]">Featured</Badge>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="py-3">
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingCourse(course);
                                  setDialogOpen(true);
                                }}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => togglePublish(course)}
                              >
                                {course.isPublished ? 'Unpublish' : 'Publish'}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                                onClick={() => deleteCourse(course)}
                              >
                                Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Tab 2: Payment Approvals ──────────────────────────────────────── */}
        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Pending Payment Requests</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingPayments ? (
                <p className="text-center py-8 text-muted-foreground">Loading payments…</p>
              ) : pendingPayments.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">
                  No pending payment requests.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 pr-4 font-medium">Student</th>
                        <th className="text-left py-2 pr-4 font-medium">Email</th>
                        <th className="text-left py-2 pr-4 font-medium">Course</th>
                        <th className="text-left py-2 pr-4 font-medium">Amount</th>
                        <th className="text-left py-2 pr-4 font-medium">Method</th>
                        <th className="text-left py-2 pr-4 font-medium">MoMo Ref</th>
                        <th className="text-left py-2 pr-4 font-medium">Submitted</th>
                        <th className="text-left py-2 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingPayments.map((p) => (
                        <tr key={p.id} className="border-b last:border-0 hover:bg-muted/30">
                          <td className="py-3 pr-4 font-medium">{p.studentName}</td>
                          <td className="py-3 pr-4 text-muted-foreground">{p.studentEmail}</td>
                          <td className="py-3 pr-4 max-w-[150px] truncate">{p.courseTitle}</td>
                          <td className="py-3 pr-4">
                            {p.currency} {p.amount.toLocaleString()}
                          </td>
                          <td className="py-3 pr-4">
                            <Badge variant="outline" className="uppercase">
                              {p.method}
                            </Badge>
                          </td>
                          <td className="py-3 pr-4 font-mono text-xs">
                            {p.momoRef ?? '—'}
                          </td>
                          <td className="py-3 pr-4 text-muted-foreground text-xs">
                            {p.submittedAt
                              ? new Date(
                                  (p.submittedAt as { seconds: number }).seconds * 1000,
                                ).toLocaleDateString()
                              : '—'}
                          </td>
                          <td className="py-3">
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white"
                                onClick={() => handleApprove(p)}
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-red-300 text-red-600 hover:bg-red-50"
                                onClick={() => handleReject(p)}
                              >
                                Reject
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Tab 3: Student Progress ───────────────────────────────────────── */}
        <TabsContent value="progress">
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Student Progress</CardTitle>
              <div className="flex items-center gap-3">
                {/* Course filter */}
                <Select
                  value={progressCourseFilter}
                  onValueChange={setProgressCourseFilter}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Filter by course" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All courses</SelectItem>
                    {uniqueCourseIds.map((id) => (
                      <SelectItem key={id} value={id}>
                        {id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button variant="outline" size="sm" className="gap-2" onClick={exportProgressCsv}>
                  <Download className="h-4 w-4" />
                  Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loadingProgress ? (
                <p className="text-center py-8 text-muted-foreground">Loading progress…</p>
              ) : filteredProgress.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">
                  No progress records found.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 pr-4 font-medium">Student UID</th>
                        <th className="text-left py-2 pr-4 font-medium">Course ID</th>
                        <th className="text-left py-2 pr-4 font-medium">% Complete</th>
                        <th className="text-left py-2 pr-4 font-medium">Last Accessed</th>
                        <th className="text-left py-2 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...filteredProgress]
                        .sort((a, b) => {
                          const ta = (a.lastAccessedAt as { seconds: number } | undefined)?.seconds ?? 0;
                          const tb = (b.lastAccessedAt as { seconds: number } | undefined)?.seconds ?? 0;
                          return tb - ta;
                        })
                        .map((p, i) => (
                          <tr key={i} className="border-b last:border-0 hover:bg-muted/30">
                            <td className="py-3 pr-4 font-mono text-xs text-muted-foreground">
                              {p.userId}
                            </td>
                            <td className="py-3 pr-4">{p.courseId}</td>
                            <td className="py-3 pr-4">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden max-w-[80px]">
                                  <div
                                    className="h-full bg-[#D4AF37]"
                                    style={{ width: `${p.percentComplete}%` }}
                                  />
                                </div>
                                <span>{p.percentComplete}%</span>
                              </div>
                            </td>
                            <td className="py-3 pr-4 text-muted-foreground text-xs">
                              {p.lastAccessedAt
                                ? new Date(
                                    (p.lastAccessedAt as { seconds: number }).seconds * 1000,
                                  ).toLocaleString()
                                : '—'}
                            </td>
                            <td className="py-3">
                              <Badge
                                variant="outline"
                                className={
                                  enrollmentStatus(p.userId, p.courseId) === 'enrolled'
                                    ? 'border-green-300 text-green-700'
                                    : enrollmentStatus(p.userId, p.courseId) === 'completed'
                                    ? 'border-blue-300 text-blue-700'
                                    : 'border-gray-300 text-gray-500'
                                }
                              >
                                {enrollmentStatus(p.userId, p.courseId)}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

const CourseManagerWithAuth = requireAdmin(CourseManager);
export default CourseManagerWithAuth;
