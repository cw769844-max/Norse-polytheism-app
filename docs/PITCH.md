# Hearth & Well — Product Pitch

*A companion for modern Heathen practice, grounded in the sources.*

The name comes from the two centers of Norse religious life: the household
**hearth**, where most worship actually happened, and **Urðr's Well** at the
root of Yggdrasil, where the Norns shape what is. The app tries to be both: it
helps you practice day to day, and it takes you back to the primary sources.

## The problem

Modern Heathens piece their practice together from PDFs of Edda translations,
forum threads, rune apps that are mostly fortune-telling, and chat servers. No
single tool:

1. Helps you actually **practice**: rituals, calendar, offerings, reflection.
2. Is honest about **what the sources say vs. modern practice vs. personal experience**.
3. Is plainly **inclusive** and keeps out the folkish and racist misuse of the tradition.

## Audience

- **Seekers** who are new and don't know where to start
- **Solitary practitioners** who want structure
- **Kindreds**: small local groups coordinating holy tides
- **Lore enthusiasts** who want to read the Eddas and sagas with good notes

## Platform

Native **iOS and Android** from day one, built with **React Native + Expo**
(TypeScript), one codebase for both stores.

- Supports older and cheaper devices (iOS 15+, Android 8+), with lore shipped
  as optional downloadable packs to keep the install small.
- **Offline-first**: calendar, lore, rituals and journal all work without signal.
- Localization built in from the start (English first; Icelandic, Norwegian,
  Swedish, Danish, German, Spanish and Portuguese planned).
- Accessibility: OS font scaling, VoiceOver/TalkBack, reduced motion, WCAG AA contrast.
- Tablet layouts (side-by-side Old Norse and English reading).
- Over-the-air updates via EAS for content and calendar fixes.

## Core features

### 1. The Hearth (daily practice)
- **Your vé**: log offerings (mead, bread, a poem, time), optional altar photos.
- **Daily stanza** from the Hávamál or another source, with commentary and a reflection prompt.
- **Gentle rhythms**, never guilt-driven streaks.
- **Ritual builder** for blót and sumbel, with a "lead mode" readable at an outdoor altar.

### 2. The Wheel (sacred calendar)
- Holy tides: Yule, Þorrablót, Dísablót, Sigrblót / Summer Finding, Midsummer,
  Freyfaxi, Haustblót, Winter Nights.
- **Configurable reckoning**: solar (modern common), lunar (full-moon
  reconstruction), or the Old Icelandic calendar.
- Moon phases and solar events; southern-hemisphere flipping.
- Notifications with prep checklists.

### 3. The Well (lore library)
- Poetic Edda, Prose Edda and key sagas in public-domain translations, with
  the Old Norse alongside (Hávamál and Völuspá done, from the 1904 edition
  Bellows translated).
- Annotations, kennings explained, cultural context.
- Deity and wight profiles where every claim is **tagged by source tier**:
  - 📜 **Attested**: from the primary sources, with citation
  - 🔬 **Scholarly**: academic reconstruction or archaeology
  - 🔥 **Community practice**: common modern Heathen custom
  - 🌙 **UPG** (unverified personal gnosis): individual experience, clearly marked
- Old Norse pronunciation audio.

### 4. Runes
- **Younger Futhark is the primary reference.** It was the script of the Viking
  Age (in use from roughly the 8th century), the period whose religion the Eddas
  remember, and it is the only futhark with Norse rune poems: the Norwegian rune
  poem (13th century) and the Icelandic rune poem (15th century) both describe
  its 16 runes. *(Built: Runes tab with both poems from Dickins' 1915 edition.)*
- The Eddic poems themselves were never written in runes: they survive in Latin
  script in 13th-century Icelandic manuscripts such as the Codex Regius.
- **Elder Futhark** (24 runes, c. 2nd–8th centuries) is included as the historical
  predecessor and because it is widely used in modern practice. Its rune names
  are scholarly reconstructions, and that is labelled clearly.
- Rune-poem meanings (📜 Attested) kept separate from modern esoteric and
  divinatory interpretations (🔥 Community / 🌙 UPG).
- Draw-and-reflect for contemplation, not prediction; a rune journal.

### 5. Kindred (community)
- Opt-in kindred finder; listed groups sign an inclusive values pledge
  (modeled on Declaration 127-style statements).
- Shared calendars, RSVPs, rotating roles, private sumbel logs.
- Zero tolerance for racist "folkish" ideology, shown in onboarding.

### 6. The Hall (journal)
- Entries tagged by deity, tide or rune; private by default, end-to-end
  encrypted, exportable as Markdown.

## Design language

| Element | Direction |
|---|---|
| Mood | Quiet, warm, a little wild: firelight in a longhouse, not a metal album cover |
| Palette | Soot, hearth amber, birch white, moss green, iron grey; dark-first |
| Type | EB Garamond for headings, Inter for reading; full Old Norse character support |
| Ornament | Restrained Urnes/Ringerike-inspired knotwork; no horned helmets |
| Motion | Ember-flicker transitions; the Wheel turns with the season |
| Accessibility | WCAG AA, dyslexia-friendly reading mode, screen reader support |

## Funding model: "A gift calls for a gift"

> *"Better no prayer than too big an offering, / By thy getting measure thy gift."*
> (Hávamál 146, tr. Bellows 1923)
>
> *"To his friend a man a friend shall prove, / And gifts with gifts requite."* (Hávamál 42)

**Rule: the gods, the sources and the practice are never behind a paywall.**

### Free forever
Calendar and notifications, all lore texts, deity profiles and source tags, all
ritual guides, rune reference and draws, the on-device journal with export, the
kindred finder and basic group tools. **No ads. No selling data.**

### Optional *Hearth Keeper* membership
~$3.99/month, $29.99/year, or $99 lifetime.

| Perk | Why it's fair to charge |
|---|---|
| Encrypted cloud sync and backup | Real hosting cost; export stays free |
| Narrated Eddas, Hávamál, guided tide meditations | Pays narrators |
| Scholar commentary tracks | Pays contributors (revenue share) |
| Expanded rune journal insights, "Year on the Wheel" | Nice extra |
| Altar themes, seasonal icons, knotwork styles | Cosmetic |
| Kindred Hall upgrades | Admins pay; members never do |
| Early access | A thank-you |

### Other optional income
1. **One-off gifts** (pay what you want), prompted at most once per holy tide.
2. **Paid courses**: beginner Old Norse, "Your First Year as a Heathen", runic history.
3. **Gift a membership** to a friend or a whole kindred.
4. **Artisan Market** (phase 2): vetted craftspeople, affiliate/referral fees.
5. **Contributor revenue share** for scholars, translators and narrators.

### Never
Paywalled deities, texts or rituals; ads or data brokering; loot-box mechanics or
streak guilt; more than one dismissible support prompt per holy tide; charging
kindred members to join their own group.

### Mechanics
RevenueCat over Apple/Google in-app purchases; small-business 15% store fee;
purchasing-power regional pricing; a no-questions-asked hardship membership.

## Roadmap

- **MVP**: the Wheel with notifications, daily stanza, Hávamál and Völuspá
  reader with the Old Norse alongside, deity profiles with source tags, Younger
  Futhark reference with the Norwegian and Icelandic rune poems, on-device
  journal, gift button, English plus two languages.
- **v1**: Hearth Keeper membership (sync, audio, customization), ritual builder
  and lead mode, full Eddas, first paid course, regional pricing.
- **v2**: Kindred Halls, Artisan Market, scholar commentary with revenue share,
  sagas, full localization.
