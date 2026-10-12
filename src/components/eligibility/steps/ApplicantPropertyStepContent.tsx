// 'use client'

// import { useState } from 'react'
// import { councilFor } from '@/lib/constraints'
// import type { EligibilityStepContentProps } from '../types'

// /**
//  * ApplicantPropertyStepContent
//  * ───────────────────────────────
//  * Adapted from the uploaded reference implementation. The original
//  * pulled council/address lookups from a live `ProjectContext` + a
//  * `localhost:8000` API — neither exists here, so "Get address" below
//  * resolves the council with our existing lib/constraints.ts mock
//  * instead (same one the address-check step already uses), with a
//  * short simulated delay so the button's loading state still means
//  * something.
//  */
// export function ApplicantPropertyStepContent({
//   savedFormData,
//   updateSection,
//   asStringValue,
//   components,
//   isSectionVisible = () => true,
// }: EligibilityStepContentProps) {
//   const otherOwnersDetailsLabel = 'Names & Addresses of Other Owners (if Certificate B, C or D)'
//   const { SectionHeading, Input, PhoneNumberField, RadioGroupField, SelectField, FieldLabel, CheckboxGroup } = components
//   const [isGettingAddress, setIsGettingAddress] = useState(false)

//   const previousCouncilApplication = savedFormData['have you previously applied to any council?']
//   const useAlternateCorrespondenceAddress =
//     asStringValue(savedFormData['Is this address same as site address?']).trim() === 'No'
//   const siteAddressLine1 = asStringValue(savedFormData['Site Address Line 1']).trim()
//   const postcode = asStringValue(savedFormData['Postcode']).trim()
//   const planningReferenceNumber = asStringValue(savedFormData['Planning Reference Number *']).trim()

//   function updateFormData(nextValues: Record<string, string>) {
//     updateSection('eligibility', { formData: { ...savedFormData, ...nextValues } })
//   }

//   function buildAddressLine2(addressLine: string, value: string) {
//     const normalizedAddress = addressLine.replace(/\s+/g, ' ').trim()
//     const outwardCode = value.trim().toUpperCase().split(/\s+/)[0] || 'LOCAL'
//     if (normalizedAddress.includes(',')) {
//       const detail = normalizedAddress.split(',').slice(1).join(',').trim()
//       if (detail) return detail
//     }
//     return `Auto-filled locality for ${outwardCode}`
//   }

//   function handleGetAddress() {
//     if (!siteAddressLine1 || !postcode || isGettingAddress) return
//     setIsGettingAddress(true)
//     // Simulated latency — mirrors the address-check step's mock constraint lookup.
//     window.setTimeout(() => {
//       const currentAddressLine2 = asStringValue(savedFormData['Site Address Line 2']).trim()
//       const currentCouncil = asStringValue(savedFormData['Council']).trim()
//       updateFormData({
//         'Site Address Line 2': currentAddressLine2 || buildAddressLine2(siteAddressLine1, postcode),
//         Council: currentCouncil || councilFor(postcode),
//       })
//       setIsGettingAddress(false)
//     }, 900)
//   }

//   function handleGetPreApplicationDetails() {
//     if (!planningReferenceNumber) return
//     updateFormData({
//       Council: asStringValue(savedFormData['Council']).trim() || councilFor(postcode || 'LOCAL'),
//       'Type of Application *':
//         asStringValue(savedFormData['Type of Application *']).trim() || 'Householder Planning Application',
//       'Type of Development Previously Proposed':
//         asStringValue(savedFormData['Type of Development Previously Proposed']).trim() || 'Rear extension',
//       'Is this project similar to the previous application or different this time?':
//         asStringValue(
//           savedFormData['Is this project similar to the previous application or different this time?']
//         ).trim() || 'Yes',
//       'What was previously proposed, and was it approved, refused, or withdrawn?':
//         asStringValue(
//           savedFormData['What was previously proposed, and was it approved, refused, or withdrawn?']
//         ).trim() || `Reference ${planningReferenceNumber} reviewed by the council. Previous scheme details have been brought in for review.`,
//     })
//   }

