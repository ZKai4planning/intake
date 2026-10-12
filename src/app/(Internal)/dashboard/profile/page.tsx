// // 'use client'

// // import { useEffect, useState } from 'react'
// // import { useRouter } from 'next/navigation'

// // import { DashboardShell } from '@/components/dashboard/Dashboardshell'
// // import { AuthInput } from '@/components/auth'
// // import { useWorkspace, SESSION_STORAGE_KEY } from '@/hooks/Useworkspace'
// // import { useLogout } from '@/hooks/useLogout'
// // import { cn } from '@/lib/cn'
// // import { DashboardLoading } from '@/components/dashboard/DashboardLoading'
// // import { DeleteAccountSection } from '@/components/dashboard/DeleteAccountSection'

// // /**
// //  * /dashboard/profile
// //  * ────────────────────
// //  * Account settings: identity, workspace/role, security (MFA) status,
// //  * and sign-out. Reads the session the same way the dashboard does
// //  * (useWorkspace), so it renders correctly for every workspace tier
// //  * without any actor-specific branching.
// //  *
// //  * Editing the display name is client-only for now — it patches the
// //  * cached session in localStorage so the UI reflects it immediately.
// //  * API integration point: wire handleSave to
// //  *   PATCH /api/auth/me { name }
// //  */
// // export default function ProfilePage() {
// //   const router = useRouter()
// //   const { isLoading, session, workspace, firstName } = useWorkspace()
// //   const { handleLogout, isLoggingOut } = useLogout()

// //   const [name, setName] = useState('')
// //   const [isEditing, setIsEditing] = useState(false)
// //   const [isSaving, setIsSaving] = useState(false)
// //   const [saved, setSaved] = useState(false)

// //   useEffect(() => {
// //     if (session?.name) setName(session.name)
// //   }, [session?.name])

// //   if (isLoading) {
// //     return <DashboardLoading label="Loading your profile…" cards={2} />
// //   }

// //   if (!session || !workspace) {
// //     return (
// //       <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center px-5">
// //         <div className="text-center max-w-[360px]">
// //           <p className="font-display text-2xl text-[#E8F0FF] mb-2">No active session</p>
// //           <p className="text-[13px] text-[#5A6A8A] mb-6">
// //             Please log in to view your profile.
// //           </p>
// //           <button
// //             onClick={() => router.push('/login')}
// //             className="px-5 py-2.5 rounded-[10px] bg-[#135BEC] text-white text-sm font-semibold hover:bg-[#2A6BF0] transition-colors"
// //           >
// //             Go to login →
// //           </button>
// //         </div>
// //       </div>
// //     )
// //   }

// //   function handleSave() {
// //     setIsSaving(true)
// //     try {
// //       // API integration point: PATCH /api/auth/me { name }
// //       const raw = localStorage.getItem(SESSION_STORAGE_KEY)
// //       if (raw) {
// //         const parsed = JSON.parse(raw)
// //         localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({ ...parsed, name }))
// //       }
// //       setIsEditing(false)
// //       setSaved(true)
// //       window.setTimeout(() => setSaved(false), 2000)
// //     } finally {
// //       setIsSaving(false)
// //     }
// //   }

// //   const initials = firstName?.trim()?.[0]?.toUpperCase() || 'U'

// //   return (
// //     <DashboardShell workspace={workspace} firstName={firstName} email={session.email}>
// //       <div className="max-w-[560px] mx-auto">
// //         <h1 className="font-display text-[26px] sm:text-[30px] font-normal text-[#E8F0FF] tracking-tight mb-1">
// //           Profile
// //         </h1>
// //         <p className="text-[13.5px] text-[#A8B8D8] mb-7">
// //           Manage your account details and security settings.
// //         </p>

// //         {/* ── Identity card ────────────────────────────────── */}
// //         <section className="rounded-[14px] border border-white/[0.08] bg-[#0F1525] p-5 mb-4">
// //           <div className="flex items-center gap-4 mb-6">
// //             <div className="w-14 h-14 shrink-0 rounded-full bg-[rgba(19,91,236,0.12)] border border-[rgba(19,91,236,0.3)] text-[#135BEC] text-[20px] font-semibold flex items-center justify-center">
// //               {initials}
// //             </div>
// //             <div className="min-w-0">
// //               <p className="text-[15px] font-semibold text-[#E8F0FF] truncate">{session.name}</p>
// //               <p className="text-[12.5px] text-[#5A6A8A] truncate">{session.email}</p>
// //             </div>
// //           </div>

// //           {isEditing ? (
// //             <div className="space-y-4">
// //               <AuthInput
// //                 label="Full name"
// //                 value={name}
// //                 onChange={e => setName(e.target.value)}
// //                 autoFocus
// //               />
// //               <div className="flex items-center gap-2">
// //                 <button
// //                   onClick={handleSave}
// //                   disabled={isSaving || !name.trim()}
// //                   className={cn(
// //                     'px-4 py-2 rounded-[10px] text-[13px] font-semibold transition-colors',
// //                     isSaving || !name.trim()
// //                       ? 'bg-white/[0.06] text-[#5A6A8A] cursor-not-allowed'
// //                       : 'bg-[#135BEC] text-white hover:bg-[#2A6BF0]'
// //                   )}
// //                 >
// //                   {isSaving ? 'Saving…' : 'Save'}
// //                 </button>
// //                 <button
// //                   onClick={() => {
// //                     setIsEditing(false)
// //                     setName(session.name)
// //                   }}
// //                   className="px-4 py-2 rounded-[10px] text-[13px] font-medium text-[#A8B8D8] hover:text-[#E8F0FF] hover:bg-white/[0.05] transition-colors"
// //                 >
// //                   Cancel
// //                 </button>
// //               </div>
// //             </div>
// //           ) : (
// //             <div className="flex items-center justify-between">
// //               {saved ? (
// //                 <p className="text-[12.5px] text-[#135BEC]">Name updated.</p>
// //               ) : (
// //                 <p className="text-[12.5px] text-[#5A6A8A]">Update your display name.</p>
// //               )}
// //               <button
// //                 onClick={() => setIsEditing(true)}
// //                 className="text-[12.5px] font-medium text-[#135BEC] hover:text-[#2A6BF0]"
// //               >
// //                 Edit
// //               </button>
// //             </div>
// //           )}
// //         </section>

