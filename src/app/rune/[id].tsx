import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { KnotDivider } from '@/components/KnotDivider';
import { Screen } from '@/components/Screen';
import { TierBadge } from '@/components/TierBadge';
import {
  getElderRune,
  getYoungerRune,
  type ElderRune,
  type YoungerRune,
} from '@/content/runes/futhark';
import { RUNE_POEM_EDITION, runePoemStanza, type RunePoemId } from '@/content/runes/poems';
import { RuneGlyph } from '@/features/runes/RuneGlyph';
import { useSettings } from '@/features/settings/SettingsContext';
import { StanzaPair } from '@/features/well/StanzaView';
import { useTheme } from '@/theme/ThemeProvider';
import { fonts, spacing } from '@/theme/tokens';

export default function RuneScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const younger = getYoungerRune(id);
  const elder = younger ? undefined : getElderRune(id);

  if (!younger && !elder) {
    return (
      <Screen edges={['bottom']}>
        <AppText>{t('common.notFound')}</AppText>
      </Screen>
    );
  }

  return (
    <Screen edges={['bottom']}>
      <Stack.Screen options={{ title: (younger ?? elder)!.name }} />
      {younger ? <YoungerDetail rune={younger} /> : <ElderDetail rune={elder!} />}
    </Screen>
  );
}

function RuneLink({ id, label }: { id: string; label: string }) {
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/rune/[id]', params: { id } })}
      accessibilityRole="link"
      hitSlop={8}
      style={styles.link}
    >
      <AppText variant="bodyStrong" color="accent">
        {label} →
      </AppText>
    </Pressable>
  );
}

function YoungerDetail({ rune }: { rune: YoungerRune }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { settings } = useSettings();
  const ancestor = rune.ancestor ? getElderRune(rune.ancestor) : undefined;
  const hasTwig = rune.glyph.longBranch !== rune.glyph.shortTwig;

  return (
    <>
      <View style={styles.hero}>
        <RuneGlyph glyph={rune.glyph[settings.runeStyle]} size={96} color="accent" />
        <View style={styles.flex}>
          <AppText variant="overline" color="textMuted">
            {t('runes.younger')}
          </AppText>
          <AppText variant="hero">{rune.name}</AppText>
          <AppText color="textMuted">{t('runes.sound', { sound: rune.sound })}</AppText>
        </View>
      </View>

      <Card>
        <AppText variant="overline" color="textMuted">
          {t('runes.nameMeaning')}
        </AppText>
        <AppText variant="heading">{t(`runes.youngerRunes.${rune.id}.meaning`)}</AppText>
        {hasTwig && (
          <View style={styles.forms}>
            <View style={styles.form}>
              <RuneGlyph glyph={rune.glyph.longBranch} size={32} />
              <AppText variant="caption" color="textMuted">
                {t('runes.styleOption.longBranch')}
              </AppText>
            </View>
            <View style={styles.form}>
              <RuneGlyph glyph={rune.glyph.shortTwig} size={32} />
              <AppText variant="caption" color="textMuted">
                {t('runes.styleOption.shortTwig')}
              </AppText>
            </View>
          </View>
        )}
      </Card>

      <PoemVerse poem="norwegian" stanza={rune.stanza} title={t('runes.norwegianPoem')} />
      <PoemVerse poem="icelandic" stanza={rune.stanza} title={t('runes.icelandicPoem')} />

      <View style={[styles.reflect, { borderLeftColor: colors.accent }]}>
        <AppText variant="overline" color="accent">
          {t('runes.reflect')}
        </AppText>
        <AppText style={{ fontFamily: fonts.displayItalic, fontSize: 18, lineHeight: 26 }}>
          {t(`runes.youngerRunes.${rune.id}.prompt`)}
        </AppText>
        <AppText variant="caption" color="textMuted">
          {t('runes.reflectNote')}
        </AppText>
      </View>

      {ancestor && (
        <>
          <KnotDivider />
          <View style={styles.ancestor}>
            <RuneGlyph glyph={ancestor.glyph} size={40} color="textMuted" />
            <View style={styles.flex}>
              <RuneLink id={ancestor.id} label={t('runes.ancestor', { name: ancestor.name })} />
            </View>
          </View>
        </>
      )}

      <AppText variant="caption" color="textMuted">
        {t('runes.sourceNote', {
          editor: RUNE_POEM_EDITION.editor,
          title: RUNE_POEM_EDITION.title,
          year: RUNE_POEM_EDITION.year,
        })}
      </AppText>
    </>
  );
}

