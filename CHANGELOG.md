# Changelog

## 1.1.0 — 2026-04-17

### Added
- `logClick()` — now correctly reports CTA button clicks to Firebase Analytics (was a no-op stub in v1.0.x)
- `logDismiss()` — new method to report message dismissals to Firebase Analytics
- `campaignId`, `campaignName`, `data` fields in `InAppMessagePayload` (iOS parity with Android)
- CARD message type support on iOS (`InAppMessagingCardDisplay`)
- Normalized `type` field — returns `"BANNER"`, `"MODAL"`, `"CARD"`, `"IMAGE_ONLY"` on both platforms
- Automatic impression tracking on iOS (already existed on Android)
- GitHub Actions CI — type check and lint on every PR

### Fixed
- `campaignName` returning `nil` on iOS due to missing fallback
- `type` field returning Swift class names (e.g. `"InAppMessagingBannerDisplay"`) instead of clean strings
- `android/build/` artifacts being included in the npm package (902 kB → 32 kB)

### Changed
- README rewritten in English with full API reference, comparison table, and platform notes
- `isTestMessage` is now `optional` in TypeScript types (Android only — not available in Firebase iOS SDK)
- npm keywords expanded for better search discoverability

---

## 1.0.3 — 2025-xx-xx

- Initial public release
- Basic Firebase In-App Messaging interception on iOS and Android
- `onMessage` event, `getPendingMessage()`, `setMessagesSuppressed()`, `triggerEvent()`
