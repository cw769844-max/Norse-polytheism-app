import { Stack, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { KnotDivider } from '@/components/KnotDivider';
import { TierBadge } from '@/components/TierBadge';
import { getPoem, type Poem, type Stanza } from '@/content/poems';
import { StanzaView } from '@/features/well/StanzaView';
import { useTheme } from '@/theme/ThemeProvider';
import { fonts, radii, spacing } from '@/theme/tokens';

const MAX_WIDTH = 640;

export default function PoemReaderScreen() {
  const params = useLocalSearchParams<{ poem: string; stanza?: string }>();
  const { t } = useTranslation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const poem = getPoem(params.poem);
  const list = useRef<FlatList<Stanza>>(null);

  const targetIndex = useMemo(() => {
    const n = Number(params.stanza);
    if (!poem || !Number.isInteger(n)) return -1;
    return poem.stanzas.findIndex((s) => s.n === n);
  }, [poem, params.stanza]);

  // Jump to the requested stanza once the list has laid out.
  const jumpedTo = useRef(-1);
  const onLayout = useCallback(() => {
    if (targetIndex < 0 || jumpedTo.current === targetIndex) return;
    jumpedTo.current = targetIndex;
    requestAnimationFrame(() => list.current?.scrollToIndex({ index: targetIndex, viewPosition: 0.15, animated: false }));
  }, [targetIndex]);

  if (!poem) {
    return (
      <View style={[styles.flex, { backgroundColor: colors.background, padding: spacing.lg }]}>
        <AppText>{t('common.notFound')}</AppText>
      </View>
    );
  }

  return (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: poem.title }} />
      <FlatList
        ref={list}
        data={poem.stanzas}
        keyExtractor={(s) => String(s.n)}
        onLayout={onLayout}
        initialNumToRender={Math.max(12, targetIndex + 4)}
        onScrollToIndexFailed={(info) => {
          list.current?.scrollToOffset({ offset: info.averageItemLength * info.index, animated: false });
          setTimeout(
            () => list.current?.scrollToIndex({ index: info.index, viewPosition: 0.15, animated: false }),
            100,
          );
        }}
        ListHeaderComponent={<ReaderHeader poem={poem} />}
        ListFooterComponent={
          <View style={styles.footer}>
            <KnotDivider />
            <AppText variant="caption" color="textMuted" style={styles.center}>
              {t('reader.source')} · {poem.license}
            </AppText>
          </View>
        }
        renderItem={({ item, index }) => <StanzaRow stanza={item} highlighted={index === targetIndex} />}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxxl }]}
      />
    </View>
  );
}

function ReaderHeader({ poem }: { poem: Poem }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [showIntro, setShowIntro] = useState(false);

  return (
    <View style={styles.header}>
      <AppText variant="overline" color="accent">
        {poem.englishTitle}
      </AppText>
      <AppText variant="hero">{poem.title}</AppText>
      <AppText variant="caption" color="textMuted">
        {t('well.translatedBy', { translator: poem.translator, year: poem.year })}
      </AppText>
      <View style={[styles.tierBox, { borderColor: colors.border, backgroundColor: colors.surface }]}>
        <TierBadge tier="attested" />
        <AppText variant="caption" color="textMuted">
          {t('reader.tierNote')} {t('reader.numbering')}
        </AppText>
      </View>
      {poem.introduction.length > 0 && (
        <View style={styles.intro}>
          <Pressable
            onPress={() => setShowIntro((v) => !v)}
            accessibilityRole="button"
            aria-expanded={showIntro}
            hitSlop={8}
          >
            <AppText variant="bodyStrong" color="accent">
              {showIntro ? t('reader.hideIntro') : t('reader.showIntro')}
            </AppText>
          </Pressable>
          {showIntro && (
            <View style={styles.introBody}>
              <AppText variant="heading">{t('reader.translatorIntro')}</AppText>
              {poem.introduction.map((para, i) => (
                <AppText key={i} color="textMuted">
                  {para}
                </AppText>
              ))}
            </View>
          )}
        </View>
      )}
      <KnotDivider />
    </View>
  );
}

function StanzaRow({ stanza, highlighted }: { stanza: Stanza; highlighted: boolean }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [showNotes, setShowNotes] = useState(false);

  return (
    <View
      style={[
        styles.stanza,
        highlighted && { backgroundColor: colors.surface, borderLeftColor: colors.accent, borderLeftWidth: 3 },
      ]}
    >
      <AppText variant="overline" color={highlighted ? 'accent' : 'textMuted'} style={styles.number}>
        {stanza.n}
      </AppText>
      <View style={styles.flex}>
        <StanzaView stanza={stanza} />
        {stanza.notes.length > 0 && (
          <Pressable
            onPress={() => setShowNotes((v) => !v)}
            accessibilityRole="button"
            aria-expanded={showNotes}
            hitSlop={8}
            style={styles.noteToggle}
          >
            <AppText variant="caption" color="accent">
              {showNotes ? t('reader.hideNote') : `${t('reader.note', { count: stanza.notes.length })} ›`}
            </AppText>
          </Pressable>
        )}
        {showNotes &&
          stanza.notes.map((note, i) => (
            <View key={i} style={[styles.note, { borderColor: colors.border, backgroundColor: colors.surface }]}>
              <TierBadge tier="scholarly" />
              <AppText variant="caption" color="textMuted" style={{ fontSize: 14, lineHeight: 20 }}>
                {note}
              </AppText>
            </View>
          ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingHorizontal: spacing.lg, width: '100%', maxWidth: MAX_WIDTH, alignSelf: 'center' },
  header: { gap: spacing.sm, paddingTop: spacing.lg, paddingBottom: spacing.sm },
  tierBox: {
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    marginTop: spacing.xs,
  },
  intro: { gap: spacing.sm, paddingVertical: spacing.xs },
  introBody: { gap: spacing.sm },
  stanza: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingRight: spacing.sm,
    borderRadius: radii.sm,
    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
  },
  number: { width: 28, textAlign: 'right', paddingTop: 6, fontFamily: fonts.bodySemiBold },
  noteToggle: { alignSelf: 'flex-start', paddingTop: spacing.sm },
  note: {
    marginTop: spacing.sm,
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  footer: { gap: spacing.md, paddingTop: spacing.xl },
  center: { textAlign: 'center' },
});
