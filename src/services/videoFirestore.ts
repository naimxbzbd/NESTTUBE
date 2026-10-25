import {
  db,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  handleFirestoreError,
  OperationType,
} from '../firebase';
import { FirestoreVideo, VideoReport, PlatformMetrics, AppUserProfile, UserRole } from '../types/auth';

export async function createFirestoreVideo(videoData: Omit<FirestoreVideo, 'id' | 'createdAt' | 'views' | 'likes'>): Promise<FirestoreVideo> {
  const newId = `vid_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const videoDocRef = doc(db, 'videos', newId);

  const video: FirestoreVideo = {
    ...videoData,
    id: newId,
    views: 0,
    likes: 0,
    status: 'approved',
    createdAt: new Date().toISOString(),
  };

  try {
    await setDoc(videoDocRef, video);
    return video;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `videos/${newId}`);
  }
}

export async function getCreatorVideos(uploaderUid: string): Promise<FirestoreVideo[]> {
  try {
    const q = query(
      collection(db, 'videos'),
      where('uploaderUid', '==', uploaderUid)
    );
    const snap = await getDocs(q);
    const videos: FirestoreVideo[] = [];
    snap.forEach((d) => {
      videos.push(d.data() as FirestoreVideo);
    });
    // Sort in memory by createdAt descending
    return videos.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'videos');
  }
}

export async function updateFirestoreVideo(videoId: string, updates: Partial<FirestoreVideo>): Promise<void> {
  const videoDocRef = doc(db, 'videos', videoId);
  try {
    await updateDoc(videoDocRef, updates);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `videos/${videoId}`);
  }
}

export async function deleteFirestoreVideo(videoId: string): Promise<void> {
  const videoDocRef = doc(db, 'videos', videoId);
  try {
    await deleteDoc(videoDocRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `videos/${videoId}`);
  }
}

export async function getPublicVideos(maxLimit: number = 30): Promise<FirestoreVideo[]> {
  try {
    const q = query(
      collection(db, 'videos'),
      where('visibility', '==', 'public'),
      limit(maxLimit)
    );
    const snap = await getDocs(q);
    const videos: FirestoreVideo[] = [];
    snap.forEach((d) => {
      const v = d.data() as FirestoreVideo;
      if (v.status === 'approved' || !v.status) {
        videos.push(v);
      }
    });
    return videos.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'videos');
  }
}

export async function incrementVideoViews(videoId: string): Promise<void> {
  const videoDocRef = doc(db, 'videos', videoId);
  try {
    const snap = await getDoc(videoDocRef);
    if (snap.exists()) {
      const curViews = snap.data().views || 0;
      await updateDoc(videoDocRef, { views: curViews + 1 });
    }
  } catch (err) {
    // Non-blocking for viewer
    console.warn('View increment warning:', err);
  }
}

// Moderation & Reporting
export async function reportVideo(
  videoId: string,
  videoTitle: string,
  reason: string,
  reportedByUid: string,
  reportedByEmail: string
): Promise<void> {
  const reportId = `rep_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const reportRef = doc(db, 'reports', reportId);
  const newReport: VideoReport = {
    id: reportId,
    videoId,
    videoTitle,
    reason,
    reportedByUid,
    reportedByEmail,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  try {
    await setDoc(reportRef, newReport);
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `reports/${reportId}`);
  }
}

// Admin API Functions
export async function adminGetAllUsers(): Promise<AppUserProfile[]> {
  try {
    const snap = await getDocs(collection(db, 'users'));
    const list: AppUserProfile[] = [];
    snap.forEach((d) => list.push(d.data() as AppUserProfile));
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'users');
  }
}

export async function adminUpdateUserRole(uid: string, newRole: UserRole, email?: string): Promise<void> {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, { role: newRole, updatedAt: new Date().toISOString() });

    const adminRef = doc(db, 'admins', uid);
    if (newRole === 'admin') {
      await setDoc(adminRef, {
        uid,
        email: email || '',
        role: 'admin',
        grantedAt: new Date().toISOString(),
      });
    } else {
      await deleteDoc(adminRef).catch(() => {});
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `users/${uid}`);
  }
}

export async function adminGetAllVideos(): Promise<FirestoreVideo[]> {
  try {
    const snap = await getDocs(collection(db, 'videos'));
    const list: FirestoreVideo[] = [];
    snap.forEach((d) => list.push(d.data() as FirestoreVideo));
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'videos');
  }
}

export async function adminUpdateVideoStatus(videoId: string, status: FirestoreVideo['status']): Promise<void> {
  const videoDocRef = doc(db, 'videos', videoId);
  try {
    await updateDoc(videoDocRef, { status });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `videos/${videoId}`);
  }
}

export async function adminGetAllReports(): Promise<VideoReport[]> {
  try {
    const snap = await getDocs(collection(db, 'reports'));
    const list: VideoReport[] = [];
    snap.forEach((d) => list.push(d.data() as VideoReport));
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'reports');
  }
}

export async function adminUpdateReportStatus(reportId: string, status: VideoReport['status']): Promise<void> {
  const ref = doc(db, 'reports', reportId);
  try {
    await updateDoc(ref, { status });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `reports/${reportId}`);
  }
}
