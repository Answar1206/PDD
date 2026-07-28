import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { ForensicRecord, AssetType } from '../types';
import { MaterialIcons } from '@expo/vector-icons';

interface HistoryLogsProps {
  records: ForensicRecord[];
  onSelectRecord: (record: ForensicRecord) => void;
  onDeleteRecord: (id: string) => void;
}

export default function HistoryLogs({ records, onSelectRecord, onDeleteRecord }: HistoryLogsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | AssetType>('all');

  const filteredRecords = useMemo(() => {
    return records.filter(rec => {
      const matchesFilter = selectedFilter === 'all' || rec.type === selectedFilter;
      const matchesSearch = rec.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            rec.hash.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [records, selectedFilter, searchQuery]);

  const stats = useMemo(() => {
    const total = records.length;
    const altered = records.filter(r => r.verdict === 'Altered' || r.verdict === 'Modified').length;
    const original = records.filter(r => r.verdict === 'Original' || r.verdict === 'Human').length;
    const review = records.filter(r => r.status === 'Review Required').length;
    return { total, altered, original, review };
  }, [records]);

  const renderRecordItem = ({ item }: { item: ForensicRecord }) => {
    const isAltered = item.verdict === 'Altered' || item.verdict === 'Modified';
    return (
      <View style={styles.recordItem}>
        <View style={[styles.typeIcon, { backgroundColor: isAltered ? '#fdf2f2' : '#f2fdf5' }]}>
          <MaterialIcons
            name={item.type === 'video' ? 'movie' : item.type === 'image' ? 'image' : item.type === 'pdf' ? 'picture-as-pdf' : 'article'}
            size={22}
            color={isAltered ? '#dc3545' : '#28a745'}
          />
        </View>

        <View style={styles.itemMain}>
          <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.itemHash} numberOfLines={1}>SHA-256: {item.hash}</Text>
          <Text style={styles.itemDate}>{item.date}</Text>
        </View>

        <View style={styles.itemRight}>
          <View style={[styles.badge, { backgroundColor: isAltered ? '#fdf2f2' : '#f2fdf5', borderColor: isAltered ? '#f5c6cb' : '#c3e6cb' }]}>
            <Text style={[styles.badgeText, { color: isAltered ? '#dc3545' : '#28a745' }]}>{item.verdict}</Text>
          </View>
          <Text style={styles.itemScore}>{item.score}% Accuracy</Text>
        </View>

        <View style={styles.itemActions}>
          <TouchableOpacity onPress={() => onSelectRecord(item)} style={styles.actionBtn}>
            <MaterialIcons name="chevron-right" size={22} color="#800000" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onDeleteRecord(item.id)} style={styles.actionBtn}>
            <MaterialIcons name="delete-outline" size={20} color="#999" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.panelTitle}>Analysis Logs History</Text>

      {/* Stats Summary cards */}
      <View style={styles.statsSummary}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Total Scans</Text>
          <Text style={styles.statVal}>{stats.total}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Altered / Anomalies</Text>
          <Text style={[styles.statVal, { color: '#dc3545' }]}>{stats.altered}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Authentic / Organic</Text>
          <Text style={[styles.statVal, { color: '#28a745' }]}>{stats.original}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Review Required</Text>
          <Text style={[styles.statVal, { color: '#ffc107' }]}>{stats.review}</Text>
        </View>
      </View>

      {/* Filter and Search controllers */}
      <View style={styles.searchBar}>
        <MaterialIcons name="search" size={20} color="#999" style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by file name or SHA-256 hash..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.filtersScrollContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
          {(['all', 'text', 'image', 'pdf', 'video'] as const).map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[styles.filterBtn, selectedFilter === filter && styles.filterBtnActive]}
              onPress={() => setSelectedFilter(filter)}
            >
              <Text style={[styles.filterBtnText, selectedFilter === filter && styles.filterBtnTextActive]}>
                {filter.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Logs List */}
      <FlatList
        data={filteredRecords}
        renderItem={renderRecordItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="history" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No matching forensic records found.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#edebe6',
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#300000',
    marginBottom: 16,
  },
  statsSummary: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    minWidth: 100,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  statLabel: {
    fontSize: 10,
    color: '#777',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  statVal: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#300000',
    marginTop: 4,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#300000',
  },
  filtersScrollContainer: {
    marginBottom: 16,
  },
  filtersScroll: {
    gap: 8,
  },
  filterBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  filterBtnActive: {
    backgroundColor: '#800000',
    borderColor: '#800000',
  },
  filterBtnText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#666',
  },
  filterBtnTextActive: {
    color: '#fff',
  },
  listContent: {
    gap: 10,
    paddingBottom: 24,
  },
  recordItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  typeIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  itemMain: {
    flex: 2,
  },
  itemName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#300000',
  },
  itemHash: {
    fontSize: 11,
    color: '#888',
    marginTop: 2,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  itemDate: {
    fontSize: 11,
    color: '#666',
    marginTop: 4,
  },
  itemRight: {
    flex: 1.2,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  badge: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  itemScore: {
    fontSize: 11,
    color: '#666',
    marginTop: 4,
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionBtn: {
    padding: 6,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 13,
    color: '#999',
    marginTop: 12,
  }
});