//   if (!SectionHeading || !Input || !PhoneNumberField || !RadioGroupField || !SelectField || !FieldLabel || !CheckboxGroup) {
//     return null
//   }

//   return (
//     <>
//       <SectionHeading>Applicant Details</SectionHeading>
//       <div className="mb-6 space-y-6">
//         <div className="grid gap-6 md:grid-cols-3">
//           <Input label="Applicant First Name" />
//           <Input label="Applicant Middle Name" />
//           <Input label="Applicant Last Name" />
//         </div>
//         <div className="grid gap-6 md:grid-cols-2">
//           <Input label="Email Address" />
//           <PhoneNumberField />
//         </div>
//         <div className="grid gap-6 md:grid-cols-2">
//           <div className="md:col-span-2 grid gap-6">
//             <div className="grid gap-6 md:grid-cols-2">
//               <Input label="Correspondence Address Line 1" />
//               <Input label="Correspondence Address Line 2" />
//             </div>
//             <div className="grid gap-6 md:grid-cols-2">
//               <Input label="Correspondence Council" />
//               <Input label="Correspondence Postcode" autocompleteKind="postcode" />
//             </div>
//           </div>
//           <div className="md:col-span-2">
//             <RadioGroupField
//               label="Is this address same as site address?"
//               options={['Yes', 'No']}
//               tooltip="Choose Yes if the site address is the same as the correspondence address."
//             />
//           </div>

//           {useAlternateCorrespondenceAddress && (
//             <div className="md:col-span-2 grid gap-6">
//               <div className="grid gap-6 md:grid-cols-3">
//                 <div className="md:col-span-2">
//                   <Input label="Site Address Line 1" />
//                 </div>
//                 <Input label="Site Address Line 2" />
//               </div>
//               <div className="grid gap-6 md:grid-cols-2">
//                 <Input label="Council" />
//                 <Input
//                   label="Postcode"
//                   autocompleteKind="postcode"
//                   actionLabel={isGettingAddress ? 'Getting…' : 'Get address'}
//                   onAction={handleGetAddress}
//                   actionDisabled={!siteAddressLine1 || !postcode || isGettingAddress}
//                 />
//               </div>
//             </div>
//           )}
//         </div>
//       </div>

//       <SectionHeading>Pre-Application Check</SectionHeading>
//       <div className="grid gap-6 md:grid-cols-2 mb-6">
//         <div className="col-span-2">
//           <RadioGroupField
//             label="have you previously applied to any council?"
//             options={['Yes', 'No']}
//             tooltip="If yes, we will collect details about the earlier council application before proceeding."
//           />
//         </div>

//         {previousCouncilApplication === 'Yes' && (
//           <div className="col-span-2 grid gap-6 md:grid-cols-2">
//             <div className="col-span-2">
//               <FieldLabel label="What was previously proposed, and was it approved, refused, or withdrawn?" wrapperClassName="mb-1.5" />
//               <textarea
//                 rows={3}
//                 placeholder="Describe the earlier proposal, what was applied for, and whether it was approved, refused, or withdrawn..."
//                 className="w-full resize-none rounded-[10px] border border-white/[0.12] bg-[#141C30] px-3.5 py-2.5 text-[13.5px] text-[#E8F0FF] placeholder:text-[#5A6A8A] outline-none focus:border-[#135BEC] focus:shadow-[0_0_0_3px_rgba(19,91,236,0.12)]"
//                 value={asStringValue(savedFormData['What was previously proposed, and was it approved, refused, or withdrawn?'])}
//                 onChange={e =>
//                   updateSection('eligibility', {
//                     formData: {
//                       ...savedFormData,
//                       'What was previously proposed, and was it approved, refused, or withdrawn?': e.target.value,
//                     },
//                   })
//                 }
//               />
//             </div>
//             <Input
//               label="Planning Reference Number *"
//               actionLabel="Get details"
//               onAction={handleGetPreApplicationDetails}
//               actionDisabled={!planningReferenceNumber}
//               actionMessage="Pulling in the remaining pre-application details from the reference number."
//             />
//             <Input label="Council" questionNumber={0} fieldIdOverride="eligibility-field-council-pre-application" />
//             <Input label="Type of Application *" />
//             <Input
//               label="Type of Development Previously Proposed"
//               placeholder="For example: boundary wall, bridge, rear extension, access road"
//             />
//             <div className="col-span-2">
//               <RadioGroupField
//                 label="Is this project similar to the previous application or different this time?"
//                 options={['Yes', 'No']}
//                 tooltip="Let us know whether the new proposal is broadly the same as the earlier application or a different scheme."
//               />
//             </div>
//           </div>
//         )}
//       </div>