// //         {/* ── Workspace / role card ────────────────────────── */}
// //         <section className="rounded-[14px] border border-white/[0.08] bg-[#0F1525] p-5 mb-4">
// //           <h2 className="text-[13px] font-semibold text-[#E8F0FF] mb-4">Workspace</h2>
// //           <dl className="space-y-3">
// //             <Row label="Workspace type" value={workspace.internalLabel} />
// //             <Row label="Account role" value={capitalize(session.role)} />
// //             <Row
// //               label="Projects"
// //               value={workspace.projectLimit === 'unlimited' ? 'Unlimited' : `Up to ${workspace.projectLimit}`}
// //             />
// //           </dl>
// //         </section>

// //         {/* ── Phone number card ────────────────────────────── */}
// //         <section className="rounded-[14px] border border-white/[0.08] bg-[#0F1525] p-5 mb-4">
// //           <h2 className="text-[13px] font-semibold text-[#E8F0FF] mb-4">Phone number</h2>
// //           <div className="flex items-center justify-between">
// //             <div>
// //               <p className="text-[13px] text-[#E8F0FF]">
// //                 {session.phone ? formatUkPhone(session.phone) : 'No phone number'}
// //               </p>
// //               <p className="text-[11.5px] text-[#5A6A8A] mt-0.5">
// //                 {session.phone
// //                   ? 'Verified and linked to this account.'
// //                   : 'Add a phone number to keep your account unique and secure.'}
// //               </p>
// //             </div>
// //             <span
// //               className="shrink-0 text-[10.5px] font-medium px-2.5 py-1 rounded-full"
// //               style={
// //                 session.phone
// //                   ? { background: 'rgba(19,91,236,0.1)', color: '#135BEC' }
// //                   : { background: 'rgba(245,158,11,0.1)', color: '#F59E0B' }
// //               }
// //             >
// //               {session.phone ? 'Verified' : 'Missing'}
// //             </span>
// //           </div>
// //           <button
// //             onClick={() => router.push(`/add-phone?returnTo=${encodeURIComponent('/dashboard/profile')}`)}
// //             className="mt-4 text-[12.5px] font-medium text-[#135BEC] hover:text-[#2A6BF0]"
// //           >
// //             {session.phone ? 'Change phone number →' : 'Add phone number →'}
// //           </button>
// //         </section>

// //         {/* ── Security card ────────────────────────────────── */}
// //         <section className="rounded-[14px] border border-white/[0.08] bg-[#0F1525] p-5 mb-4">
// //           <h2 className="text-[13px] font-semibold text-[#E8F0FF] mb-4">Security</h2>
// //           <div className="flex items-center justify-between">
// //             <div>
// //               <p className="text-[13px] text-[#E8F0FF]">Two-factor authentication</p>
// //               <p className="text-[11.5px] text-[#5A6A8A] mt-0.5">
// //                 {session.mfaEnabled ? 'Enabled for this account.' : 'Not set up yet.'}
// //               </p>
// //             </div>
// //             <span
// //               className="shrink-0 text-[10.5px] font-medium px-2.5 py-1 rounded-full"
// //               style={
// //                 session.mfaEnabled
// //                   ? { background: 'rgba(19,91,236,0.1)', color: '#135BEC' }
// //                   : { background: 'rgba(245,158,11,0.1)', color: '#F59E0B' }
// //               }
// //             >
// //               {session.mfaEnabled ? 'On' : 'Off'}
// //             </span>
// //           </div>
// //           {!session.mfaEnabled && (
// //             <button
// //               onClick={() => router.push('/mfa-setup')}
// //               className="mt-4 text-[12.5px] font-medium text-[#135BEC] hover:text-[#2A6BF0]"
// //             >
// //               Set up two-factor authentication →
// //             </button>
// //           )}
// //         </section>

// //         {/* ── Sign out ─────────────────────────────────────── */}
// //         <section className="rounded-[14px] border border-[rgba(255,107,107,0.2)] bg-[rgba(255,107,107,0.04)] p-5">
// //           <div className="flex items-center justify-between gap-4">
// //             <div>
// //               <p className="text-[13px] font-medium text-[#E8F0FF]">Log out</p>
// //               <p className="text-[11.5px] text-[#5A6A8A] mt-0.5">
// //                 Sign out of this account on this device.
// //               </p>
// //             </div>
// //             <button
// //               onClick={handleLogout}
// //               disabled={isLoggingOut}
// //               className={cn(
// //                 'shrink-0 px-4 py-2 rounded-[10px] text-[13px] font-semibold transition-colors',
// //                 isLoggingOut
// //                   ? 'text-[#5A6A8A] cursor-not-allowed'
// //                   : 'text-[#FF6B6B] bg-[rgba(255,107,107,0.08)] hover:bg-[rgba(255,107,107,0.14)]'
// //               )}
// //             >
// //               {isLoggingOut ? 'Logging out…' : 'Log out'}
// //             </button>
// //           </div>
// //         </section>

