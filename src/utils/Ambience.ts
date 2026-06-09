import { AudioListener, AudioLoader, Audio } from 'three';
import { env } from '../utils/Environment';

export default class Ambience extends AudioListener {

    constructor(camera) {
        super();
        this.sound = new Audio(this);
        this.loader.load(env('/static/audio/ambience.mp3'), this.loaded);
        camera.add(this);
    }

    /**
     * Audio loader.
     * @type {AudioLoader}
     */
    loader = new AudioLoader()

    /**
     * Sound loader onloaded callback.
     *
     * @param {Buffer} buffer - audio buffer array
     */
    loaded = (buffer) => {
        this.sound.setBuffer(buffer);
        this.sound.setLoop(true);
    }

    /**
     * Sets the volume to the given level.
     * If the volume is 0, the audio is paued.
     * Otherwise, the audio is playing.
     *
     * @param {Number} volume - volume level [0,1]
     */
    setVolume = (volume) => {
        if (volume) {
            this.sound.play();
        } else {
            this.sound.pause();
        }
        this.sound.setVolume(volume);
    }
}
