import { Task } from '../types/task';

export function mergeRemoteWithLocalStarred(
  remoteTasks: Task[],
  localTasks: Task[]
): Task[] {
  // Map of local task ID -> starred boolean status
  const starredMap = new Map<string, boolean>();
  for (const t of localTasks) {
    if (t.is_starred) {
      starredMap.set(t.id, true);
    }
  }

  // Merge remote tasks keeping local starred flag intact
  return remoteTasks.map((remoteTask) => ({
    ...remoteTask,
    is_starred: starredMap.get(remoteTask.id) ?? false,
  }));
}