// //         {/* ── Delete account ───────────────────────────────── */}
// //         <div className="mt-4">
// //           <DeleteAccountSection accountName={session.name} />
// //         </div>
// //       </div>
// //     </DashboardShell>
// //   )
// // }

// // function formatUkPhone(e164: string) {
// //   // "+447911123456" -> "+44 7911 123456"
// //   const digits = e164.replace('+44', '')
// //   if (digits.length !== 10) return e164
// //   return `+44 ${digits.slice(0, 4)} ${digits.slice(4)}`
// // }

// // function Row({ label, value }: { label: string; value: string }) {
// //   return (
// //     <div className="flex items-center justify-between">
// //       <dt className="text-[12.5px] text-[#5A6A8A]">{label}</dt>
// //       <dd className="text-[12.5px] text-[#E8F0FF] font-medium">{value}</dd>
// //     </div>
// //   )
// // }

// // function capitalize(s: string) {
// //   return s ? s.charAt(0).toUpperCase() + s.slice(1) : s
// // }


// 'use client'

// import { useEffect, useRef, useState } from 'react'
// import { useRouter } from 'next/navigation'

// import { DashboardShell } from '@/components/dashboard/Dashboardshell'
// import { AuthInput } from '@/components/auth'
// import { useWorkspace, SESSION_STORAGE_KEY } from '@/hooks/Useworkspace'
// import { useLogout } from '@/hooks/useLogout'
// import { cn } from '@/lib/cn'
// import { DashboardLoading } from '@/components/dashboard/DashboardLoading'
// import { DeleteAccountSection } from '@/components/dashboard/DeleteAccountSection'

// /**
//  * /dashboard/profile
//  * ────────────────────
//  * Account settings: identity, avatar, workspace/role, security (MFA)
//  * status, and sign-out. Reads the session the same way the dashboard
//  * does (useWorkspace), so it renders correctly for every workspace
//  * tier without any actor-specific branching.
//  *
//  * Layout: a fixed left rail of settings sections (mirrors the rest of
//  * the settings area) + a full-width content column on the right that
//  * holds the personal-information form. Log out is intentionally the
//  * last item in the rail.
//  *
//  * Editing name/phone/avatar is client-only for now — it patches the
//  * cached session in localStorage so the UI reflects it immediately.
//  * API integration points:
//  *   PATCH /api/auth/me { name, avatarUrl }
//  *   phone number changes still route through /add-phone (OTP flow)
//  */

// const AVATAR_STORAGE_KEY = 'profile.avatarDataUrl'

// export default function ProfilePage() {
//   const router = useRouter()
//   const { isLoading, session, workspace, firstName } = useWorkspace()
//   const { handleLogout, isLoggingOut } = useLogout()

//   const fileInputRef = useRef<HTMLInputElement>(null)

//   const [name, setName] = useState('')
//   const [isEditing, setIsEditing] = useState(false)
//   const [isSaving, setIsSaving] = useState(false)
//   const [saved, setSaved] = useState(false)
//   const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

//   useEffect(() => {
//     if (session?.name) setName(session.name)
//   }, [session?.name])

//   useEffect(() => {
//     const cached = window.localStorage.getItem(AVATAR_STORAGE_KEY)
//     if (cached) setAvatarUrl(cached)
//   }, [])

//   if (isLoading) {
//     return <DashboardLoading label="Loading your profile…" cards={2} />
//   }

//   if (!session || !workspace) {
//     return (
//       <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center px-5">
//         <div className="text-center max-w-[360px]">
//           <p className="font-display text-2xl text-[#E8F0FF] mb-2">No active session</p>
//           <p className="text-[13px] text-[#5A6A8A] mb-6">
//             Please log in to view your profile.
//           </p>
//           <button
//             onClick={() => router.push('/login')}
//             className="px-5 py-2.5 rounded-[10px] bg-[#135BEC] text-white text-sm font-semibold hover:bg-[#2A6BF0] transition-colors"
//           >
//             Go to login →
//           </button>
//         </div>
//       </div>
//     )
//   }

//   function handleSave() {
//     setIsSaving(true)
//     try {
//       // API integration point: PATCH /api/auth/me { name }
//       const raw = localStorage.getItem(SESSION_STORAGE_KEY)
//       if (raw) {
//         const parsed = JSON.parse(raw)
//         localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({ ...parsed, name }))
//       }
//       setIsEditing(false)
//       setSaved(true)
//       window.setTimeout(() => setSaved(false), 2000)
//     } finally {
//       setIsSaving(false)
//     }
//   }

//   function handlePickAvatar() {
//     fileInputRef.current?.click()
//   }

//   function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
//     const file = e.target.files?.[0]
//     if (!file) return
//     const reader = new FileReader()
//     reader.onload = () => {
//       const dataUrl = reader.result as string
//       setAvatarUrl(dataUrl)
//       // API integration point: PATCH /api/auth/me { avatarUrl }
//       window.localStorage.setItem(AVATAR_STORAGE_KEY, dataUrl)
//     }
//     reader.readAsDataURL(file)
//     e.target.value = ''
//   }

//   function handleRemoveAvatar() {
//     setAvatarUrl(null)
//     window.localStorage.removeItem(AVATAR_STORAGE_KEY)
//   }

//   const initials = firstName?.trim()?.[0]?.toUpperCase() || 'U'