//       <SectionHeading>Property &amp; Ownership</SectionHeading>
//       <div className="grid gap-6 md:grid-cols-2 mb-2">
//         <SelectField
//           label="Property Type"
//           options={[
//             'Detached house',
//             'Semi-detached house',
//             'Terraced house',
//             'End Terrace',
//             'Converted Flat',
//             'Flat / Maisonette',
//             'Bungalow',
//             'Other / Ask Agent Z',
//           ]}
//           consultTrigger="We can help identify your property type."
//         />
//         <SelectField
//           label="Ownership Status"
//           options={[
//             'Freehold (Certificate A)',
//             'Leasehold with known freeholder (Certificate B)',
//             'Shared/agricultural tenancy (Certificate C)',
//             'Unknown owner (Certificate D)',
//             'Ask Agent Z',
//           ]}
//           consultTrigger="We can assist with land registry checks."
//         />
//         <div className="col-span-2">
//           <FieldLabel label={otherOwnersDetailsLabel} wrapperClassName="mb-1.5" />
//           <textarea
//             rows={2}
//             placeholder="List any other known owners or agricultural tenants..."
//             className="w-full resize-none rounded-[10px] border border-white/[0.12] bg-[#141C30] px-3.5 py-2.5 text-[13.5px] text-[#E8F0FF] placeholder:text-[#5A6A8A] outline-none focus:border-[#135BEC] focus:shadow-[0_0_0_3px_rgba(19,91,236,0.12)]"
//             value={asStringValue(savedFormData[otherOwnersDetailsLabel])}
//             onChange={e =>
//               updateSection('eligibility', { formData: { ...savedFormData, [otherOwnersDetailsLabel]: e.target.value } })
//             }
//           />
//         </div>
//         <CheckboxGroup
//           label="Are you planning any building works?"
//           options={[
//             'Rear extension',
//             'Side extension',
//             'Loft conversion',
//             'Internal wall changes',
//             'Additional bathroom',
//             'New build',
//             'Unsure / Ask Agent Z',
//           ]}
//           optionStyleOverrides={{ 'Unsure / Ask Agent Z': { hideIndicator: true, centerLabel: true } }}
//           consultTrigger="A consultant can help clarify the development type."
//         />
//         <div className="col-span-2">
//           <RadioGroupField label="Has the property already been extended before?" options={['Yes', 'No', 'Unsure / Ask Agent Z']} />
//         </div>
//       </div>

//       {isSectionVisible('Current Use Status') && (
//         <>
//           <SectionHeading>Current Use Status</SectionHeading>
//           <div className="grid gap-6 md:grid-cols-2 mb-2">
//             <SelectField
//               label="How is the property currently used?"
//               options={['Single family home', 'Vacant', 'Already shared by tenants', 'Let room-by-room', 'Other']}
//             />
//             <Input label="How many people currently live there?" placeholder="Enter number of occupants" />
//             <div className="col-span-2">
//               <RadioGroupField label="Are they one family or separate households?" options={['One household', '2 households', '3+ households']} />
//             </div>
//           </div>
//         </>
//       )}

