import React from 'react';
import { TextureLoader, FrontSide } from 'three';
import PropTypes from 'prop-types';
import Constants from '../constants';
import { env } from '../utils/Environment';

export default class TextureContainer extends React.Component {

    static propTypes = {
        side: PropTypes.number,
        textures: PropTypes.array,
        transparent: PropTypes.bool
    }

    componentWillMount = () => {
        this.loadedTextures = [];
    }

    componentDidMount = () => {
        this.enqueueTextures(this.props.textures);
    }

    /**
     * Applies the given texture onto the material element.
     *
     * @param {Texture} texture - instance of THREE.Texture
     */
    onTextureLoaded = (textureData) => {
        this.loadedTextures.push(textureData);
    }

    /**
     * Enqueues the given texture set into the default THREE loader.
     *
     * @param {Object} prop
     * @param {String} prop.url - url of the texture to load
     */
    loadTexture = ({ url, slot }) => {
        url = env(`/static/textures/map/${url}`);

        const loader = new TextureLoader();
        const cb = () => this.onTextureLoaded({ url, slot });
        const noop = () => { };

        loader.load(url, cb, noop, cb);
    }

    /**
     * Calls loadTexture() on each texture set.
     *
     * @param {Object[]} textures - list of texture sets
     */
    enqueueTextures = (textures) => {
        if (Array.isArray(textures)) {
            textures.forEach(this.loadTexture);
        }
    }

    /**
     * Creates texture components from the loaded textures.
     *
     * @returns {Texture[]} array of texture components
     */
    getTextures = () => {
        return this
            .loadedTextures
            .map(({ slot, url }, key) => {
                return <texture
                    url={url}
                    slot={slot}
                    key={key}
                    onLoad={this.updateMaterial}
                />
            });
    }

    /**
     * Flags material + assets to update on next animation frame.
     */
    updateMaterial = () => {
        const { material } = this.refs;

        if (material.map) {
            material.map.needsUpdate = true;
        }
        material.needsUpdate = true;
    }

    render() {
        return (
            <meshLambertMaterial
                color={Constants.WebGL.MESH_DEFAULT_COLOR}
                children={this.getTextures()}
                transparent={this.props.transparent}
                side={this.props.side || FrontSide}
                ref="material"
            />
        );
    }
}