//   const completionChecks = [Boolean(session.name), Boolean(session.phone), session.mfaEnabled, Boolean(avatarUrl)]
//   const completionPct = Math.round(
//     (completionChecks.filter(Boolean).length / completionChecks.length) * 100
//   )

//   return (
//     <DashboardShell workspace={workspace} firstName={firstName} email={session.email}>
//       <div className="w-full max-w-none flex flex-col md:flex-row md:items-start gap-6">
//         {/* ── Left rail ─────────────────────────────────────── */}
//         <aside className="w-full md:w-[260px] md:shrink-0 flex flex-col gap-4">
//           {!isProfileComplete(completionChecks) && (
//             <div className="rounded-[14px] border border-[rgba(19,91,236,0.25)] bg-[rgba(19,91,236,0.08)] p-4">
//               <div className="flex items-center justify-between mb-2">
//                 <p className="text-[12px] font-semibold text-[#E8F0FF]">Complete profile</p>
//                 <span className="text-[11px] font-semibold text-[#135BEC]">{completionPct}%</span>
//               </div>
//               <div className="h-1.5 rounded-full bg-white/[0.08] overflow-hidden mb-3">
//                 <div
//                   className="h-full rounded-full bg-[#135BEC] transition-all"
//                   style={{ width: `${completionPct}%` }}
//                 />
//               </div>
//               {!session.mfaEnabled && (
//                 <button
//                   onClick={() => router.push('/mfa-setup')}
//                   className="w-full text-center px-3 py-2 rounded-[8px] bg-[#135BEC] text-white text-[12px] font-semibold hover:bg-[#2A6BF0] transition-colors"
//                 >
//                   Verify identity
//                 </button>
//               )}
//             </div>
//           )}

//           <nav className="rounded-[14px] border border-white/[0.08] bg-[#0F1525] p-2">
//             <RailItem label="Account information" description="Change your account information" active />
//             <RailItem label="Password" description="Change your password" onClick={() => router.push('/dashboard/reset-password')} />
//                         <div className="my-2 h-px bg-white/[0.06]" />
//             <RailItem
//               label={isLoggingOut ? 'Logging out…' : 'Log out'}
//               description="Sign out of this account"
//               tone="danger"
//               disabled={isLoggingOut}
//               onClick={handleLogout}
//             />
//           </nav>
//         </aside>

//         {/* ── Main content ─────────────────────────────────── */}
//         <div className="flex-1 min-w-0">
//           <h1 className="font-display text-[26px] sm:text-[30px] font-normal text-[#E8F0FF] tracking-tight mb-1">
//             Personal information
//           </h1>
//           <p className="text-[13.5px] text-[#A8B8D8] mb-6">
//             Manage your account details and security settings.
//           </p>

//           {/* ── Identity + avatar card ─────────────────────── */}
//           <section className="rounded-[14px] border border-white/[0.08] bg-[#0F1525] p-5 mb-4">
//             <div className="flex items-center gap-4 mb-2">
//               <div className="relative shrink-0">
//                 <div className="w-16 h-16 rounded-full overflow-hidden bg-[rgba(19,91,236,0.12)] border border-[rgba(19,91,236,0.3)] text-[#135BEC] text-[22px] font-semibold flex items-center justify-center">
//                   {avatarUrl ? (
//                     // eslint-disable-next-line @next/next/no-img-element
//                     <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
//                   ) : (
//                     initials
//                   )}
//                 </div>
//                 <button
//                   onClick={handlePickAvatar}
//                   aria-label="Change profile photo"
//                   className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#135BEC] border-2 border-[#0F1525] flex items-center justify-center hover:bg-[#2A6BF0] transition-colors"
//                 >
//                   <CameraIcon />
//                 </button>
//                 <input
//                   ref={fileInputRef}
//                   type="file"
//                   accept="image/*"
//                   className="hidden"
//                   onChange={handleAvatarChange}
//                 />
//               </div>
//               <div className="min-w-0 flex-1">
//                 <p className="text-[15px] font-semibold text-[#E8F0FF] truncate">{session.name}</p>
//                 <p className="text-[12.5px] text-[#5A6A8A] truncate">{capitalize(session.role)} · {workspace.internalLabel}</p>
//                 <div className="flex items-center gap-4 mt-2">
//                   <button
//                     onClick={handlePickAvatar}
//                     className="text-[12px] font-medium text-[#135BEC] hover:text-[#2A6BF0]"
//                   >
//                     Upload new picture
//                   </button>
//                   {avatarUrl && (
//                     <button
//                       onClick={handleRemoveAvatar}
//                       className="text-[12px] font-medium text-[#5A6A8A] hover:text-[#FF6B6B]"
//                     >
//                       Remove
//                     </button>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </section>

