import { StatusBar } from 'expo-status-bar';
import { AudioSource, setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type CoverKind = 'sketch' | 'window' | 'cassette' | 'blank' | 'tree' | 'cloud';

type Track = {
  id: string;
  title: string;
  added: string;
  kind: string;
  source: AudioSource;
};

type Project = {
  id: string;
  title: string;
  owner: string;
  locked: boolean;
  cover: CoverKind;
  accent: string;
  tracks: Track[];
};

type Sheet = 'none' | 'add' | 'cover' | 'import';
type Screen = 'library' | 'project';

const baseProjects: Project[] = [
  {
    id: 'wet-hot-liars',
    title: 'wet hot liars',
    owner: 'CLAYTON',
    locked: false,
    cover: 'sketch',
    accent: '#D9D2C4',
    tracks: [],
  },
  {
    id: 'broh-um-mm-wet',
    title: 'broh um mm wet?',
    owner: 'CLAYTON',
    locked: true,
    cover: 'window',
    accent: '#1C6B55',
    tracks: [
      {
        id: 'stratford-74',
        title: 'Stratford Ave 74',
        added: 'Apr 18, 2026',
        kind: 'voice memo',
        source: require('./assets/audio/stratford-ave-74.m4a'),
      },
      {
        id: 'stratford-76',
        title: 'Stratford Ave 76',
        added: 'Apr 18, 2026',
        kind: 'boardtape',
        source: require('./assets/audio/stratford-ave-76.m4a'),
      },
    ],
  },
  {
    id: 'shitty-ep',
    title: 'SHITTY EP',
    owner: 'CLAYTON',
    locked: false,
    cover: 'cassette',
    accent: '#E7E0CE',
    tracks: [
      {
        id: 'doormat',
        title: 'doormat',
        added: 'Sep 22, 2025',
        kind: 'demo',
        source: require('./assets/audio/stratford-ave-74.m4a'),
      },
      {
        id: 'cards',
        title: 'cards',
        added: 'Sep 26, 2025',
        kind: 'demo',
        source: require('./assets/audio/stratford-ave-76.m4a'),
      },
      {
        id: 'sitcom',
        title: 'sitcom',
        added: 'Sep 22, 2025',
        kind: 'boardtape',
        source: require('./assets/audio/stratford-ave-74.m4a'),
      },
      {
        id: 'nice-guy',
        title: 'nice guy',
        added: 'Sep 29, 2025',
        kind: 'rough',
        source: require('./assets/audio/stratford-ave-76.m4a'),
      },
      {
        id: 'life-is-strange',
        title: 'life is strange',
        added: 'Oct 1, 2025',
        kind: 'demo',
        source: require('./assets/audio/stratford-ave-74.m4a'),
      },
      {
        id: 'open-mouth',
        title: 'open mouth',
        added: 'Oct 2, 2025',
        kind: 'rough',
        source: require('./assets/audio/stratford-ave-76.m4a'),
      },
    ],
  },
  {
    id: 'jadyn',
    title: 'Jadyn',
    owner: 'CLAYTON',
    locked: true,
    cover: 'blank',
    accent: '#E7A0D7',
    tracks: [],
  },
  {
    id: 'album-choices',
    title: 'Album choices',
    owner: 'CLAYTON',
    locked: false,
    cover: 'window',
    accent: '#1C6B55',
    tracks: [
      {
        id: 'album-choice-a',
        title: 'Album choice A',
        added: 'Apr 18, 2026',
        kind: 'sequence',
        source: require('./assets/audio/stratford-ave-74.m4a'),
      },
    ],
  },
  {
    id: 'clayton',
    title: 'CLAYTON',
    owner: 'CLAYTON',
    locked: false,
    cover: 'tree',
    accent: '#B5A85D',
    tracks: [],
  },
];

const untitledProject: Project = {
  id: 'untitled-project',
  title: 'untitled project',
  owner: 'CLAYTON',
  locked: true,
  cover: 'blank',
  accent: '#DCD8EA',
  tracks: [],
};

const featuredCovers: CoverKind[] = [
  'window',
  'tree',
  'cassette',
  'blank',
  'cloud',
  'sketch',
  'window',
  'cassette',
  'blank',
  'tree',
  'cloud',
  'sketch',
  'cassette',
  'blank',
  'window',
  'tree',
  'cloud',
  'sketch',
  'window',
  'blank',
  'tree',
  'cassette',
  'cloud',
  'sketch',
];

function formatDuration(project: Project) {
  if (project.tracks.length === 0) {
    return '0 sec';
  }

  if (project.id === 'shitty-ep') {
    return '17m 56s';
  }

  return `${project.tracks.length * 2 + 1}m ${project.tracks.length * 7}s`;
}

function CoverArt({ kind, size = 'small' }: { kind: CoverKind; size?: 'small' | 'large' | 'mini' }) {
  return (
    <View
      style={[
        styles.cover,
        size === 'large' && styles.coverLarge,
        size === 'mini' && styles.coverMini,
      ]}
    >
      {kind === 'sketch' && (
        <View style={styles.sketchCover}>
          <View style={styles.sketchHead} />
          <View style={styles.sketchBody} />
          <View style={styles.sketchArmLeft} />
          <View style={styles.sketchArmRight} />
          <View style={styles.sketchLegLeft} />
          <View style={styles.sketchLegRight} />
        </View>
      )}

      {kind === 'window' && (
        <View style={styles.windowCover}>
          <View style={styles.windowGlow} />
          <View style={styles.windowPane} />
          <View style={styles.windowDark} />
        </View>
      )}

      {kind === 'cassette' && (
        <View style={styles.cassetteCover}>
          {Array.from({ length: 28 }).map((_, index) => (
            <Text key={index} style={styles.doodleText}>
              {index % 4 === 0 ? 'RADIO' : index % 3 === 0 ? 'GONE' : index % 2 === 0 ? 'SO' : 'YEAH'}
            </Text>
          ))}
          <View style={styles.cassette}>
            <Text style={styles.cassetteLabel}>SHITTY SONGS</Text>
            <View style={styles.cassetteTape}>
              <View style={styles.reel} />
              <View style={styles.reel} />
            </View>
          </View>
        </View>
      )}

      {kind === 'blank' && <View style={styles.blankCover} />}

      {kind === 'tree' && (
        <View style={styles.treeCover}>
          <View style={styles.treeHole} />
          <View style={styles.treeSmallMark} />
        </View>
      )}

      {kind === 'cloud' && (
        <View style={styles.cloudCover}>
          <View style={styles.cloudLine} />
          <View style={[styles.cloudLine, styles.cloudLineShort]} />
          <View style={styles.cloudDot} />
        </View>
      )}
    </View>
  );
}

function IconButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.iconButton}>
      <Text style={styles.iconButtonText}>{label}</Text>
    </Pressable>
  );
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('library');
  const [sheet, setSheet] = useState<Sheet>('none');
  const [activeProjectId, setActiveProjectId] = useState(baseProjects[2].id);
  const [activeTrackId, setActiveTrackId] = useState<string | null>(baseProjects[2].tracks[0]?.id ?? null);
  const [coverChoice, setCoverChoice] = useState<CoverKind>('blank');
  const player = useAudioPlayer(null, { updateInterval: 250 });
  const status = useAudioPlayerStatus(player);

  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      interruptionMode: 'doNotMix',
    }).catch(() => undefined);
  }, []);

  const projects = useMemo(() => [...baseProjects, untitledProject], []);
  const activeProject = useMemo(
    () => projects.find((project) => project.id === activeProjectId) ?? baseProjects[2],
    [activeProjectId, projects],
  );
  const activeTrack = useMemo(
    () => activeProject.tracks.find((track) => track.id === activeTrackId) ?? activeProject.tracks[0] ?? null,
    [activeProject, activeTrackId],
  );
  const activeCover = activeProject.id === 'untitled-project' ? coverChoice : activeProject.cover;

  function openProject(project: Project) {
    setActiveProjectId(project.id);
    setActiveTrackId(project.tracks[0]?.id ?? null);
    setScreen('project');
  }

  function playTrack(track: Track) {
    setActiveTrackId(track.id);
    player.replace(track.source);
    player.play();
  }

  function toggleCurrentTrack() {
    if (!activeTrack) {
      return;
    }

    if (status.playing) {
      player.pause();
      return;
    }

    if (!status.isLoaded) {
      player.replace(activeTrack.source);
    }

    player.play();
  }

  function createUntitledProject() {
    setActiveProjectId(untitledProject.id);
    setActiveTrackId(null);
    setCoverChoice('blank');
    setScreen('project');
    setSheet('none');
  }

  return (
    <SafeAreaView style={styles.shell}>
      <StatusBar style="light" />

      {screen === 'library' ? (
        <ScrollView contentContainerStyle={styles.libraryContent} showsVerticalScrollIndicator={false}>
          <View style={styles.libraryHeader}>
            <Text style={styles.brand}>[clayton]</Text>
            <View style={styles.headerActions}>
              <IconButton label="bell" onPress={() => undefined} />
              <IconButton label="search" onPress={() => undefined} />
              <IconButton label="me" onPress={() => undefined} />
            </View>
          </View>

          <View style={styles.grid}>
            {baseProjects.map((project) => (
              <Pressable key={project.id} onPress={() => openProject(project)} style={styles.gridItem}>
                <View>
                  <CoverArt kind={project.cover} />
                  <Pressable
                    onPress={() => project.tracks[0] && playTrack(project.tracks[0])}
                    style={styles.cardPlay}
                  >
                    <Text style={styles.cardPlayText}>{status.playing && activeProjectId === project.id ? '||' : '>'}</Text>
                  </Pressable>
                </View>
                <Text style={styles.cardTitle} numberOfLines={1}>
                  {project.title}
                </Text>
                <View style={styles.cardMetaRow}>
                  <Text style={styles.cardMeta} numberOfLines={1}>
                    {project.locked ? 'locked ' : ''}
                    {project.owner}
                  </Text>
                  <Text style={styles.ellipsis}>...</Text>
                </View>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={styles.detailContent} showsVerticalScrollIndicator={false}>
          <View style={styles.detailTopBar}>
            <IconButton label="<" onPress={() => setScreen('library')} />
            <View style={styles.detailActions}>
              <IconButton label="link" onPress={() => undefined} />
              <IconButton label="search" onPress={() => undefined} />
              <IconButton label="..." onPress={() => setSheet('cover')} />
            </View>
          </View>

          <Pressable onPress={() => setSheet('cover')} style={styles.detailCoverPress}>
            <CoverArt kind={activeCover} size="large" />
          </Pressable>

          <View style={styles.detailTitleRow}>
            <View style={styles.detailTitleCopy}>
              <Text style={[styles.detailTitle, activeProject.tracks.length === 0 && styles.emptyTitle]}>
                {activeProject.title}
              </Text>
              <Text style={styles.detailMeta}>
                {activeProject.locked ? 'locked ' : ''}
                {activeProject.owner} · {activeProject.tracks.length} tracks · {formatDuration(activeProject)}
              </Text>
            </View>
            {activeProject.tracks.length > 0 && (
              <Pressable onPress={toggleCurrentTrack} style={styles.detailPlay}>
                <Text style={styles.detailPlayText}>{status.playing ? '||' : '>'}</Text>
              </Pressable>
            )}
          </View>

          {activeProject.tracks.length > 0 ? (
            <>
              <Pressable onPress={() => setSheet('import')} style={styles.addTracksWide}>
                <Text style={styles.addTracksText}>+ Add tracks</Text>
              </Pressable>
              <View style={styles.trackList}>
                {activeProject.tracks.map((track, index) => (
                  <Pressable key={track.id} onPress={() => playTrack(track)} style={styles.trackRow}>
                    <Text style={styles.trackNumber}>{index + 1}</Text>
                    <View style={styles.trackCopy}>
                      <Text style={styles.trackTitle}>{track.title}</Text>
                      <Text style={styles.trackDate}>{track.added}</Text>
                    </View>
                    <Text style={styles.trackMenu}>...</Text>
                  </Pressable>
                ))}
              </View>
            </>
          ) : (
            <View style={styles.emptyActions}>
              <Pressable onPress={() => setSheet('import')} style={styles.emptyActionButton}>
                <Text style={styles.emptyActionText}>Convert</Text>
              </Pressable>
              <Pressable onPress={() => setSheet('import')} style={styles.emptyActionButton}>
                <Text style={styles.emptyActionText}>Import</Text>
              </Pressable>
              <Pressable onPress={() => setSheet('import')} style={styles.emptyActionButton}>
                <Text style={styles.recordDot}>●</Text>
                <Text style={styles.emptyActionText}>Record</Text>
              </Pressable>
            </View>
          )}
        </ScrollView>
      )}

      {screen === 'library' && (
        <Pressable onPress={() => setSheet('add')} style={styles.floatingAdd}>
          <Text style={styles.floatingAddText}>+ Add</Text>
        </Pressable>
      )}

      <Modal visible={sheet === 'add'} transparent animationType="fade" onRequestClose={() => setSheet('none')}>
        <Pressable style={styles.modalScrim} onPress={() => setSheet('none')}>
          <View style={styles.addSheet}>
            <Pressable onPress={() => setSheet('import')} style={styles.sheetRow}>
              <Text style={styles.sheetIcon}>||</Text>
              <Text style={styles.sheetText}>Import</Text>
            </Pressable>
            <Pressable onPress={() => setSheet('import')} style={styles.sheetRow}>
              <Text style={styles.sheetIcon}>[]</Text>
              <Text style={styles.sheetText}>Convert</Text>
            </Pressable>
            <Pressable onPress={() => setSheet('import')} style={styles.sheetRow}>
              <Text style={styles.recordDot}>●</Text>
              <Text style={styles.sheetText}>Record</Text>
            </Pressable>
            <View style={styles.sheetDivider} />
            <Pressable onPress={createUntitledProject} style={styles.sheetRow}>
              <Text style={styles.sheetIcon}>+</Text>
              <Text style={styles.sheetText}>Project</Text>
            </Pressable>
            <Pressable onPress={() => setSheet('none')} style={styles.sheetRow}>
              <Text style={styles.sheetIcon}>=</Text>
              <Text style={styles.sheetText}>Folder</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      <Modal visible={sheet === 'cover'} animationType="slide" onRequestClose={() => setSheet('none')}>
        <SafeAreaView style={styles.coverEditor}>
          <View style={styles.coverEditorTop}>
            <Text style={styles.coverEditorTitle}>Cover</Text>
            <Pressable onPress={() => setSheet('none')} style={styles.doneButton}>
              <Text style={styles.doneText}>Done</Text>
            </Pressable>
          </View>
          <View style={styles.coverEditorBody}>
            <CoverArt kind={activeCover} size="large" />
            <Text style={styles.coverEditorMeta}>Added Apr 18   Export</Text>
            <Pressable onPress={() => setSheet('import')} style={styles.coverSwatch}>
              <CoverArt kind={activeCover} size="mini" />
            </Pressable>
            <Pressable onPress={() => setSheet('import')} style={styles.addPhotoButton}>
              <Text style={styles.addPhotoText}>+ Add Photo</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </Modal>

      <Modal visible={sheet === 'import'} animationType="slide" onRequestClose={() => setSheet('none')}>
        <SafeAreaView style={styles.featuredModal}>
          <View style={styles.featuredTop}>
            <View style={styles.colorRing} />
            <Text style={styles.featuredTitle}>Featured</Text>
            <Pressable onPress={() => setSheet('none')} style={styles.closeButton}>
              <Text style={styles.closeText}>x</Text>
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.featuredGrid}>
            {featuredCovers.map((cover, index) => (
              <Pressable
                key={`${cover}-${index}`}
                onPress={() => {
                  setCoverChoice(cover);
                  setSheet(screen === 'project' ? 'cover' : 'none');
                }}
                style={styles.featuredTile}
              >
                <CoverArt kind={cover} size="mini" />
              </Pressable>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: '#111111',
  },
  libraryContent: {
    paddingBottom: 110,
    paddingHorizontal: 22,
    paddingTop: 24,
  },
  libraryHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  brand: {
    color: '#F2F2F2',
    fontSize: 21,
    fontWeight: '900',
    letterSpacing: 0,
  },
  headerActions: {
    flexDirection: 'row',
  },
  iconButton: {
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    height: 40,
    justifyContent: 'center',
    marginLeft: 9,
    minWidth: 40,
    paddingHorizontal: 10,
  },
  iconButtonText: {
    color: '#F2F2F2',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    marginBottom: 34,
    width: '47%',
  },
  cover: {
    aspectRatio: 1,
    backgroundColor: '#202020',
    borderRadius: 8,
    overflow: 'hidden',
    width: '100%',
  },
  coverLarge: {
    alignSelf: 'center',
    width: '88%',
  },
  coverMini: {
    height: 70,
    width: 70,
  },
  cardPlay: {
    alignItems: 'center',
    backgroundColor: '#4A4A4A',
    borderRadius: 8,
    bottom: 0,
    height: 40,
    justifyContent: 'center',
    position: 'absolute',
    right: 0,
    width: 40,
  },
  cardPlayText: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '900',
    letterSpacing: 0,
  },
  cardTitle: {
    color: '#F5F5F5',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0,
    marginTop: 10,
  },
  cardMetaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardMeta: {
    color: '#8E8E8E',
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0,
  },
  ellipsis: {
    color: '#CFCFCF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0,
  },
  detailContent: {
    paddingBottom: 54,
    paddingHorizontal: 22,
    paddingTop: 24,
  },
  detailTopBar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 27,
  },
  detailActions: {
    flexDirection: 'row',
  },
  detailCoverPress: {
    marginBottom: 28,
  },
  detailTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 17,
  },
  detailTitleCopy: {
    flex: 1,
    paddingRight: 14,
  },
  detailTitle: {
    color: '#FFFFFF',
    fontSize: 27,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 32,
  },
  emptyTitle: {
    color: '#7E7E7E',
  },
  detailMeta: {
    color: '#8B8B8B',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0,
    marginTop: 6,
  },
  detailPlay: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    height: 45,
    justifyContent: 'center',
    width: 45,
  },
  detailPlayText: {
    color: '#111111',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 0,
  },
  addTracksWide: {
    alignItems: 'center',
    backgroundColor: '#202020',
    borderRadius: 8,
    height: 41,
    justifyContent: 'center',
    marginBottom: 18,
  },
  addTracksText: {
    color: '#F2F2F2',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0,
  },
  trackList: {
    paddingTop: 2,
  },
  trackRow: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingVertical: 13,
  },
  trackNumber: {
    color: '#8A8A8A',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0,
    width: 34,
  },
  trackCopy: {
    flex: 1,
  },
  trackTitle: {
    color: '#F3F3F3',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0,
  },
  trackDate: {
    color: '#838383',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0,
    marginTop: 3,
  },
  trackMenu: {
    color: '#E8E8E8',
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 0,
  },
  emptyActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  emptyActionButton: {
    alignItems: 'center',
    backgroundColor: '#202020',
    borderRadius: 8,
    flexDirection: 'row',
    height: 41,
    justifyContent: 'center',
    width: '31%',
  },
  emptyActionText: {
    color: '#E8E8E8',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0,
  },
  recordDot: {
    color: '#EF4056',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0,
    marginRight: 7,
  },
  floatingAdd: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#2B2B2B',
    borderRadius: 8,
    bottom: 31,
    height: 52,
    justifyContent: 'center',
    position: 'absolute',
    width: 192,
  },
  floatingAddText: {
    color: '#F2F2F2',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0,
  },
  modalScrim: {
    backgroundColor: 'rgba(0,0,0,0.14)',
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 78,
  },
  addSheet: {
    alignSelf: 'center',
    backgroundColor: '#303030',
    borderRadius: 8,
    paddingVertical: 12,
    width: 224,
  },
  sheetRow: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 39,
    paddingHorizontal: 20,
  },
  sheetIcon: {
    color: '#D9D9D9',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0,
    marginRight: 16,
    width: 18,
  },
  sheetText: {
    color: '#E9E9E9',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0,
  },
  sheetDivider: {
    backgroundColor: '#3B3B3B',
    height: 1,
    marginVertical: 8,
  },
  coverEditor: {
    flex: 1,
    backgroundColor: '#121212',
  },
  coverEditorTop: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingTop: 22,
  },
  coverEditorTitle: {
    color: '#F2F2F2',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 0,
  },
  doneButton: {
    alignItems: 'center',
    backgroundColor: '#222222',
    borderRadius: 8,
    height: 40,
    justifyContent: 'center',
    width: 58,
  },
  doneText: {
    color: '#F2F2F2',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0,
  },
  coverEditorBody: {
    alignItems: 'center',
    paddingTop: 86,
  },
  coverEditorMeta: {
    color: '#8A8A8A',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0,
    marginTop: 22,
  },
  coverSwatch: {
    borderColor: '#F2F2F2',
    borderRadius: 8,
    borderWidth: 3,
    marginTop: 84,
    padding: 3,
  },
  addPhotoButton: {
    alignItems: 'center',
    backgroundColor: '#202020',
    borderRadius: 8,
    height: 41,
    justifyContent: 'center',
    marginTop: 28,
    width: '88%',
  },
  addPhotoText: {
    color: '#F2F2F2',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0,
  },
  featuredModal: {
    flex: 1,
    backgroundColor: '#121212',
  },
  featuredTop: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingTop: 22,
  },
  colorRing: {
    borderColor: '#6FAD3C',
    borderRadius: 16,
    borderWidth: 2,
    height: 32,
    width: 32,
  },
  featuredTitle: {
    color: '#F2F2F2',
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 0,
  },
  closeButton: {
    alignItems: 'center',
    backgroundColor: '#272727',
    borderRadius: 8,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  closeText: {
    color: '#F2F2F2',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0,
  },
  featuredGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 22,
  },
  featuredTile: {
    marginBottom: 10,
    width: '22%',
  },
  sketchCover: {
    backgroundColor: '#CBC4B6',
    flex: 1,
  },
  sketchHead: {
    backgroundColor: '#050505',
    borderRadius: 8,
    height: '8%',
    left: '46%',
    position: 'absolute',
    top: '11%',
    width: '8%',
  },
  sketchBody: {
    backgroundColor: '#050505',
    height: '30%',
    left: '43%',
    position: 'absolute',
    top: '25%',
    transform: [{ rotate: '-9deg' }],
    width: '16%',
  },
  sketchArmLeft: {
    backgroundColor: '#050505',
    height: '7%',
    left: '32%',
    position: 'absolute',
    top: '33%',
    transform: [{ rotate: '-29deg' }],
    width: '20%',
  },
  sketchArmRight: {
    backgroundColor: '#050505',
    height: '7%',
    left: '55%',
    position: 'absolute',
    top: '35%',
    transform: [{ rotate: '27deg' }],
    width: '22%',
  },
  sketchLegLeft: {
    backgroundColor: '#050505',
    height: '7%',
    left: '41%',
    position: 'absolute',
    top: '58%',
    transform: [{ rotate: '35deg' }],
    width: '18%',
  },
  sketchLegRight: {
    backgroundColor: '#050505',
    height: '7%',
    left: '52%',
    position: 'absolute',
    top: '61%',
    transform: [{ rotate: '-24deg' }],
    width: '18%',
  },
  windowCover: {
    backgroundColor: '#0F2B22',
    flex: 1,
  },
  windowGlow: {
    backgroundColor: '#E9CFB8',
    height: '44%',
    position: 'absolute',
    right: '10%',
    top: '22%',
    width: '26%',
  },
  windowPane: {
    backgroundColor: '#111111',
    height: '44%',
    position: 'absolute',
    right: '23%',
    top: '22%',
    width: 3,
  },
  windowDark: {
    backgroundColor: 'rgba(0,0,0,0.42)',
    height: '100%',
    left: 0,
    position: 'absolute',
    width: '52%',
  },
  cassetteCover: {
    backgroundColor: '#E5DECD',
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 7,
  },
  doodleText: {
    color: '#777066',
    fontSize: 7,
    fontWeight: '900',
    height: 18,
    letterSpacing: 0,
    marginRight: 7,
  },
  cassette: {
    backgroundColor: '#B65D3A',
    borderColor: '#161616',
    borderRadius: 3,
    borderWidth: 2,
    height: '32%',
    left: '24%',
    position: 'absolute',
    top: '34%',
    width: '55%',
  },
  cassetteLabel: {
    backgroundColor: '#EFEBD6',
    color: '#111111',
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 0,
    marginHorizontal: 8,
    marginTop: 4,
    textAlign: 'center',
  },
  cassetteTape: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  reel: {
    backgroundColor: '#F4F4F4',
    borderColor: '#111111',
    borderRadius: 8,
    borderWidth: 2,
    height: 16,
    width: 16,
  },
  blankCover: {
    backgroundColor: '#DCD8EA',
    flex: 1,
  },
  treeCover: {
    backgroundColor: '#9A914C',
    flex: 1,
  },
  treeHole: {
    backgroundColor: '#4B361C',
    borderRadius: 8,
    height: '34%',
    left: '42%',
    position: 'absolute',
    top: '28%',
    width: '25%',
  },
  treeSmallMark: {
    backgroundColor: '#64B8C8',
    borderRadius: 7,
    bottom: '27%',
    height: 14,
    left: '44%',
    position: 'absolute',
    width: 14,
  },
  cloudCover: {
    backgroundColor: '#ECECEC',
    flex: 1,
  },
  cloudLine: {
    backgroundColor: '#232323',
    height: 3,
    left: '18%',
    position: 'absolute',
    top: '52%',
    width: '70%',
  },
  cloudLineShort: {
    top: '65%',
    width: '42%',
  },
  cloudDot: {
    backgroundColor: '#E55B3C',
    borderRadius: 8,
    height: 16,
    left: '29%',
    position: 'absolute',
    top: '38%',
    width: 16,
  },
});