function PoemVerse({ poem, stanza: n, title }: { poem: RunePoemId; stanza: number; title: string }) {
  const { t } = useTranslation();
  const { settings } = useSettings();
  const stanza = runePoemStanza(poem, n);
  if (!stanza) return null;
  return (
    <Card>
      <View style={styles.verseHeader}>
        <AppText variant="heading" style={styles.flex}>
          {title}
        </AppText>
        <TierBadge tier="attested" />
      </View>
      <StanzaPair english={stanza.english} original={stanza.original} mode={settings.readerLanguage} size="card" />
      {stanza.gloss && (
        <AppText variant="caption" color="textMuted" accessibilityHint={t('runes.glossHelp')}>
          {t('runes.gloss', stanza.gloss)}
        </AppText>
      )}
    </Card>
  );
}

function ElderDetail({ rune }: { rune: ElderRune }) {
  const { t } = useTranslation();
  const descendant = rune.descendant ? getYoungerRune(rune.descendant) : undefined;
  const writtenWith = rune.writtenWith ? getYoungerRune(rune.writtenWith) : undefined;

  return (
    <>
      <View style={styles.hero}>
        <RuneGlyph glyph={rune.glyph} size={96} color="accent" />
        <View style={styles.flex}>
          <AppText variant="overline" color="textMuted">
            {t('runes.elder')}
          </AppText>
          <AppText variant="hero">{rune.name}</AppText>
          <AppText color="textMuted">{t('runes.sound', { sound: rune.sound })}</AppText>
        </View>
      </View>

      <Card>
        <TierBadge tier="scholarly" />
        <AppText variant="overline" color="textMuted">
          {t('runes.nameMeaning')}
        </AppText>
        <AppText variant="heading">{t(`runes.elderRunes.${rune.id}.meaning`)}</AppText>
        {rune.meaningUncertain && (
          <AppText variant="caption" color="textMuted">
            {t('runes.meaningUncertain')}
          </AppText>
        )}
        <AppText color="textMuted">{t('runes.elderAbout')}</AppText>
      </Card>

      <Card>
        {descendant ? (
          <View style={styles.ancestor}>
            <RuneGlyph glyph={descendant.glyph.longBranch} size={40} color="textMuted" />
            <View style={styles.flex}>
              <RuneLink id={descendant.id} label={t('runes.descendant', { name: descendant.name })} />
            </View>
          </View>
        ) : writtenWith ? (
          <>
            <AppText>{t('runes.writtenWith', { name: writtenWith.name })}</AppText>
            <RuneLink id={writtenWith.id} label={writtenWith.name} />
          </>
        ) : (
          <AppText>{t('runes.noDescendant')}</AppText>
        )}
      </Card>

      <AppText variant="caption" color="textMuted">
        {t('runes.modernNote')}
      </AppText>
    </>
  );
}

const styles = StyleSheet.create({
  hero: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg, paddingTop: spacing.sm },
  flex: { flex: 1 },
  forms: { flexDirection: 'row', gap: spacing.xl, paddingTop: spacing.sm },
  form: { alignItems: 'center' },
  verseHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  reflect: { borderLeftWidth: 2, paddingLeft: spacing.md, gap: spacing.xs },
  ancestor: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  link: { alignSelf: 'flex-start', paddingVertical: spacing.xs },
});