//       {isSectionVisible('Proposed HMO Use') && (
//         <>
//           <SectionHeading>Proposed HMO Use</SectionHeading>
//           <div className="grid gap-6 md:grid-cols-2 mb-2">
//             <div className="col-span-2">
//               <RadioGroupField label="How many occupants do you plan to accommodate?" options={['3', '4', '5', '6', 'More than 6']} />
//             </div>
//             <RadioGroupField label="Will occupants share kitchen/bathroom?" options={['Yes', 'No', "Don't know / Ask Agent Z"]} />
//             <RadioGroupField label="Will rooms be rented individually?" options={['Yes', 'No', "Don't know / Ask Agent Z"]} />
//             <RadioGroupField label="Is there a communal kitchen?" options={['Yes', 'No', 'Planning to create one / Ask Agent Z']} />
//             <RadioGroupField label="Is any lounge/dining room proposed as a bedroom?" options={['Yes', 'No']} />
//           </div>
//         </>
//       )}
//     </>
//   )
// }


'use client'

import { useState } from 'react'
import { resolveAddressData } from '@/lib/liveAddressLookup'
import type { EligibilityStepContentProps } from '../types'

/**
 * ApplicantPropertyStepContent
 * ───────────────────────────────
 * Adapted from the uploaded reference implementation. The original
 * pulled council/address lookups from a live `ProjectContext` + a
 * `localhost:8000` API — neither exists here, so "Get address" below
 * resolves the council with the real postcodes.io + planning.data.gov.uk
 * lookup (see lib/liveAddressLookup.ts — same one the address-check
 * step uses), falling back to the deterministic mock only if that
 * live lookup fails.
 */
