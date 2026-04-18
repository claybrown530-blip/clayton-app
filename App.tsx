import { StatusBar } from 'expo-status-bar';
import { AudioSource, setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type Track = {
  id: string;
  title: string;
  kind: string;
  version: string;
  duration: string;
  bpm: string;
  key: string;
  note: string;
  source: AudioSource;
};

type Project = {
  id: string;
  title: string;
  format: string;
  phase: string;
  updated: string;
  palette: {
    paper: string;
    ink: string;
    accent: string;
  };
  logline: string;
  tracks: Track[];
};

const projects: Project[] = [
  {
    id: 'stratford-ave',
    title: 'Stratford Ave',
    format: 'Demo tape',
    phase: 'writing',
    updated: 'Apr 18',
    palette: {
      paper: '#F7F7F2',
      ink: '#141414',
      accent: '#D64933',
    },
    logline: 'Bedroom takes, voice memos, fragments that already feel like a place.',
    tracks: [
      {
        id: 'stratford-74',
        title: 'Stratford Ave 74',
        kind: 'voice memo',
        version: 'take 74',
        duration: 'local m4a',
        bpm: 'free',
        key: 'open',
        note: 'Main sketch for the opening world. Keep the loose pocket.',
        source: require('./assets/audio/stratford-ave-74.m4a'),
      },
      {
        id: 'stratford-76',
        title: 'Stratford Ave 76',
        kind: 'boardtape',
        version: 'take 76',
        duration: 'local m4a',
        bpm: 'free',
        key: 'open',
        note: 'Companion pass. Listen for the second-half lift.',
        source: require('./assets/audio/stratford-ave-76.m4a'),
      },
    ],
  },
  {
    id: 'clayton-core',
    title: 'CLAYTON',
    format: 'Artist OS',
    phase: 'foundation',
    updated: 'Today',
    palette: {
      paper: '#101010',
      ink: '#FAFAFA',
      accent: '#7BD88F',
    },
    logline: 'The living shelf for music, visuals, references, show ideas, and finished worlds.',
    tracks: [
      {
        id: 'clayton-placeholder',
        title: 'New idea slot',
        kind: 'capture',
        version: 'empty',
        duration: 'pending',
        bpm: 'set later',
        key: 'set later',
        note: 'Drop the next demo here once Supabase storage is linked.',
        source: null,
      },
    ],
  },
];

const lanes = ['Music', 'Tape Room', 'World', 'Ops'];

function formatClock(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return '0:00';
  }

  const minutes = Math.floor(seconds / 60);
  const remaining = Math.floor(seconds % 60)
    .toString()
    .padStart(2, '0');

  return `${minutes}:${remaining}`;
}