//           {/* ── Editable fields card ───────────────────────── */}
//           <section className="rounded-[14px] border border-white/[0.08] bg-[#0F1525] p-5 mb-4">
//             {isEditing ? (
//               <div className="space-y-4">
//                 <AuthInput
//                   label="Full name"
//                   value={name}
//                   onChange={e => setName(e.target.value)}
//                   autoFocus
//                 />
//                 <div className="flex items-center gap-2">
//                   <button
//                     onClick={handleSave}
//                     disabled={isSaving || !name.trim()}
//                     className={cn(
//                       'px-4 py-2 rounded-[10px] text-[13px] font-semibold transition-colors',
//                       isSaving || !name.trim()
//                         ? 'bg-white/[0.06] text-[#5A6A8A] cursor-not-allowed'
//                         : 'bg-[#135BEC] text-white hover:bg-[#2A6BF0]'
//                     )}
//                   >
//                     {isSaving ? 'Saving…' : 'Save'}
//                   </button>
//                   <button
//                     onClick={() => {
//                       setIsEditing(false)
//                       setName(session.name)
//                     }}
//                     className="px-4 py-2 rounded-[10px] text-[13px] font-medium text-[#A8B8D8] hover:text-[#E8F0FF] hover:bg-white/[0.05] transition-colors"
//                   >
//                     Cancel
//                   </button>
//                 </div>
//               </div>
//             ) : (
//               <div className="space-y-1">
//                 <FieldRow label="Full name" value={session.name} onEdit={() => setIsEditing(true)} />
//                 <FieldRow label="Email address" value={session.email} />
//                 <FieldRow
//                   label="Phone number"
//                   value={session.phone ? formatUkPhone(session.phone) : 'No phone number'}
//                   badge={session.phone ? 'Verified' : 'Missing'}
//                   onEdit={() => router.push(`/add-phone?returnTo=${encodeURIComponent('/dashboard/profile')}`)}
//                 />
//                 {saved && (
//                   <p className="text-[12px] text-[#135BEC] pt-2">Name updated.</p>
//                 )}
//               </div>
//             )}
//           </section>

//           {/* ── Workspace grid ──────────────────────────────── */}
//           <section className="rounded-[14px] border border-white/[0.08] bg-[#0F1525] p-5 mb-4">
//             <h2 className="text-[13px] font-semibold text-[#E8F0FF] mb-4">Workspace</h2>
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//               <StaticField label="Workspace type" value={workspace.internalLabel} />
//               <StaticField label="Account role" value={capitalize(session.role)} />
//               <StaticField
//                 label="Projects"
//                 value={workspace.projectLimit === 'unlimited' ? 'Unlimited' : `Up to ${workspace.projectLimit}`}
//               />
//               <StaticField label="Two-factor authentication" value={session.mfaEnabled ? 'On' : 'Off'} />
//             </div>
//             {!session.mfaEnabled && (
//               <button
//                 onClick={() => router.push('/mfa-setup')}
//                 className="mt-4 text-[12.5px] font-medium text-[#135BEC] hover:text-[#2A6BF0]"
//               >
//                 Set up two-factor authentication →
//               </button>
//             )}
//           </section>

//           {/* ── Update button ────────────────────────────────── */}
//           <button
//             onClick={() => !isEditing && setIsEditing(true)}
//             className="w-full mb-4 px-5 py-3 rounded-[10px] bg-[#135BEC] text-white text-[13.5px] font-semibold hover:bg-[#2A6BF0] transition-colors"
//           >
//             Update profile
//           </button>

//           {/* ── Delete account ───────────────────────────────── */}
//           <DeleteAccountSection accountName={session.name} />
//         </div>
//       </div>
//     </DashboardShell>
//   )
// }

// function isProfileComplete(checks: boolean[]) {
//   return checks.every(Boolean)
// }

// function RailItem({
//   label,
//   description,
//   active = false,
//   tone = 'default',
//   disabled = false,
//   onClick,
// }: {
//   label: string
//   description: string
//   active?: boolean
//   tone?: 'default' | 'danger'
//   disabled?: boolean
//   onClick?: () => void
// }) {
//   const interactive = Boolean(onClick) && !disabled

//   return (
//     <button
//       onClick={onClick}
//       disabled={disabled || !onClick}
//       className={cn(
//         'w-full text-left px-3 py-2.5 rounded-[10px] transition-colors mb-0.5 last:mb-0',
//         disabled && 'opacity-60 cursor-not-allowed',
//         !onClick && !disabled && 'cursor-default',
//         !disabled && active && 'bg-[rgba(19,91,236,0.1)]',
//         interactive && !active && 'hover:bg-white/[0.04]'
//       )}
//     >
//       <p
//         className={cn(
//           'text-[13px] font-medium',
//           tone === 'danger' ? 'text-[#FF6B6B]' : active ? 'text-[#135BEC]' : 'text-[#E8F0FF]'
//         )}
//       >
//         {label}
//       </p>
//       <p className="text-[11px] text-[#5A6A8A] mt-0.5">{description}</p>
//     </button>
//   )
// }

// function FieldRow({
//   label,
//   value,
//   badge,
//   onEdit,
// }: {
//   label: string
//   value: string
//   badge?: string
//   onEdit?: () => void
// }) {
//   return (
//     <div className="flex items-center justify-between gap-3 py-3 border-b border-white/[0.05] last:border-b-0">
//       <div className="min-w-0">
//         <p className="text-[11px] text-[#5A6A8A] mb-0.5">{label}</p>
//         <p className="text-[13px] text-[#E8F0FF] font-medium truncate">{value}</p>
//       </div>
//       <div className="flex items-center gap-3 shrink-0">
//         {badge && (
//           <span
//             className="text-[10.5px] font-medium px-2.5 py-1 rounded-full"
//             style={
//               badge === 'Verified'
//                 ? { background: 'rgba(19,91,236,0.1)', color: '#135BEC' }
//                 : { background: 'rgba(245,158,11,0.1)', color: '#F59E0B' }
//             }
//           >
//             {badge}
//           </span>
//         )}
//         {onEdit && (
//           <button
//             onClick={onEdit}
//             aria-label={`Edit ${label}`}
//             className="w-7 h-7 rounded-[8px] flex items-center justify-center text-[#5A6A8A] hover:text-[#135BEC] hover:bg-white/[0.05] transition-colors"
//           >
//             <PencilIcon />
//           </button>
//         )}
//       </div>
//     </div>
//   )
// }