export function ApplicantPropertyStepContent({
  savedFormData,
  updateSection,
  asStringValue,
  components,
  isSectionVisible = () => true,
}: EligibilityStepContentProps) {
  const otherOwnersDetailsLabel = 'Names & Addresses of Other Owners (if Certificate B, C or D)'
  const { SectionHeading, Input, PhoneNumberField, RadioGroupField, SelectField, FieldLabel, CheckboxGroup } = components
  const [isGettingAddress, setIsGettingAddress] = useState(false)

  const previousCouncilApplication = savedFormData['have you previously applied to any council?']
  const useAlternateCorrespondenceAddress =
    asStringValue(savedFormData['Is this address same as site address?']).trim() === 'No'
  const siteAddressLine1 = asStringValue(savedFormData['Site Address Line 1']).trim()
  const postcode = asStringValue(savedFormData['Postcode']).trim()
  const planningReferenceNumber = asStringValue(savedFormData['Planning Reference Number *']).trim()

  function updateFormData(nextValues: Record<string, string>) {
    updateSection('eligibility', { formData: { ...savedFormData, ...nextValues } })
  }

  function buildAddressLine2(addressLine: string, value: string) {
    const normalizedAddress = addressLine.replace(/\s+/g, ' ').trim()
    const outwardCode = value.trim().toUpperCase().split(/\s+/)[0] || 'LOCAL'
    if (normalizedAddress.includes(',')) {
      const detail = normalizedAddress.split(',').slice(1).join(',').trim()
      if (detail) return detail
    }
    return `Auto-filled locality for ${outwardCode}`
  }

  async function handleGetAddress() {
    if (!siteAddressLine1 || !postcode || isGettingAddress) return
    setIsGettingAddress(true)
    const currentAddressLine2 = asStringValue(savedFormData['Site Address Line 2']).trim()
    const currentCouncil = asStringValue(savedFormData['Council']).trim()
    const resolved = currentCouncil ? null : await resolveAddressData(postcode)
    updateFormData({
      'Site Address Line 2': currentAddressLine2 || buildAddressLine2(siteAddressLine1, postcode),
      Council: currentCouncil || resolved?.council || '',
    })
    setIsGettingAddress(false)
  }

  async function handleGetPreApplicationDetails() {
    if (!planningReferenceNumber) return
    const currentCouncil = asStringValue(savedFormData['Council']).trim()
    const resolvedCouncil = currentCouncil || (await resolveAddressData(postcode || 'LOCAL')).council
    updateFormData({
      Council: resolvedCouncil,
      'Type of Application *':
        asStringValue(savedFormData['Type of Application *']).trim() || 'Householder Planning Application',
      'Type of Development Previously Proposed':
        asStringValue(savedFormData['Type of Development Previously Proposed']).trim() || 'Rear extension',
      'Is this project similar to the previous application or different this time?':
        asStringValue(
          savedFormData['Is this project similar to the previous application or different this time?']
        ).trim() || 'Yes',
      'What was previously proposed, and was it approved, refused, or withdrawn?':
        asStringValue(
          savedFormData['What was previously proposed, and was it approved, refused, or withdrawn?']
        ).trim() || `Reference ${planningReferenceNumber} reviewed by the council. Previous scheme details have been brought in for review.`,
    })
  }

  if (!SectionHeading || !Input || !PhoneNumberField || !RadioGroupField || !SelectField || !FieldLabel || !CheckboxGroup) {
    return null
  }

  return (
    <>
      <SectionHeading>Applicant Details</SectionHeading>
      <div className="mb-6 space-y-6">
        <div className="grid gap-6 md:grid-cols-3">
          <Input label="Applicant First Name" />
          <Input label="Applicant Middle Name" />
          <Input label="Applicant Last Name" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Input label="Email Address" />
          <PhoneNumberField />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="md:col-span-2 grid gap-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Input label="Correspondence Address Line 1" />
              <Input label="Correspondence Address Line 2" />
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <Input label="Correspondence Council" />
              <Input label="Correspondence Postcode" autocompleteKind="postcode" />
            </div>
          </div>
          <div className="md:col-span-2">
            <RadioGroupField
              label="Is this address same as site address?"
              options={['Yes', 'No']}
              tooltip="Choose Yes if the site address is the same as the correspondence address."
            />
          </div>

          {useAlternateCorrespondenceAddress && (
            <div className="md:col-span-2 grid gap-6">
              <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-2">
                  <Input label="Site Address Line 1" />
                </div>
                <Input label="Site Address Line 2" />
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                <Input label="Council" />
                <Input
                  label="Postcode"
                  autocompleteKind="postcode"
                  actionLabel={isGettingAddress ? 'Getting…' : 'Get address'}
                  onAction={handleGetAddress}
                  actionDisabled={!siteAddressLine1 || !postcode || isGettingAddress}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <SectionHeading>Pre-Application Check</SectionHeading>
      <div className="grid gap-6 md:grid-cols-2 mb-6">
        <div className="col-span-2">
          <RadioGroupField
            label="have you previously applied to any council?"
            options={['Yes', 'No']}
            tooltip="If yes, we will collect details about the earlier council application before proceeding."
          />
        </div>

        {previousCouncilApplication === 'Yes' && (
          <div className="col-span-2 grid gap-6 md:grid-cols-2">
            <div className="col-span-2">
              <FieldLabel label="What was previously proposed, and was it approved, refused, or withdrawn?" wrapperClassName="mb-1.5" />
              <textarea
                rows={3}
                placeholder="Describe the earlier proposal, what was applied for, and whether it was approved, refused, or withdrawn..."
                className="w-full resize-none rounded-[10px] border border-white/[0.12] bg-[#141C30] px-3.5 py-2.5 text-[13.5px] text-[#E8F0FF] placeholder:text-[#5A6A8A] outline-none focus:border-[#135BEC] focus:shadow-[0_0_0_3px_rgba(19,91,236,0.12)]"
                value={asStringValue(savedFormData['What was previously proposed, and was it approved, refused, or withdrawn?'])}
                onChange={e =>
                  updateSection('eligibility', {
                    formData: {
                      ...savedFormData,
                      'What was previously proposed, and was it approved, refused, or withdrawn?': e.target.value,
                    },
                  })
                }
              />
            </div>
            <Input
              label="Planning Reference Number *"
              actionLabel="Get details"
              onAction={handleGetPreApplicationDetails}
              actionDisabled={!planningReferenceNumber}
              actionMessage="Pulling in the remaining pre-application details from the reference number."
            />
            <Input label="Council" questionNumber={0} fieldIdOverride="eligibility-field-council-pre-application" />
            <Input label="Type of Application *" />
            <Input
              label="Type of Development Previously Proposed"
              placeholder="For example: boundary wall, bridge, rear extension, access road"
            />
            <div className="col-span-2">
              <RadioGroupField
                label="Is this project similar to the previous application or different this time?"
                options={['Yes', 'No']}
                tooltip="Let us know whether the new proposal is broadly the same as the earlier application or a different scheme."
              />
            </div>
          </div>
        )}
      </div>

      <SectionHeading>Property &amp; Ownership</SectionHeading>
      <div className="grid gap-6 md:grid-cols-2 mb-2">
        <SelectField
          label="Property Type"
          options={[
            'Detached house',
            'Semi-detached house',
            'Terraced house',
            'End Terrace',
            'Converted Flat',
            'Flat / Maisonette',
            'Bungalow',
            'Other / Ask Agent Z',
          ]}
          consultTrigger="We can help identify your property type."
        />
        <SelectField
          label="Ownership Status"
          options={[
            'Freehold (Certificate A)',
            'Leasehold with known freeholder (Certificate B)',
            'Shared/agricultural tenancy (Certificate C)',
            'Unknown owner (Certificate D)',
            'Ask Agent Z',
          ]}
          consultTrigger="We can assist with land registry checks."
        />
        <div className="col-span-2">
          <FieldLabel label={otherOwnersDetailsLabel} wrapperClassName="mb-1.5" />
          <textarea
            rows={2}
            placeholder="List any other known owners or agricultural tenants..."
            className="w-full resize-none rounded-[10px] border border-white/[0.12] bg-[#141C30] px-3.5 py-2.5 text-[13.5px] text-[#E8F0FF] placeholder:text-[#5A6A8A] outline-none focus:border-[#135BEC] focus:shadow-[0_0_0_3px_rgba(19,91,236,0.12)]"
            value={asStringValue(savedFormData[otherOwnersDetailsLabel])}
            onChange={e =>
              updateSection('eligibility', { formData: { ...savedFormData, [otherOwnersDetailsLabel]: e.target.value } })
            }
          />
        </div>
        <CheckboxGroup
          label="Are you planning any building works?"
          options={[
            'Rear extension',
            'Side extension',
            'Loft conversion',
            'Internal wall changes',
            'Additional bathroom',
            'New build',
            'Unsure / Ask Agent Z',
          ]}
          optionStyleOverrides={{ 'Unsure / Ask Agent Z': { hideIndicator: true, centerLabel: true } }}
          consultTrigger="A consultant can help clarify the development type."
        />
        <div className="col-span-2">
          <RadioGroupField label="Has the property already been extended before?" options={['Yes', 'No', 'Unsure / Ask Agent Z']} />
        </div>
      </div>

      {isSectionVisible('Current Use Status') && (
        <>
          <SectionHeading>Current Use Status</SectionHeading>
          <div className="grid gap-6 md:grid-cols-2 mb-2">
            <SelectField
              label="How is the property currently used?"
              options={['Single family home', 'Vacant', 'Already shared by tenants', 'Let room-by-room', 'Other']}
            />
            <Input label="How many people currently live there?" placeholder="Enter number of occupants" />
            <div className="col-span-2">
              <RadioGroupField label="Are they one family or separate households?" options={['One household', '2 households', '3+ households']} />
            </div>
          </div>
        </>
      )}

      {isSectionVisible('Proposed HMO Use') && (
        <>
          <SectionHeading>Proposed HMO Use</SectionHeading>
          <div className="grid gap-6 md:grid-cols-2 mb-2">
            <div className="col-span-2">
              <RadioGroupField label="How many occupants do you plan to accommodate?" options={['3', '4', '5', '6', 'More than 6']} />
            </div>
            <RadioGroupField label="Will occupants share kitchen/bathroom?" options={['Yes', 'No', "Don't know / Ask Agent Z"]} />
            <RadioGroupField label="Will rooms be rented individually?" options={['Yes', 'No', "Don't know / Ask Agent Z"]} />
            <RadioGroupField label="Is there a communal kitchen?" options={['Yes', 'No', 'Planning to create one / Ask Agent Z']} />
            <RadioGroupField label="Is any lounge/dining room proposed as a bedroom?" options={['Yes', 'No']} />
          </div>
        </>
      )}
    </>
  )
}