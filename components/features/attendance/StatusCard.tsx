import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Clock, Calendar } from 'lucide-react-native';

interface StatusCardProps {
  clockedIn: boolean;
  shiftStart: string;
  shiftEnd: string;
  lastClockIn?: string;
  lastClockOut?: string;
}

export const StatusCard = ({ clockedIn, shiftStart, shiftEnd, lastClockIn, lastClockOut }: StatusCardProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Today&apos;s Status</Text>
        <View style={[styles.badge, clockedIn ? styles.badgeIn : styles.badgeOut]}>
            <Text style={[styles.badgeText, clockedIn ? styles.textIn : styles.textOut]}>
                {clockedIn ? 'CLOCKED IN' : 'CLOCKED OUT'}
            </Text>
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.item}>
            <Calendar size={16} color="#6b7280" />
            <Text style={styles.label}>Shift</Text>
            <Text style={styles.value}>{shiftStart} - {shiftEnd}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.row}>
         <View style={styles.item}>
            <Clock size={16} color="#6b7280" />
            <Text style={styles.label}>Clock In</Text>
            <Text style={styles.value}>
                {lastClockIn ? new Date(lastClockIn).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--'}
            </Text>
        </View>
        <View style={styles.item}>
            <Clock size={16} color="#6b7280" />
            <Text style={styles.label}>Clock Out</Text>
            <Text style={styles.value}>
                {lastClockOut ? new Date(lastClockOut).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--'}
            </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeIn: {
    backgroundColor: '#dcfce7',
  },
  badgeOut: {
    backgroundColor: '#f3f4f6',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  textIn: {
    color: '#166534',
  },
  textOut: {
    color: '#374151',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 4,
  },
  value: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginLeft: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginVertical: 12,
  }
});
