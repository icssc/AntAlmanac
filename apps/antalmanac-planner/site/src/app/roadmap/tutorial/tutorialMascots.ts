import type { StaticImageData } from 'next/image';

import anteaterCelebrate from '../../../asset/tutorial-anteater-celebrate.png';
import anteaterOver from '../../../asset/tutorial-anteater-over.png';
import anteaterTeach from '../../../asset/tutorial-anteater-teach.png';
import anteaterThinking from '../../../asset/tutorial-anteater-thinking.png';
import anteaterWave from '../../../asset/tutorial-anteater-wave.png';

export const tutorialMascots = {
    celebrate: anteaterCelebrate,
    over: anteaterOver,
    teach: anteaterTeach,
    thinking: anteaterThinking,
    wave: anteaterWave,
} as const satisfies Record<string, StaticImageData>;
