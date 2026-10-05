# Implementation Plan — LMS Feature

> **Execution note:** This plan has been decomposed into three FEAT artifacts under
> `.agents/tasks/lms-feature/`. The workflow tail has been replaced with one
> `wf-coder` step per FEAT (sequential), followed by a convergence loop and a
> merge step. Read this file for the full narrative; each FEAT file has the
> authoritative step list that the coder will execute.

---

## Design decisions

| Decision | Choice & rationale |
|---|---|
| Package manager | `npm install` — project has both `bun.lockb` and `package-lock.json`; `npm` is what the build script calls. |
| Firestore enrollment key | `${uid}_${courseId}` as the document ID — avoids extra index, matches the spec exactly. |
| Payment library | `flutterwave-react-v3` — specified in the task. Not installed; FEAT-001 installs it before any import. |
| Admin gate | `requireAdmin` HOC from `@/utils/adminAuth` — identical to all four existing admin pages; no new pattern needed. |
| SCORM / xAPI | Embed SCORM content in an `<iframe>` and listen for `postMessage` from the content. Articulate Rise sends standard xAPI/cmi5 statements; we listen for `percentComplete` or `verb: completed`. Full SCORM API bridge is out of scope — the iframe alone works for the first course. |
| Module outline | CourseOutline generates N modules from `course.lessonsCount` (numbered titles). Real module metadata isn't in the data model yet; this satisfies the UI requirement without breaking the data contract. |
| Trial vs enrolled | `enrollUserFree` always sets status `'enrolled'` for a free course. For a paid course trial (clicking "Try for Free"), we call `enrollUserFree` and set status `'trial'` — this is encoded in a separate `enrollUserTrial` path inside `enrollUserFree` via an optional `trial` boolean param. |
| LandingPage courses section | Hard-coded seed course preview — no Firestore call on the public landing page (avoids auth requirement and keeps the landing page fast). |

---

## FEAT-001 — Foundation (types, service, shared components)

**Depends on:** nothing (run first)

- [ ] 1. `npm install flutterwave-react-v3` in the worktree root.
      Files: `package.json`, `package-lock.json`
      Verify: `npm run build` — 0 errors.

- [ ] 2. Create `src/types/lms.ts` with `Course`, `Enrollment`, `CourseProgress`, `CourseFilter` interfaces. Strict TypeScript, no `any`.
      Files: `src/types/lms.ts`
      Verify: `npm run build` — 0 TypeScript errors.

- [ ] 3. Create `src/services/lmsService.ts` exporting all eight service functions including `seedFirstCourse()` with the Career Readiness 101 seed data.
      Files: `src/services/lmsService.ts`
      Verify: `npm run build` — 0 errors.

- [ ] 4. Create `src/components/lms/ProgressBar.tsx` — gold-tinted Radix Progress with percent label.
      Files: `src/components/lms/ProgressBar.tsx`
      Verify: `npm run build`.

- [ ] 5. Create `src/components/lms/CourseCard.tsx` — card with thumbnail, badges, price, progress bar, CTA label.
      Files: `src/components/lms/CourseCard.tsx`
      Verify: `npm run build`.

- [ ] 6. Create `src/components/lms/CourseOutline.tsx` — accordion module list, trial/locked states.
      Files: `src/components/lms/CourseOutline.tsx`
      Verify: `npm run build`.

---

## FEAT-002 — User-facing LMS pages + navigation wiring

**Depends on:** FEAT-001 complete

- [ ] 7. Create `src/components/lms/PaymentModal.tsx` — shadcn Dialog wrapping Flutterwave, enrolls user on success.
      Files: `src/components/lms/PaymentModal.tsx`
      Verify: `npm run build`.

- [ ] 8. Create `src/pages/courses/CourseCatalog.tsx` — filter bar, featured hero, responsive grid, My Learning section.
      Files: `src/pages/courses/CourseCatalog.tsx`
      Verify: `npm run build`.

- [ ] 9. Create `src/pages/courses/CourseDetail.tsx` — hero, outline accordion, sticky sidebar CTA.
      Files: `src/pages/courses/CourseDetail.tsx`
      Verify: `npm run build`.

- [ ] 10. Create `src/pages/courses/CoursePlayer.tsx` — sidebar outline + iframe SCORM player + xAPI postMessage listener.
       Files: `src/pages/courses/CoursePlayer.tsx`
       Verify: `npm run build`.

- [ ] 11. Update `src/App.tsx` — add lazy imports for CourseCatalog/CourseDetail/CoursePlayer, add to TITLE_MAP, add `/courses` to APP_ROUTES, add three protected routes.
       Files: `src/App.tsx`
       Verify: `npm run build`.

- [ ] 12. Update `src/components/mobile/MobileTabBar.tsx` — replace Docs tab with Courses (GraduationCap icon, `/courses`), keep grid-cols-5.
       Files: `src/components/mobile/MobileTabBar.tsx`
       Verify: `npm run build`.

- [ ] 13. Update `src/pages/LandingPage.tsx` — add Courses to NAV_LINKS, add courses section with seed course preview card.
       Files: `src/pages/LandingPage.tsx`
       Verify: `npm run build`.

- [ ] 14. Append `VITE_FLUTTERWAVE_PUBLIC_KEY=` to `.env.example` under a `# LMS` comment.
       Files: `.env.example`
       Verify: `npm run build`.

---

## FEAT-003 — Admin course manager + seed trigger

**Depends on:** FEAT-001 complete (independent of FEAT-002)

- [ ] 15. Create `src/pages/admin/CourseManager.tsx` — requireAdmin-wrapped, course table, Add/Edit dialog, seed button.
       Files: `src/pages/admin/CourseManager.tsx`
       Verify: `npm run build`.

- [ ] 16. Update `src/App.tsx` — add lazy import for CourseManager, add to TITLE_MAP, add `/admin/courses` protected route.
       Files: `src/App.tsx`
       Verify: `npm run build`.

- [ ] 17. Cross-check `seedFirstCourse()` data against spec — all 16 fields present and match exactly.
       Files: `src/services/lmsService.ts` (read and confirm, fix if needed)
       Verify: `npm run build`.

---

## Firestore security rules (not automated — manual step for operator)

After deploying, add these rules to the Firebase console:

```
match /courses/{courseId} {
  allow read: if request.auth != null;
  allow write: if false; // admin writes via SDK in CourseManager (backend enforcement TODO)
}
match /enrollments/{docId} {
  allow read, write: if request.auth != null && docId.matches(request.auth.uid + '_.*');
}
match /progress/{docId} {
  allow read, write: if request.auth != null && docId.matches(request.auth.uid + '_.*');
}
```

> Client-side admin write is gated by `requireAdmin` (UX only). Production should add a Cloud Function or Admin SDK endpoint for course mutations — out of scope for this iteration.

---

## FEAT artifact locations

```
.agents/tasks/lms-feature/
├── task.json
├── context.json
└── features/
    ├── FEAT-001.json   # foundation
    ├── FEAT-002.json   # user pages + nav
    └── FEAT-003.json   # admin + seed
```