// function StaticField({ label, value }: { label: string; value: string }) {
//   return (
//     <div>
//       <p className="text-[11px] text-[#5A6A8A] mb-0.5">{label}</p>
//       <p className="text-[13px] text-[#E8F0FF] font-medium">{value}</p>
//     </div>
//   )
// }

// function PencilIcon() {
//   return (
//     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//       <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
//     </svg>
//   )
// }

// function CameraIcon() {
//   return (
//     <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
//       <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
//       <circle cx="12" cy="13" r="4" />
//     </svg>
//   )
// }

// function formatUkPhone(e164: string) {
//   // "+447911123456" -> "+44 7911 123456"
//   const digits = e164.replace('+44', '')
//   if (digits.length !== 10) return e164
//   return `+44 ${digits.slice(0, 4)} ${digits.slice(4)}`
// }

// function capitalize(s: string) {
//   return s ? s.charAt(0).toUpperCase() + s.slice(1) : s
// }

'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

import { DashboardShell } from '@/components/dashboard/Dashboardshell'
import { AuthInput } from '@/components/auth'
import { useWorkspace, SESSION_STORAGE_KEY } from '@/hooks/Useworkspace'
import { useLogout } from '@/hooks/useLogout'
import { cn } from '@/lib/cn'
import { DashboardLoading } from '@/components/dashboard/DashboardLoading'
import { DeleteAccountSection } from '@/components/dashboard/DeleteAccountSection'
import { updateMe, uploadAvatar as uploadAvatarApi } from '@/lib/api'
import { resizeImageFile } from '@/lib/resizeImage'
import { useToast } from '@/components/ui/Toast'

/**
 * /dashboard/profile
 * ────────────────────
 * Account settings: identity, avatar, workspace/role, security (MFA)
 * status, and sign-out. Reads the session the same way the dashboard
 * does (useWorkspace), so it renders correctly for every workspace
 * tier without any actor-specific branching.
 *
 * Layout: a fixed left rail of settings sections (mirrors the rest of
 * the settings area) + a full-width content column on the right that
 * holds the personal-information form. Delete account and Log out are
 * intentionally the last items in the rail.
 *
 * Name and avatar save for real now — PATCH /api/auth/me for the name,
 * POST /api/uploads/avatar (Cloudinary, then persisted via the same
 * PATCH) for the photo. The local session cache is patched afterward
 * purely so the UI reflects it immediately without a refetch; the
 * server response is always the source of truth.
 *   phone number changes still route through /add-phone (OTP flow —
 *     the SMS send/verify itself is still mocked; only the final save
 *     step persists to the profile)
 *   MFA changes still route through /mfa-setup
 */

