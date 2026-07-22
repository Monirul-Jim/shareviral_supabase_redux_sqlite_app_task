import type { ReactNode } from 'react';
import { View, StyleSheet, Text } from 'react-native';

import { Spacing, Colors } from '@/constants/theme';

type HintRowProps = {
  title?: string;
  hint?: ReactNode;
};

export function HintRow({ title = 'Try editing', hint = 'app/index.tsx' }: HintRowProps) {
  return (
    <View style={styles.stepRow}>
      <Text style={{ fontSize: 14 }}>{title}</Text>
      <View style={[styles.codeSnippet, { backgroundColor: Colors.light.backgroundSelected }]}>
        <Text style={{ color: Colors.light.textSecondary }}>{hint}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stepRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  codeSnippet: {
    borderRadius: Spacing.two,
    paddingVertical: Spacing.half,
    paddingHorizontal: Spacing.two,
  },
});
