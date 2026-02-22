import { create } from 'zustand';

interface SceneState {
    pointer: { x: number; y: number };
    scrollY: number;
    setPointer: (x: number, y: number) => void;
    setScrollY: (y: number) => void;
}

export const useSceneStore = create<SceneState>((set) => ({
    pointer: { x: 0, y: 0 },
    scrollY: 0,
    setPointer: (x, y) => set({ pointer: { x, y } }),
    setScrollY: (y) => set({ scrollY: y }),
}));
