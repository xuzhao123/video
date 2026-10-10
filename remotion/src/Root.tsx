import React from 'react';
import {Composition} from 'remotion';
import {LESSON01_FRAMES, Lesson01} from './lesson01/Lesson01';
import {PILOT_FRAMES, Pilot} from './pilot/Pilot';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Lesson01" component={Lesson01} durationInFrames={LESSON01_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="Pilot" component={Pilot} durationInFrames={PILOT_FRAMES} fps={30} width={1920} height={1080} />
  </>
);
