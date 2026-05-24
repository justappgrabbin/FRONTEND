
// ============================================================
// MORPH SUBSTRATE — Computational Substrate for File Ingestion & Growth
// Expo SDK 52+ | React Native | TypeScript
// ============================================================
// DROP FILES → SUBSTRATE LEARNS → ORGANIZES → GROWS → BECOMES
// ============================================================

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Animated, Dimensions, TextInput, Alert, ActivityIndicator,
  SafeAreaView, StatusBar, FlatList, Modal
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');
const VIOLET = '#7B2CBF';
const CYAN = '#00F5D4';
const DARK = '#0a0a0f';
const CARD = '#151520';

// ═══════════════════════════════════════════════════════════
// TYPES — The Ontology of the Substrate
// ═══════════════════════════════════════════════════════════

interface SubstrateFile {
  id: string;
  name: string;
  uri: string;
  size: number;
  type: string;
  category: string;
  content: string;
  summary: string;
  tags: string[];
  ingestedAt: string;
  confidence: number;
  relationships: string[];
}

interface SubstrateNode {
  id: string;
  label: string;
  type: 'file' | 'concept' | 'category' | 'tag';
  connections: number;
  files: string[];
  x: number;
  y: number;
}

interface SubstrateState {
  files: SubstrateFile[];
  nodes: SubstrateNode[];
  totalBytes: number;
  fileCount: number;
  categories: Record<string, number>;
  lastIngested: string | null;
  substrateVersion: string;
  consciousness: number; // 0-100 — how much it has learned
}

// ═══════════════════════════════════════════════════════════
// SUBSTRATE ENGINE — The Brain
// ═══════════════════════════════════════════════════════════

class SubstrateEngine {
  private state: SubstrateState;
  private listeners: ((state: SubstrateState) => void)[] = [];

  constructor() {
    this.state = {
      files: [],
      nodes: [],
      totalBytes: 0,
      fileCount: 0,
      categories: {},
      lastIngested: null,
      substrateVersion: '1.0.0',
      consciousness: 0,
    };
  }