export default function ProfilePage() {
  const router = useRouter()
  const { isLoading, session, workspace, firstName } = useWorkspace()
  const { handleLogout, isLoggingOut } = useLogout()
  const { show } = useToast()

  const fileInputRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState('')

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)

  useEffect(() => {
    if (session?.name) setName(session.name)
  }, [session?.name])

  useEffect(() => {
    if (session?.avatarUrl) setAvatarUrl(session.avatarUrl)
  }, [session?.avatarUrl])

  if (isLoading) {
    return <DashboardLoading label="Loading your profile…" cards={2} />
  }

  if (!session || !workspace) {
    return (
      <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center px-5">
        <div className="text-center max-w-[360px]">
          <p className="font-display text-2xl text-[#E8F0FF] mb-2">No active session</p>
          <p className="text-[13px] text-[#5A6A8A] mb-6">
            Please log in to view your profile.
          </p>
          <button
            onClick={() => router.push('/login')}
            className="px-5 py-2.5 rounded-[10px] bg-[#135BEC] text-white text-sm font-semibold hover:bg-[#2A6BF0] transition-colors"
          >
            Go to login →
          </button>
        </div>
      </div>
    )
  }

  /** Patches whichever session fields changed into the local cache, keeping everything else — mirrors what the server just confirmed, not a guess. */
  function patchSessionCache(patch: Record<string, unknown>) {
    try {
      const raw = localStorage.getItem(SESSION_STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw)
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({ ...parsed, ...patch }))
    } catch {
      // Malformed cache — nothing to patch; the next full login rewrites it anyway.
    }
  }

  // "Update profile" now saves directly, in one click — no more
  // open-the-field-first toggle. Actually persists to Supabase via
  // PATCH /api/auth/me now, not just localStorage.
  async function handleSave() {
    if (!name.trim() || isSaving) return
    setIsSaving(true)
    setSaveError('')

    const { data, error } = await updateMe({ name: name.trim() })

    setIsSaving(false)

    if (error || !data) {
      setSaveError(error ?? 'Could not save your changes. Try again.')
      return
    }

    patchSessionCache({ name: data.name })
    setSaved(true)
    window.setTimeout(() => setSaved(false), 2000)
  }

  function handlePickAvatar() {
    fileInputRef.current?.click()
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = '' // allow picking the same file again later

    if (!file) return

    if (!file.type.startsWith('image/')) {
      show('Please choose an image file.', 'error')
      return
    }
    if (file.size > 15 * 1024 * 1024) {
      show('That image is too large — please choose one under 15MB.', 'error')
      return
    }

    setIsUploadingAvatar(true)
    try {
      // Resize/compress in the browser first — a phone photo can be
      // 5-10MB straight out of the camera, nobody needs that for a
      // 56px avatar circle, and it keeps the upload well under the
      // API route's size limit.
      const resized = await resizeImageFile(file)

      const { data, error } = await uploadAvatarApi(resized)
      if (error || !data) {
        show(error ?? 'Could not upload your photo. Try again.', 'error')
        return
      }

      setAvatarUrl(data.avatarUrl)
      patchSessionCache({ avatarUrl: data.avatarUrl })
    } catch {
      show('Could not process that image. Try a different photo.', 'error')
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  async function handleRemoveAvatar() {
    setIsUploadingAvatar(true)
    const { data, error } = await updateMe({ avatarUrl: null })
    setIsUploadingAvatar(false)

    if (error || !data) {
      show(error ?? 'Could not remove your photo. Try again.', 'error')
      return
    }

    setAvatarUrl(null)
    patchSessionCache({ avatarUrl: undefined })
  }

  const initials = firstName?.trim()?.[0]?.toUpperCase() || 'U'

  const completionChecks = [Boolean(session.name), Boolean(session.phone), session.mfaEnabled, Boolean(avatarUrl)]
  const completionPct = Math.round(
    (completionChecks.filter(Boolean).length / completionChecks.length) * 100
  )

  return (
    <DashboardShell workspace={workspace} firstName={firstName} email={session.email}>
      <div className="w-full max-w-none flex flex-col md:flex-row md:items-start gap-6">
        {/* ── Left rail ─────────────────────────────────────── */}
        <aside className="w-full md:w-[260px] md:shrink-0 flex flex-col gap-4">
          {!isProfileComplete(completionChecks) && (
            <div className="rounded-[14px] border border-[rgba(19,91,236,0.25)] bg-[rgba(19,91,236,0.08)] p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[12px] font-semibold text-[#E8F0FF]">Complete profile</p>
                <span className="text-[11px] font-semibold text-[#135BEC]">{completionPct}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/[0.08] overflow-hidden mb-3">
                <div
                  className="h-full rounded-full bg-[#135BEC] transition-all"
                  style={{ width: `${completionPct}%` }}
                />
              </div>
              {!session.mfaEnabled && (
                <button
                  onClick={() => router.push('/mfa-setup')}
                  className="w-full text-center px-3 py-2 rounded-[8px] bg-[#135BEC] text-white text-[12px] font-semibold hover:bg-[#2A6BF0] transition-colors"
                >
                  Verify identity
                </button>
              )}
            </div>
          )}

          <nav className="rounded-[14px] border border-white/[0.08] bg-[#0F1525] p-2">
            <RailItem label="Account information" description="Change your account information" active />
            <RailItem label="Password" description="Change your password" onClick={() => router.push('/dashboard/reset-password')} />
            <div className="my-2 h-px bg-white/[0.06]" />
            <RailItem
              label={isLoggingOut ? 'Logging out…' : 'Log out'}
              description="Sign out of this account"
              tone="danger"
              disabled={isLoggingOut}
              onClick={handleLogout}
            />
          </nav>

          {/* Delete account now lives in the sidebar rail, below the
              main nav, so it's out of the primary content column. */}
          <DeleteAccountSection accountName={session.name} />
        </aside>

        {/* ── Main content ─────────────────────────────────── */}
        <div className="flex-1 min-w-0">
          <h1 className="font-display text-[26px] sm:text-[30px] font-normal text-[#E8F0FF] tracking-tight mb-1">
            Personal information
          </h1>
          <p className="text-[13.5px] text-[#A8B8D8] mb-6">
            Manage your account details and security settings.
          </p>

          {/* ── Identity + avatar card ─────────────────────── */}
          <section className="rounded-[14px] border border-white/[0.08] bg-[#0F1525] p-5 mb-4">
            <div className="flex items-center gap-4 mb-2">
              <div className="relative shrink-0">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-[rgba(19,91,236,0.12)] border border-[rgba(19,91,236,0.3)] text-[#135BEC] text-[22px] font-semibold flex items-center justify-center">
                  {isUploadingAvatar ? (
                    <span className="w-4 h-4 rounded-full border-2 border-[#135BEC] border-t-transparent animate-spin" />
                  ) : avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    initials
                  )}
                </div>
                <button
                  onClick={handlePickAvatar}
                  disabled={isUploadingAvatar}
                  aria-label="Change profile photo"
                  className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#135BEC] border-2 border-[#0F1525] flex items-center justify-center hover:bg-[#2A6BF0] transition-colors disabled:opacity-50"
                >
                  <CameraIcon />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-semibold text-[#E8F0FF] truncate">{session.name}</p>
                <p className="text-[12.5px] text-[#5A6A8A] truncate">{capitalize(session.role)} · {workspace.internalLabel}</p>
                <div className="flex items-center gap-4 mt-2">
                  <button
                    onClick={handlePickAvatar}
                    disabled={isUploadingAvatar}
                    className="text-[12px] font-medium text-[#135BEC] hover:text-[#2A6BF0] disabled:opacity-50"
                  >
                    {isUploadingAvatar ? 'Uploading…' : 'Upload new picture'}
                  </button>
                  {avatarUrl && (
                    <button
                      onClick={handleRemoveAvatar}
                      disabled={isUploadingAvatar}
                      className="text-[12px] font-medium text-[#5A6A8A] hover:text-[#FF6B6B] disabled:opacity-50"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* ── Editable fields card ───────────────────────── */}
          <section className="rounded-[14px] border border-white/[0.08] bg-[#0F1525] p-5 mb-4">
            <div className="space-y-4">
              {/* Full name is always an editable input now — no more
                  click-to-open toggle. Typing here and pressing
                  "Update profile" below saves it in a single click. */}
              <AuthInput
                label="Full name"
                value={name}
                onChange={e => setName(e.target.value)}
              />

              <div className="space-y-1 pt-1">
                <FieldRow label="Email address" value={session.email} />
                <FieldRow
                  label="Phone number"
                  value={session.phone ? formatUkPhone(session.phone) : 'No phone number'}
                  badge={session.phone ? 'Verified' : 'Missing'}
                  onEdit={() => router.push(`/add-phone?returnTo=${encodeURIComponent('/dashboard/profile')}`)}
                />
                <FieldRow
                  label="Two-factor authentication"
                  value={session.mfaEnabled ? 'Enabled' : 'Not enabled'}
                  badge={session.mfaEnabled ? 'On' : 'Off'}
                  onEdit={() => router.push('/mfa-setup')}
                />
              </div>

              {saved && (
                <p className="text-[12px] text-[#135BEC]">Profile updated.</p>
              )}
              {saveError && (
                <p className="text-[12px] text-[#F87171]" role="alert">{saveError}</p>
              )}
            </div>
          </section>

          {/* ── Workspace grid ──────────────────────────────── */}
          <section className="rounded-[14px] border border-white/[0.08] bg-[#0F1525] p-5 mb-4">
            <h2 className="text-[13px] font-semibold text-[#E8F0FF] mb-4">Workspace</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <StaticField label="Workspace type" value={workspace.internalLabel} />
              <StaticField label="Account role" value={capitalize(session.role)} />
              <StaticField
                label="Projects"
                value={workspace.projectLimit === 'unlimited' ? 'Unlimited' : `Up to ${workspace.projectLimit}`}
              />
              <StaticField label="Two-factor authentication" value={session.mfaEnabled ? 'On' : 'Off'} />
            </div>
          </section>

          {/* ── Update button ────────────────────────────────── */}
          {/* ── Update button ────────────────────────────────── */}
          <button
            onClick={handleSave}
            disabled={isSaving || !name.trim()}
            className={cn(
              'w-full mb-4 px-5 py-3 rounded-[10px] text-[13.5px] font-semibold transition-colors',
              isSaving || !name.trim()
                ? 'bg-white/[0.06] text-[#5A6A8A] cursor-not-allowed'
                : 'bg-[#135BEC] text-white hover:bg-[#2A6BF0]'
            )}
          >
            {isSaving ? 'Saving…' : 'Update profile'}
          </button>
        </div>
      </div>
    </DashboardShell>
  )
}

function isProfileComplete(checks: boolean[]) {
  return checks.every(Boolean)
}

function RailItem({
  label,
  description,
  active = false,
  tone = 'default',
  disabled = false,
  onClick,
}: {
  label: string
  description: string
  active?: boolean
  tone?: 'default' | 'danger'
  disabled?: boolean
  onClick?: () => void
}) {
  const interactive = Boolean(onClick) && !disabled

  return (
    <button
      onClick={onClick}
      disabled={disabled || !onClick}
      className={cn(
        'w-full text-left px-3 py-2.5 rounded-[10px] transition-colors mb-0.5 last:mb-0',
        disabled && 'opacity-60 cursor-not-allowed',
        !onClick && !disabled && 'cursor-default',
        !disabled && active && 'bg-[rgba(19,91,236,0.1)]',
        interactive && !active && 'hover:bg-white/[0.04]'
      )}
    >
      <p
        className={cn(
          'text-[13px] font-medium',
          tone === 'danger' ? 'text-[#FF6B6B]' : active ? 'text-[#135BEC]' : 'text-[#E8F0FF]'
        )}
      >
        {label}
      </p>
      <p className="text-[11px] text-[#5A6A8A] mt-0.5">{description}</p>
    </button>
  )
}

function FieldRow({
  label,
  value,
  badge,
  onEdit,
}: {
  label: string
  value: string
  badge?: string
  onEdit?: () => void
}) {
  const isPositiveBadge = badge === 'Verified' || badge === 'On'

  return (
    <div className="flex items-center justify-between gap-3 py-3 border-b border-white/[0.05] last:border-b-0">
      <div className="min-w-0">
        <p className="text-[11px] text-[#5A6A8A] mb-0.5">{label}</p>
        <p className="text-[13px] text-[#E8F0FF] font-medium truncate">{value}</p>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {badge && (
          <span
            className="text-[10.5px] font-medium px-2.5 py-1 rounded-full"
            style={
              isPositiveBadge
                ? { background: 'rgba(19,91,236,0.1)', color: '#135BEC' }
                : { background: 'rgba(245,158,11,0.1)', color: '#F59E0B' }
            }
          >
            {badge}
          </span>
        )}
        {onEdit && (
          <button
            onClick={onEdit}
            aria-label={`Edit ${label}`}
            className="w-7 h-7 rounded-[8px] flex items-center justify-center text-[#5A6A8A] hover:text-[#135BEC] hover:bg-white/[0.05] transition-colors"
          >
            <PencilIcon />
          </button>
        )}
      </div>
    </div>
  )
}

function StaticField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] text-[#5A6A8A] mb-0.5">{label}</p>
      <p className="text-[13px] text-[#E8F0FF] font-medium">{value}</p>
    </div>
  )
}

function PencilIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
    </svg>
  )
}

function CameraIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  )
}

function formatUkPhone(e164: string) {
  // "+447911123456" -> "+44 7911 123456"
  const digits = e164.replace('+44', '')
  if (digits.length !== 10) return e164
  return `+44 ${digits.slice(0, 4)} ${digits.slice(4)}`
}

function capitalize(s: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s
}