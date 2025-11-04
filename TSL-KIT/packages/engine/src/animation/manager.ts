import type { Framegraph } from '../core/framegraph'; 

export interface AnimationTrack {
  update(delta: number): void
  dispose?(): void
}

export class AnimationManager {
  private tracks: Set<AnimationTrack> = new Set()

  add(track: AnimationTrack): AnimationTrack {
    this.tracks.add(track)
    return track
  }

  remove(track: AnimationTrack): void {
    if (this.tracks.delete(track)) {
      track.dispose?.()
    }
  }

  clear(): void {
    for (const track of this.tracks) {
      track.dispose?.()
    }
    this.tracks.clear()
  }

  update(delta: number): void {
    for (const track of this.tracks) {
      track.update(delta)
    }
  }
}

export interface AnimationPassOptions {
  name?: string
}

export function createAnimationPass(manager: AnimationManager, options: AnimationPassOptions = {}) {
  return {
    name: options.name ?? 'animation',
    priority: -100,
    exec: (context: Parameters<Framegraph['addPass']>[0]['exec']) => {
      const typedContext = context as Parameters<Framegraph['addPass']>[0]['exec']
      manager.update((typedContext as any).delta ?? 0)
    },
  }
}