export default function App() {
  const [activeLane, setActiveLane] = useState(lanes[0]);
  const [activeProjectId, setActiveProjectId] = useState(projects[0].id);
  const [activeTrackId, setActiveTrackId] = useState(projects[0].tracks[0].id);
  const player = useAudioPlayer(null, { updateInterval: 250 });
  const status = useAudioPlayerStatus(player);

  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      interruptionMode: 'doNotMix',
    }).catch(() => undefined);
  }, []);

  const activeProject = useMemo(
    () => projects.find((project) => project.id === activeProjectId) ?? projects[0],
    [activeProjectId],
  );

  const activeTrack = useMemo(
    () => activeProject.tracks.find((track) => track.id === activeTrackId) ?? activeProject.tracks[0],
    [activeProject, activeTrackId],
  );

  const progress = status.duration > 0 ? Math.min(status.currentTime / status.duration, 1) : 0;
  const canPlay = Boolean(activeTrack.source);

  function selectProject(project: Project) {
    setActiveProjectId(project.id);
    setActiveTrackId(project.tracks[0].id);
    player.pause();

    if (project.tracks[0].source) {
      player.replace(project.tracks[0].source);
    }
  }

  function selectTrack(track: Track) {
    setActiveTrackId(track.id);

    if (track.source) {
      player.replace(track.source);
    } else {
      player.pause();
    }
  }

  function togglePlayback() {
    if (!canPlay) {
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

  return (
    <SafeAreaView style={styles.shell}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <View>
            <Text style={styles.kicker}>CLAYTON</Text>
            <Text style={styles.title}>Tape room</Text>
          </View>
          <View style={styles.syncPill}>
            <View style={styles.syncDot} />
            <Text style={styles.syncText}>local</Text>
          </View>
        </View>

        <View style={styles.laneRow}>
          {lanes.map((lane) => {
            const isActive = lane === activeLane;

            return (
              <Pressable
                key={lane}
                onPress={() => setActiveLane(lane)}
                style={[styles.laneButton, isActive && styles.laneButtonActive]}
              >
                <Text style={[styles.laneText, isActive && styles.laneTextActive]}>{lane}</Text>
              </Pressable>
            );
          })}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.projectRail}
        >
          {projects.map((project) => {
            const isActive = project.id === activeProject.id;

            return (
              <Pressable
                key={project.id}
                onPress={() => selectProject(project)}
                style={[
                  styles.projectCard,
                  isActive && styles.projectCardActive,
                  { backgroundColor: project.palette.paper },
                ]}
              >
                <Text style={[styles.projectFormat, { color: project.palette.accent }]}>
                  {project.format}
                </Text>
                <Text style={[styles.projectTitle, { color: project.palette.ink }]} numberOfLines={2}>
                  {project.title}
                </Text>
                <Text style={[styles.projectMeta, { color: project.palette.ink }]}>
                  {project.phase} / {project.updated}
                </Text>
                <View style={[styles.artMark, { borderColor: project.palette.accent }]}>
                  <Text style={[styles.artMarkText, { color: project.palette.ink }]}>
                    {project.title.slice(0, 2).toUpperCase()}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.nowPlaying}>
          <View style={styles.nowPlayingHeader}>
            <View style={styles.coverStack}>
              <View style={[styles.coverBack, { backgroundColor: activeProject.palette.accent }]} />
              <View style={[styles.coverFront, { backgroundColor: activeProject.palette.paper }]}>
                <Text style={[styles.coverText, { color: activeProject.palette.ink }]}>
                  {activeProject.title.slice(0, 2).toUpperCase()}
                </Text>
              </View>
            </View>
            <View style={styles.nowText}>
              <Text style={styles.nowLabel}>{activeLane}</Text>
              <Text style={styles.nowTitle} numberOfLines={2}>
                {activeTrack.title}
              </Text>
              <Text style={styles.nowSub}>
                {activeProject.title} / {activeTrack.version}
              </Text>
            </View>
          </View>

          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
          <View style={styles.timeRow}>
            <Text style={styles.timeText}>{formatClock(status.currentTime)}</Text>
            <Text style={styles.timeText}>
              {status.duration > 0 ? formatClock(status.duration) : activeTrack.duration}
            </Text>
          </View>

          <View style={styles.playerControls}>
            <Pressable
              onPress={() => canPlay && player.seekTo(Math.max(status.currentTime - 10, 0))}
              style={[styles.smallControl, !canPlay && styles.controlDisabled]}
            >
              <Text style={styles.smallControlText}>-10</Text>
            </Pressable>
            <Pressable
              onPress={togglePlayback}
              style={[styles.playButton, !canPlay && styles.controlDisabled]}
            >
              <Text style={styles.playText}>{status.playing ? 'Pause' : 'Play'}</Text>
            </Pressable>
            <Pressable
              onPress={() => canPlay && player.seekTo(status.currentTime + 10)}
              style={[styles.smallControl, !canPlay && styles.controlDisabled]}
            >
              <Text style={styles.smallControlText}>+10</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Project sequence</Text>
          <Text style={styles.sectionMeta}>{activeProject.tracks.length} slots</Text>
        </View>

        <View style={styles.trackList}>
          {activeProject.tracks.map((track, index) => {
            const isActive = track.id === activeTrack.id;

            return (
              <Pressable
                key={track.id}
                onPress={() => selectTrack(track)}
                style={[styles.trackRow, isActive && styles.trackRowActive]}
              >
                <Text style={[styles.trackNumber, isActive && styles.trackNumberActive]}>
                  {(index + 1).toString().padStart(2, '0')}
                </Text>
                <View style={styles.trackCopy}>
                  <Text style={styles.trackTitle}>{track.title}</Text>
                  <Text style={styles.trackMeta}>
                    {track.kind} / {track.bpm} / {track.key}
                  </Text>
                  <Text style={styles.trackNote}>{track.note}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.pipeline}>
          <Text style={styles.pipelineTitle}>Build queue</Text>
          <View style={styles.pipelineRow}>
            <Text style={styles.pipelineStep}>01</Text>
            <Text style={styles.pipelineCopy}>Local phone playback is active through Expo.</Text>
          </View>
          <View style={styles.pipelineRow}>
            <Text style={styles.pipelineStep}>02</Text>
            <Text style={styles.pipelineCopy}>Supabase schema is ready for projects, tracks, and assets.</Text>
          </View>
          <View style={styles.pipelineRow}>
            <Text style={styles.pipelineStep}>03</Text>
            <Text style={styles.pipelineCopy}>Next pass: upload demos from the phone and sync release shelves.</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: '#080808',
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingBottom: 40,
  },
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 18,
    paddingTop: 14,
  },
  kicker: {
    color: '#F2F2EA',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 38,
  },
  syncPill: {
    alignItems: 'center',
    borderColor: '#2F2F2F',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  syncDot: {
    backgroundColor: '#7BD88F',
    borderRadius: 4,
    height: 8,
    marginRight: 7,
    width: 8,
  },
  syncText: {
    color: '#F2F2EA',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  laneRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 18,
  },
  laneButton: {
    borderColor: '#292929',
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
    marginRight: 8,
    paddingHorizontal: 13,
    paddingVertical: 9,
  },
  laneButtonActive: {
    backgroundColor: '#F2F2EA',
    borderColor: '#F2F2EA',
  },
  laneText: {
    color: '#A9A9A0',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0,
  },
  laneTextActive: {
    color: '#080808',
  },
  projectRail: {
    paddingBottom: 20,
  },
  projectCard: {
    borderRadius: 8,
    height: 190,
    justifyContent: 'space-between',
    marginRight: 12,
    padding: 16,
    width: 158,
  },
  projectCardActive: {
    borderColor: '#FFFFFF',
    borderWidth: 2,
  },
  projectFormat: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  projectTitle: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 26,
  },
  projectMeta: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0,
    opacity: 0.7,
    textTransform: 'uppercase',
  },
  artMark: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: 8,
    borderWidth: 2,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  artMarkText: {
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0,
  },
  nowPlaying: {
    backgroundColor: '#151515',
    borderColor: '#2D2D2D',
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
  },
  nowPlayingHeader: {
    flexDirection: 'row',
    marginBottom: 18,
  },
  coverStack: {
    height: 88,
    marginRight: 14,
    width: 88,
  },
  coverBack: {
    borderRadius: 8,
    height: 76,
    left: 8,
    position: 'absolute',
    top: 0,
    width: 76,
  },
  coverFront: {
    alignItems: 'center',
    borderRadius: 8,
    height: 76,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    top: 10,
    width: 76,
  },
  coverText: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 0,
  },
  nowText: {
    flex: 1,
    justifyContent: 'center',
  },
  nowLabel: {
    color: '#D64933',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  nowTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 28,
  },
  nowSub: {
    color: '#A9A9A0',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0,
    marginTop: 4,
  },
  progressTrack: {
    backgroundColor: '#2B2B2B',
    borderRadius: 8,
    height: 8,
    overflow: 'hidden',
  },
  progressFill: {
    backgroundColor: '#7BD88F',
    height: 8,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  timeText: {
    color: '#A9A9A0',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0,
  },
  playerControls: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 18,
  },
  smallControl: {
    alignItems: 'center',
    borderColor: '#383838',
    borderRadius: 8,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 58,
  },
  smallControlText: {
    color: '#F2F2EA',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0,
  },
  playButton: {
    alignItems: 'center',
    backgroundColor: '#F2F2EA',
    borderRadius: 8,
    height: 50,
    justifyContent: 'center',
    marginHorizontal: 12,
    width: 128,
  },
  playText: {
    color: '#080808',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  controlDisabled: {
    opacity: 0.35,
  },
  sectionHeader: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    marginTop: 28,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 0,
  },
  sectionMeta: {
    color: '#A9A9A0',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  trackList: {
    marginBottom: 22,
  },
  trackRow: {
    backgroundColor: '#111111',
    borderColor: '#252525',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 10,
    padding: 13,
  },
  trackRowActive: {
    borderColor: '#F2F2EA',
  },
  trackNumber: {
    color: '#5F5F5A',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0,
    marginRight: 12,
    marginTop: 2,
    width: 28,
  },
  trackNumberActive: {
    color: '#7BD88F',
  },
  trackCopy: {
    flex: 1,
  },
  trackTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0,
    marginBottom: 4,
  },
  trackMeta: {
    color: '#A9A9A0',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  trackNote: {
    color: '#D7D7CF',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0,
    lineHeight: 18,
  },
  pipeline: {
    backgroundColor: '#F2F2EA',
    borderRadius: 8,
    padding: 16,
  },
  pipelineTitle: {
    color: '#080808',
    fontSize: 19,
    fontWeight: '900',
    letterSpacing: 0,
    marginBottom: 12,
  },
  pipelineRow: {
    borderTopColor: '#D5D5CC',
    borderTopWidth: 1,
    flexDirection: 'row',
    paddingVertical: 11,
  },
  pipelineStep: {
    color: '#D64933',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0,
    marginRight: 12,
    width: 28,
  },
  pipelineCopy: {
    color: '#080808',
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0,
    lineHeight: 19,
  },
});