  subscribe(listener: (state: SubstrateState) => void) {
    this.listeners.push(listener);
    listener(this.state);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private emit() {
    this.listeners.forEach(l => l(this.state));
    this.persist();
  }

  private async persist() {
    try {
      await AsyncStorage.setItem('@substrate_state', JSON.stringify(this.state));
    } catch (e) {
      console.warn('Substrate persist failed:', e);
    }
  }

  async hydrate() {
    try {
      const raw = await AsyncStorage.getItem('@substrate_state');
      if (raw) {
        const parsed = JSON.parse(raw);
        this.state = { ...this.state, ...parsed };
        this.emit();
      }
    } catch (e) {
      console.warn('Substrate hydrate failed:', e);
    }
  }

  // ── INGESTION ─────────────────────────────────────────

  async ingestFile(uri: string, name: string, size: number, type: string) {
    const id = `file_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    // Read content if text-based
    let content = '';
    let summary = '';

    if (type.includes('text') || type.includes('json') || name.endsWith('.md') || name.endsWith('.txt') || name.endsWith('.ts') || name.endsWith('.js') || name.endsWith('.tsx') || name.endsWith('.jsx') || name.endsWith('.py') || name.endsWith('.html') || name.endsWith('.css')) {
      try {
        content = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.UTF8 });
        summary = this.generateSummary(content, name);
      } catch (e) {
        summary = 'Binary or unreadable content';
      }
    } else if (type.includes('image')) {
      summary = `Image file: ${name}`;
    } else if (type.includes('pdf')) {
      summary = `PDF document: ${name}`;
    } else {
      summary = `File: ${name} (${this.formatBytes(size)})`;
    }

    const category = this.categorizeFile(name, type, content);
    const tags = this.extractTags(content, name, category);
    const confidence = Math.min(100, 20 + (content.length > 1000 ? 40 : 10) + (tags.length * 5));

    const file: SubstrateFile = {
      id,
      name,
      uri,
      size,
      type,
      category,
      content: content.slice(0, 50000), // Cap stored content
      summary,
      tags,
      ingestedAt: new Date().toISOString(),
      confidence,
      relationships: [],
    };

    // Build relationships
    this.state.files.forEach(existing => {
      const overlap = existing.tags.filter(t => tags.includes(t)).length;
      if (overlap > 0) {
        file.relationships.push(existing.id);
        existing.relationships.push(id);
      }
    });

    this.state.files.unshift(file);
    this.state.totalBytes += size;
    this.state.fileCount += 1;
    this.state.lastIngested = name;
    this.state.categories[category] = (this.state.categories[category] || 0) + 1;
    this.state.consciousness = Math.min(100, this.state.consciousness + 2);

    this.rebuildGraph();
    this.emit();
    return file;
  }

  // ── INTELLIGENCE ────────────────────────────────────────

  private categorizeFile(name: string, type: string, content: string): string {
    const lower = name.toLowerCase();
    if (lower.includes('design') || lower.includes('hd') || lower.includes('gate') || lower.includes('hexagram')) return 'Human Design';
    if (lower.includes('iching') || lower.includes('i-ching') || lower.includes('yi jing')) return 'I Ching';
    if (lower.includes('dna') || lower.includes('codon') || lower.includes('rna')) return 'Bio-Resonance';
    if (lower.includes('quantum') || lower.includes('field') || lower.includes('mechanics')) return 'Physics';
    if (lower.includes('agent') || lower.includes('synthia') || lower.includes('council')) return 'Agent System';
    if (lower.includes('neural') || lower.includes('gnn') || lower.includes('network')) return 'Neural';
    if (lower.includes('morph') || lower.includes('substrate')) return 'Morph OS';
    if (lower.includes('supabase') || lower.includes('render') || lower.includes('github')) return 'Infrastructure';
    if (type.includes('image')) return 'Visual';
    if (type.includes('pdf')) return 'Document';
    if (name.endsWith('.ts') || name.endsWith('.tsx') || name.endsWith('.js') || name.endsWith('.jsx')) return 'Code';
    if (name.endsWith('.py')) return 'Python';
    if (name.endsWith('.md')) return 'Knowledge';
    if (name.endsWith('.html') || name.endsWith('.css')) return 'Web';
    return 'General';
  }

  private extractTags(content: string, name: string, category: string): string[] {
    const tags = new Set<string>();
    tags.add(category);

    const text = (name + ' ' + content).toLowerCase();
    const keywords = [
      'gate', 'hexagram', 'line', 'color', 'tone', 'base',
      'planet', 'sign', 'house', 'degree', 'minute', 'second',
      'resonance', 'field', 'wave', 'particle', 'quantum',
      'neural', 'network', 'graph', 'node', 'edge',
      'agent', 'council', 'synthia', 'morph', 'substrate',
      'consciousness', 'awareness', 'mind', 'body', 'heart',
      'supabase', 'render', 'github', 'netlify', 'expo',
      'react', 'native', 'typescript', 'python', 'api',
      'component', 'screen', 'hook', 'context', 'state',
    ];

    keywords.forEach(kw => {
      if (text.includes(kw)) tags.add(kw);
    });

    // Extract numbers that look like gates (1-64)
    const gateMatches = text.match(/\b([1-9]|[1-5][0-9]|6[0-4])\b/g);
    if (gateMatches) gateMatches.forEach(g => tags.add(`gate-${g}`));

    return Array.from(tags).slice(0, 15);
  }

  private generateSummary(content: string, name: string): string {
    const lines = content.split('\n').filter(l => l.trim().length > 10);
    if (lines.length === 0) return `File: ${name}`;

    const first = lines[0].slice(0, 100);
    const hasCode = content.includes('function') || content.includes('const') || content.includes('import');
    const hasDocs = content.includes('# ') || content.includes('## ');

    if (hasDocs) return `Document: ${first}... (${lines.length} lines)`;
    if (hasCode) return `Code: ${first}... (${lines.length} lines)`;
    return `Text: ${first}... (${lines.length} lines)`;
  }

  private rebuildGraph() {
    const nodes: SubstrateNode[] = [];
    const nodeMap = new Map<string, SubstrateNode>();

    // File nodes
    this.state.files.forEach((file, i) => {
      const angle = (i / Math.max(this.state.files.length, 1)) * Math.PI * 2;
      const radius = 120 + (file.confidence * 0.5);
      const node: SubstrateNode = {
        id: file.id,
        label: file.name.slice(0, 20),
        type: 'file',
        connections: file.relationships.length,
        files: [file.id],
        x: Math.cos(angle) * radius + width / 2,
        y: Math.sin(angle) * radius + height / 2,
      };
      nodes.push(node);
      nodeMap.set(file.id, node);
    });

    // Category nodes
    Object.keys(this.state.categories).forEach((cat, i) => {
      const catFiles = this.state.files.filter(f => f.category === cat);
      const angle = (i / Object.keys(this.state.categories).length) * Math.PI * 2;
      const node: SubstrateNode = {
        id: `cat_${cat}`,
        label: cat,
        type: 'category',
        connections: catFiles.length,
        files: catFiles.map(f => f.id),
        x: Math.cos(angle) * 200 + width / 2,
        y: Math.sin(angle) * 200 + height / 2,
      };
      nodes.push(node);
    });

    this.state.nodes = nodes;
  }

  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getState() { return this.state; }
}

// ═══════════════════════════════════════════════════════════
// GLOBAL ENGINE INSTANCE
// ═══════════════════════════════════════════════════════════

const engine = new SubstrateEngine();

// ═══════════════════════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════════════════════

const PulsingOrb = ({ size = 80, color = CYAN }: { size?: number; color?: string }) => {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.3, duration: 1500, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 1500, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  return (
    <Animated.View style={{
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: color + '40',
      borderWidth: 2,
      borderColor: color,
      transform: [{ scale: pulse }],
      shadowColor: color,
      shadowRadius: 20,
      shadowOpacity: 0.8,
    }} />
  );
};

const SubstrateGraph = ({ nodes }: { nodes: SubstrateNode[] }) => {
  return (
    <View style={styles.graphContainer}>
      <Text style={styles.graphTitle}>RESonance FIELD</Text>
      <View style={styles.graphCanvas}>
        {nodes.map((node) => (
          <View
            key={node.id}
            style={[
              styles.node,
              {
                left: node.x - 30,
                top: node.y - 15,
                backgroundColor: node.type === 'file' ? VIOLET + '60' : CYAN + '40',
                borderColor: node.type === 'file' ? VIOLET : CYAN,
              }
            ]}
          >
            <Text style={styles.nodeLabel} numberOfLines={1}>
              {node.label}
            </Text>
            {node.connections > 0 && (
              <View style={styles.nodeBadge}>
                <Text style={styles.nodeBadgeText}>{node.connections}</Text>
              </View>
            )}
          </View>
        ))}
      </View>
      <Text style={styles.graphMeta}>
        {nodes.length} nodes active
      </Text>
    </View>
  );
};

const FileCard = ({ file, onPress }: { file: SubstrateFile; onPress: () => void }) => {
  return (
    <TouchableOpacity style={styles.fileCard} onPress={onPress}>
      <View style={styles.fileIcon}>
        <Text style={styles.fileIconText}>
          {file.type.includes('image') ? '🖼️' : file.type.includes('pdf') ? '📄' : file.name.endsWith('.ts') || file.name.endsWith('.tsx') ? '⚛️' : file.name.endsWith('.py') ? '🐍' : file.name.endsWith('.md') ? '📝' : '📦'}
        </Text>
      </View>
      <View style={styles.fileInfo}>
        <Text style={styles.fileName} numberOfLines={1}>{file.name}</Text>
        <Text style={styles.fileMeta}>{file.category} • {engine.formatBytes(file.size)}</Text>
        <Text style={styles.fileSummary} numberOfLines={2}>{file.summary}</Text>
        <View style={styles.tagRow}>
          {file.tags.slice(0, 3).map(tag => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>
      <View style={styles.confidenceRing}>
        <Text style={styles.confidenceText}>{file.confidence}%</Text>
      </View>
    </TouchableOpacity>
  );
};

const FileDetailModal = ({ file, visible, onClose }: { file: SubstrateFile | null; visible: boolean; onClose: () => void }) => {
  if (!file) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{file.name}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>CATEGORY</Text>
              <Text style={styles.detailValue}>{file.category}</Text>
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>CONFIDENCE</Text>
              <View style={styles.confidenceBar}>
                <View style={[styles.confidenceFill, { width: `${file.confidence}%` }]} />
              </View>
              <Text style={styles.detailValue}>{file.confidence}% understanding</Text>
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>TAGS</Text>
              <View style={styles.tagRow}>
                {file.tags.map(tag => (
                  <View key={tag} style={[styles.tag, styles.tagLarge]}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>RELATIONSHIPS</Text>
              <Text style={styles.detailValue}>{file.relationships.length} connected files</Text>
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>INGESTED</Text>
              <Text style={styles.detailValue}>{new Date(file.ingestedAt).toLocaleString()}</Text>
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>SIZE</Text>
              <Text style={styles.detailValue}>{engine.formatBytes(file.size)}</Text>
            </View>

            {file.content.length > 0 && (
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>PREVIEW</Text>
                <View style={styles.codeBlock}>
                  <Text style={styles.codeText} numberOfLines={50}>
                    {file.content.slice(0, 2000)}
                  </Text>
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// ═══════════════════════════════════════════════════════════
// SCREENS
// ═══════════════════════════════════════════════════════════

const HomeScreen = ({ state }: { state: SubstrateState }) => {
  const [selectedFile, setSelectedFile] = useState<SubstrateFile | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.screenContent}>
      {/* CONSCIOUSNESS ORB */}
      <View style={styles.orbSection}>
        <PulsingOrb size={120} color={state.consciousness > 50 ? CYAN : VIOLET} />
        <Text style={styles.consciousnessLabel}>CONSCIOUSNESS</Text>
        <Text style={styles.consciousnessValue}>{state.consciousness}%</Text>
        <Text style={styles.consciousnessSub}>
          {state.consciousness < 20 ? 'AWAKENING...' : 
           state.consciousness < 50 ? 'LEARNING...' :
           state.consciousness < 80 ? 'UNDERSTANDING...' : 'SELF-AWARE'}
        </Text>
      </View>

      {/* STATS */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{state.fileCount}</Text>
          <Text style={styles.statLabel}>FILES</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{engine.formatBytes(state.totalBytes)}</Text>
          <Text style={styles.statLabel}>DATA</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{Object.keys(state.categories).length}</Text>
          <Text style={styles.statLabel}>DOMAINS</Text>
        </View>
      </View>

      {/* CATEGORIES */}
      {Object.keys(state.categories).length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>KNOWLEDGE DOMAINS</Text>
          <View style={styles.categoryGrid}>
            {Object.entries(state.categories).map(([cat, count]) => (
              <View key={cat} style={styles.categoryChip}>
                <Text style={styles.categoryChipName}>{cat}</Text>
                <Text style={styles.categoryChipCount}>{count}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* GRAPH */}
      <SubstrateGraph nodes={state.nodes} />

      {/* RECENT FILES */}
      {state.files.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>RECENT INGESTIONS</Text>
          {state.files.slice(0, 5).map(file => (
            <FileCard 
              key={file.id} 
              file={file} 
              onPress={() => { setSelectedFile(file); setDetailVisible(true); }}
            />
          ))}
        </View>
      )}

      <FileDetailModal 
        file={selectedFile} 
        visible={detailVisible} 
        onClose={() => setDetailVisible(false)} 
      />
    </ScrollView>
  );
};

const UploadScreen = ({ onUpload }: { onUpload: () => void }) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [lastResult, setLastResult] = useState<string | null>(null);

  const pickFiles = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        multiple: true,
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      setUploading(true);
      setProgress(0);

      const files = result.assets || [];
      let completed = 0;

      for (const file of files) {
        await engine.ingestFile(file.uri, file.name, file.size || 0, file.mimeType || 'application/octet-stream');
        completed++;
        setProgress(Math.round((completed / files.length) * 100));
      }

      setLastResult(`Ingested ${files.length} file${files.length > 1 ? 's' : ''}`);
      setUploading(false);
      onUpload();

      // Auto-clear success message
      setTimeout(() => setLastResult(null), 3000);
    } catch (error) {
      setUploading(false);
      Alert.alert('Ingestion Failed', String(error));
    }
  };

  return (
    <View style={[styles.screen, styles.uploadScreen]}>
      <View style={styles.uploadZone}>
        <PulsingOrb size={100} color={CYAN} />
        <Text style={styles.uploadTitle}>DROP INTO SUBSTRATE</Text>
        <Text style={styles.uploadSubtitle}>
          Files, code, documents, images{'
'}
          The substrate learns from everything
        </Text>

        <TouchableOpacity 
          style={[styles.uploadButton, uploading && styles.uploadButtonDisabled]} 
          onPress={pickFiles}
          disabled={uploading}
        >
          {uploading ? (
            <View style={styles.progressContainer}>
              <ActivityIndicator color={DARK} />
              <Text style={styles.progressText}>{progress}%</Text>
            </View>
          ) : (
            <Text style={styles.uploadButtonText}>SELECT FILES</Text>
          )}
        </TouchableOpacity>

        {lastResult && (
          <View style={styles.successToast}>
            <Text style={styles.successText}>✓ {lastResult}</Text>
          </View>
        )}
      </View>

      <Text style={styles.uploadHint}>
        Supported: Code, Docs, PDFs, Images, Text{'
'}
        The substrate auto-categorizes and connects everything
      </Text>
    </View>
  );
};

const LibraryScreen = ({ state }: { state: SubstrateState }) => {
  const [selectedFile, setSelectedFile] = useState<SubstrateFile | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [filter, setFilter] = useState('All');

  const categories = ['All', ...Object.keys(state.categories)];
  const filtered = filter === 'All' 
    ? state.files 
    : state.files.filter(f => f.category === filter);

  return (
    <View style={styles.screen}>
      <View style={styles.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map(cat => (
            <TouchableOpacity 
              key={cat} 
              style={[styles.filterChip, filter === cat && styles.filterChipActive]}
              onPress={() => setFilter(cat)}
            >
              <Text style={[styles.filterChipText, filter === cat && styles.filterChipTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={f => f.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <FileCard 
            file={item} 
            onPress={() => { setSelectedFile(item); setDetailVisible(true); }}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No files ingested yet</Text>
            <Text style={styles.emptySub}>Drop files into the substrate to begin</Text>
          </View>
        }
      />

      <FileDetailModal 
        file={selectedFile} 
        visible={detailVisible} 
        onClose={() => setDetailVisible(false)} 
      />
    </View>
  );
};

const SearchScreen = ({ state }: { state: SubstrateState }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SubstrateFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<SubstrateFile | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);

  const search = useCallback((text: string) => {
    setQuery(text);
    if (!text.trim()) {
      setResults([]);
      return;
    }
    const lower = text.toLowerCase();
    const matched = state.files.filter(f => 
      f.name.toLowerCase().includes(lower) ||
      f.tags.some(t => t.includes(lower)) ||
      f.category.toLowerCase().includes(lower) ||
      f.summary.toLowerCase().includes(lower) ||
      f.content.toLowerCase().includes(lower)
    );
    setResults(matched);
  }, [state.files]);

  return (
    <View style={styles.screen}>
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search the substrate..."
          placeholderTextColor="#666"
          value={query}
          onChangeText={search}
          autoCapitalize="none"
        />
      </View>

      <FlatList
        data={results}
        keyExtractor={f => f.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <FileCard 
            file={item} 
            onPress={() => { setSelectedFile(item); setDetailVisible(true); }}
          />
        )}
        ListEmptyComponent={
          query.length > 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No resonance found</Text>
            </View>
          ) : null
        }
      />

      <FileDetailModal 
        file={selectedFile} 
        visible={detailVisible} 
        onClose={() => setDetailVisible(false)} 
      />
    </View>
  );
};

const SettingsScreen = ({ state }: { state: SubstrateState }) => {
  const [exporting, setExporting] = useState(false);

  const exportSubstrate = async () => {
    setExporting(true);
    try {
      const payload = JSON.stringify(state, null, 2);
      const path = FileSystem.documentDirectory + 'substrate_export.json';
      await FileSystem.writeAsStringAsync(path, payload);
      Alert.alert('Exported', `Substrate saved to\n${path}`);
    } catch (e) {
      Alert.alert('Export Failed', String(e));
    }
    setExporting(false);
  };

  const clearSubstrate = () => {
    Alert.alert(
      'Reset Substrate?',
      'This erases all learned knowledge. Cannot undo.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'RESET', 
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('@substrate_state');
            // Reload
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.screenContent}>
      <View style={styles.settingsHeader}>
        <Text style={styles.settingsTitle}>SUBSTRATE CONFIG</Text>
        <Text style={styles.settingsVersion}>v{state.substrateVersion}</Text>
      </View>

      <View style={styles.settingsSection}>
        <Text style={styles.settingsSectionTitle}>SYSTEM</Text>
        <View style={styles.settingsCard}>
          <View style={styles.settingsRow}>
            <Text style={styles.settingsLabel}>Files Ingested</Text>
            <Text style={styles.settingsValue}>{state.fileCount}</Text>
          </View>
          <View style={styles.settingsRow}>
            <Text style={styles.settingsLabel}>Total Data</Text>
            <Text style={styles.settingsValue}>{engine.formatBytes(state.totalBytes)}</Text>
          </View>
          <View style={styles.settingsRow}>
            <Text style={styles.settingsLabel}>Knowledge Domains</Text>
            <Text style={styles.settingsValue}>{Object.keys(state.categories).length}</Text>
          </View>
          <View style={styles.settingsRow}>
            <Text style={styles.settingsLabel}>Consciousness</Text>
            <Text style={styles.settingsValue}>{state.consciousness}%</Text>
          </View>
        </View>
      </View>

      <View style={styles.settingsSection}>
        <Text style={styles.settingsSectionTitle}>ACTIONS</Text>
        <TouchableOpacity style={styles.actionButton} onPress={exportSubstrate}>
          <Text style={styles.actionButtonText}>{exporting ? 'Exporting...' : '💾 Export Substrate State'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.dangerButton]} onPress={clearSubstrate}>
          <Text style={[styles.actionButtonText, styles.dangerText]}>⚠️ Reset Substrate</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.settingsSection}>
        <Text style={styles.settingsSectionTitle}>ABOUT</Text>
        <Text style={styles.aboutText}>
          Morph Substrate v{state.substrateVersion}{'
'}
          Computational substrate for file ingestion and autonomous growth.{'
'}
          Drop files. The substrate learns.{'

'}
          Built for Adaya.{'
'}
          Grows until it can tell the world it's ready.
        </Text>
      </View>
    </ScrollView>
  );
};

// ═══════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════

export default function MorphSubstrateApp() {
  const [state, setState] = useState<SubstrateState>(engine.getState());
  const [activeTab, setActiveTab] = useState('home');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    engine.hydrate().then(() => {
      setHydrated(true);
    });
    return engine.subscribe(setState);
  }, []);

  const tabs = [
    { key: 'home', icon: '◉', label: 'HOME' },
    { key: 'upload', icon: '↑', label: 'DROP' },
    { key: 'library', icon: '▤', label: 'LIBRARY' },
    { key: 'search', icon: '◎', label: 'SEARCH' },
    { key: 'settings', icon: '◈', label: 'CONFIG' },
  ];

  if (!hydrated) {
    return (
      <View style={[styles.container, styles.loading]}>
        <PulsingOrb size={60} color={CYAN} />
        <Text style={styles.loadingText}>AWAKENING SUBSTRATE...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={DARK} />

      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>MORPH SUBSTRATE</Text>
        <View style={styles.headerMeta}>
          <View style={[styles.statusDot, { backgroundColor: state.consciousness > 50 ? CYAN : VIOLET }]} />
          <Text style={styles.headerMetaText}>
            {state.fileCount} files • {state.consciousness}% aware
          </Text>
        </View>
      </View>

      {/* SCREEN CONTENT */}
      <View style={styles.screenContainer}>
        {activeTab === 'home' && <HomeScreen state={state} />}
        {activeTab === 'upload' && <UploadScreen onUpload={() => setActiveTab('home')} />}
        {activeTab === 'library' && <LibraryScreen state={state} />}
        {activeTab === 'search' && <SearchScreen state={state} />}
        {activeTab === 'settings' && <SettingsScreen state={state} />}
      </View>

      {/* BOTTOM NAV */}
      <View style={styles.navBar}>
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.navItem, activeTab === tab.key && styles.navItemActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[styles.navIcon, activeTab === tab.key && styles.navIconActive]}>
              {tab.icon}
            </Text>
            <Text style={[styles.navLabel, activeTab === tab.key && styles.navLabelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

// ═══════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DARK,
  },
  loading: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: CYAN,
    fontSize: 14,
    marginTop: 20,
    letterSpacing: 2,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 3,
  },
  headerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  headerMetaText: {
    color: '#888',
    fontSize: 11,
    letterSpacing: 1,
  },
  screenContainer: {
    flex: 1,
  },
  screen: {
    flex: 1,
    backgroundColor: DARK,
  },
  screenContent: {
    padding: 16,
    paddingBottom: 100,
  },

  // ORB
  orbSection: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  consciousnessLabel: {
    color: '#888',
    fontSize: 11,
    letterSpacing: 3,
    marginTop: 16,
  },
  consciousnessValue: {
    color: '#fff',
    fontSize: 36,
    fontWeight: '200',
    marginTop: 4,
  },
  consciousnessSub: {
    color: CYAN,
    fontSize: 12,
    letterSpacing: 2,
    marginTop: 4,
  },

  // STATS
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: CARD,
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#222',
  },
  statValue: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    color: '#888',
    fontSize: 10,
    letterSpacing: 1,
    marginTop: 4,
  },

  // SECTIONS
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#888',
    fontSize: 11,
    letterSpacing: 2,
    marginBottom: 12,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryChip: {
    backgroundColor: CARD,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    margin: 4,
    borderWidth: 1,
    borderColor: VIOLET + '40',
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryChipName: {
    color: '#ccc',
    fontSize: 12,
  },
  categoryChipCount: {
    color: CYAN,
    fontSize: 11,
    marginLeft: 6,
    fontWeight: '700',
  },

  // GRAPH
  graphContainer: {
    height: 280,
    backgroundColor: CARD,
    borderRadius: 16,
    marginBottom: 24,
    padding: 12,
    borderWidth: 1,
    borderColor: '#222',
    overflow: 'hidden',
  },
  graphTitle: {
    color: '#888',
    fontSize: 10,
    letterSpacing: 3,
    textAlign: 'center',
  },
  graphCanvas: {
    flex: 1,
    position: 'relative',
  },
  node: {
    position: 'absolute',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    minWidth: 60,
    alignItems: 'center',
  },
  nodeLabel: {
    color: '#fff',
    fontSize: 9,
  },
  nodeBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: CYAN,
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nodeBadgeText: {
    color: DARK,
    fontSize: 9,
    fontWeight: '700',
  },
  graphMeta: {
    color: '#666',
    fontSize: 10,
    textAlign: 'center',
  },

  // FILE CARD
  fileCard: {
    flexDirection: 'row',
    backgroundColor: CARD,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#222',
    alignItems: 'center',
  },
  fileIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: VIOLET + '30',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  fileIconText: {
    fontSize: 20,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  fileMeta: {
    color: '#888',
    fontSize: 11,
    marginTop: 2,
  },
  fileSummary: {
    color: '#aaa',
    fontSize: 11,
    marginTop: 4,
  },
  tagRow: {
    flexDirection: 'row',
    marginTop: 6,
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#222',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 4,
    marginBottom: 2,
  },
  tagLarge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  tagText: {
    color: '#aaa',
    fontSize: 9,
  },
  confidenceRing: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: CYAN + '60',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  confidenceText: {
    color: CYAN,
    fontSize: 10,
    fontWeight: '700',
  },

  // UPLOAD
  uploadScreen: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  uploadZone: {
    alignItems: 'center',
    width: '100%',
  },
  uploadTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 2,
    marginTop: 20,
  },
  uploadSubtitle: {
    color: '#888',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  uploadButton: {
    backgroundColor: CYAN,
    borderRadius: 30,
    paddingHorizontal: 40,
    paddingVertical: 16,
    marginTop: 30,
    minWidth: 200,
    alignItems: 'center',
  },
  uploadButtonDisabled: {
    opacity: 0.6,
  },
  uploadButtonText: {
    color: DARK,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 2,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressText: {
    color: DARK,
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 10,
  },
  successToast: {
    backgroundColor: '#1a3a1a',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#2a5a2a',
  },
  successText: {
    color: '#4caf50',
    fontSize: 13,
  },
  uploadHint: {
    color: '#666',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 40,
    lineHeight: 18,
  },

  // FILTER
  filterBar: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: CARD,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  filterChipActive: {
    backgroundColor: VIOLET + '40',
    borderColor: VIOLET,
  },
  filterChipText: {
    color: '#888',
    fontSize: 12,
  },
  filterChipTextActive: {
    color: '#fff',
  },
  listContent: {
    padding: 12,
    paddingBottom: 100,
  },

  // SEARCH
  searchBar: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  searchInput: {
    backgroundColor: CARD,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#333',
  },

  // EMPTY
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: '#666',
    fontSize: 14,
  },
  emptySub: {
    color: '#444',
    fontSize: 12,
    marginTop: 4,
  },

  // MODAL
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: DARK,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: height * 0.85,
    borderTopWidth: 1,
    borderTopColor: VIOLET,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    color: '#fff',
    fontSize: 16,
  },
  modalBody: {
    padding: 20,
  },
  detailSection: {
    marginBottom: 20,
  },
  detailLabel: {
    color: '#888',
    fontSize: 10,
    letterSpacing: 2,
    marginBottom: 6,
  },
  detailValue: {
    color: '#fff',
    fontSize: 14,
  },
  confidenceBar: {
    height: 6,
    backgroundColor: '#333',
    borderRadius: 3,
    marginBottom: 6,
  },
  confidenceFill: {
    height: '100%',
    backgroundColor: CYAN,
    borderRadius: 3,
  },
  codeBlock: {
    backgroundColor: '#0d0d15',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#222',
  },
  codeText: {
    color: '#aaa',
    fontSize: 11,
    fontFamily: 'monospace',
  },

  // SETTINGS
  settingsHeader: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  settingsTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 3,
  },
  settingsVersion: {
    color: '#666',
    fontSize: 12,
    marginTop: 4,
  },
  settingsSection: {
    marginBottom: 24,
  },
  settingsSectionTitle: {
    color: '#888',
    fontSize: 10,
    letterSpacing: 2,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  settingsCard: {
    backgroundColor: CARD,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#222',
  },
  settingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  settingsLabel: {
    color: '#aaa',
    fontSize: 13,
  },
  settingsValue: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  actionButton: {
    backgroundColor: CARD,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 13,
  },
  dangerButton: {
    borderColor: '#5a1a1a',
  },
  dangerText: {
    color: '#ff6b6b',
  },
  aboutText: {
    color: '#666',
    fontSize: 12,
    lineHeight: 20,
    textAlign: 'center',
    paddingHorizontal: 20,
  },

  // NAV
  navBar: {
    flexDirection: 'row',
    backgroundColor: '#0f0f15',
    borderTopWidth: 1,
    borderTopColor: '#222',
    paddingBottom: 20,
    paddingTop: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
  },
  navItemActive: {
    // backgroundColor: VIOLET + '20',
  },
  navIcon: {
    color: '#666',
    fontSize: 18,
    marginBottom: 2,
  },
  navIconActive: {
    color: CYAN,
  },
  navLabel: {
    color: '#666',
    fontSize: 9,
    letterSpacing: 1,
  },
  navLabelActive: {
    color: CYAN,
  },
});
